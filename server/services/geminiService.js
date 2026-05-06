import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

// --- AI Fallback Logic ---

const LOGICAL_MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemma-3-27b-it",
  "gemma-3-12b-it",
];

const DAILY_LIMITS = {
  "gemini-3-flash-preview": 20,
  "gemini-2.5-flash": 20,
  "gemini-2.5-flash-lite": 20,
  "gemma-3-27b-it": 14400,
  "gemma-3-12b-it": 14400,
};

const usage = {};
const today = () => new Date().toISOString().slice(0, 10);

function getUsage(model) {
  if (!usage[model] || usage[model].date !== today()) {
    usage[model] = { date: today(), count: 0 };
  }
  return usage[model].count;
}

function incrementUsage(model) {
  getUsage(model);
  usage[model].count++;
}

function pickModel() {
  for (const m of LOGICAL_MODELS) {
    if (getUsage(m) < DAILY_LIMITS[m]) return m;
  }
  return null;
}

function isQuotaError(e) {
  const msg = String(e);
  return msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
}

function isNotFoundError(e) {
  const msg = String(e);
  return msg.includes("404") || msg.includes("NOT_FOUND");
}

function isOverloadError(e) {
  const msg = String(e);
  return msg.includes("503") || msg.includes("UNAVAILABLE");
}

function cleanJsonResponse(text) {
  try {
    let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      cleaned = arrayMatch[0];
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("JSON parse failed, attempting repair...");
    const objects = text.match(/\{[^{}]*\}/g) || [];
    if (objects.length > 0) {
      return objects.map(obj => JSON.parse(obj));
    }
    return [];
  }
}

const LEVEL_SCHEMA = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            title: { type: "STRING", description: "Short, motivating title" },
            description: { type: "STRING", description: "1-2 sentences, actionable" },
            tasks: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "3-5 checklist actions"
            },
            estimatedTime: { type: "STRING", description: "Realistic time" },
            tips: { type: "STRING", description: "Insider advice" },
            resources: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        url: { type: "STRING" }
                    }
                },
                description: "Relevant resources"
            }
        },
        required: ["title", "description", "tasks", "estimatedTime"]
    }
};

async function generateWithRotation(promptText) {
  const attempted = [];

  while (attempted.length < LOGICAL_MODELS.length) {
    const model = pickModel();
    if (!model || attempted.includes(model)) continue;

    attempted.push(model);
    const isGemma = model.startsWith("gemma");
    console.log(`Generating plan with ${model}...`);

    try {
      const res = await ai.models.generateContent({
        model,
        contents: [
            {
                role: "user",
                parts: [{ text: promptText }],
            },
        ],
        config: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          ...(!isGemma && {
            responseMimeType: "application/json",
            responseSchema: LEVEL_SCHEMA,
          }),
        },
      });

      const text = res.text || (res.candidates && res.candidates[0]?.content?.parts?.[0]?.text) || "[]";

      // Validate it's parseable and attempt repair if truncated before returning
      const parsedResponse = cleanJsonResponse(text);

      incrementUsage(model);
      return parsedResponse;

    } catch (err) {
      console.warn(`❌ ${model} failed:`, err.message || err);
      if (isNotFoundError(err) || isQuotaError(err) || isOverloadError(err)) {
        continue; // Try next model
      }
      // Log other errors and try next model
      continue;
    }
  }
  throw new Error("All models failed or are overloaded.");
}

// --- Main Service Logic ---

export const generateLevelPlan = async (
    goal,
    category,
    difficulty,
    levelCount
) => {
    if (!apiKey) {
        throw new Error("Server missing GEMINI_API_KEY");
    }

    const prompt = `
You are a senior product designer and curriculum architect
who specializes in building addictive, gamified learning systems.

This roadmap will be used inside a real application, not a blog.
Every level must feel purposeful, progressive, and rewarding.

USER GOAL
Goal: "${goal}"
Category: "${category}"
Difficulty: "${difficulty}"
Total Levels: ${levelCount}

DESIGN RULES
- Create EXACTLY ${levelCount} levels.
- Level 1 must be beginner-friendly and focus on setup or fundamentals.
- Each next level must introduce a clear upgrade in skill or complexity.
- The final level must represent real-world completion or mastery.
- Avoid generic advice. Be concrete and actionable.
- Do NOT repeat tasks or ideas across levels.

LEVEL QUALITY RULES
- Titles: short, motivating, max 5 words.
- Descriptions: 1–2 sentences, clear and actionable.
- Tasks: 3–5 checklist-style actions a user can actually complete.
- Estimated time must feel realistic.
- Tips should feel like insider advice.
- Resources can be placeholders but relevant.

OUTPUT FORMAT (STRICT)
- Return ONLY valid JSON.
- No markdown.
- No explanations.
- No extra text before or after.
`;

    try {
        return await generateWithRotation(prompt);
    } catch (error) {
        console.error("❌ Final Gemini Generation Error:", error);
        throw error;
    }
};
