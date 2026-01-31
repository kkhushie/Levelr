import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, GoalCategory, LevelData, LevelStatus } from "../types";

/* ========================= */
const getBaseRewards = (difficulty: Difficulty) => {
  switch (difficulty) {
    case Difficulty.HARD: return { xp: 150, coins: 50 };
    case Difficulty.MEDIUM: return { xp: 100, coins: 25 };
    default: return { xp: 50, coins: 10 };
  }
};

const LOGICAL_MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemma-3-27b-it",
  "gemma-3-12b-it",
];

const DAILY_LIMITS: Record<string, number> = {
  "gemini-3-flash-preview": 20,
  "gemini-2.5-flash": 20,
  "gemini-2.5-flash-lite": 20,
  "gemma-3-27b-it": 14400,
  "gemma-3-12b-it": 14400,
};

type UsageEntry = { date: string; count: number };
const usage: Record<string, UsageEntry> = {};

const today = () => new Date().toISOString().slice(0, 10);

function getUsage(model: string) {
  if (!usage[model] || usage[model].date !== today()) {
    usage[model] = { date: today(), count: 0 };
  }
  return usage[model].count;
}

function incrementUsage(model: string) {
  getUsage(model);
  usage[model].count++;
}

function pickModel(): string | null {
  for (const m of LOGICAL_MODELS) {
    if (getUsage(m) < DAILY_LIMITS[m]) return m;
  }
  return null;
}

/* ========================= */
function isQuotaError(e: any) {
  const msg = String(e);
  return msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
}

function isNotFoundError(e: any) {
  const msg = String(e);
  return msg.includes("404") || msg.includes("NOT_FOUND");
}

function isOverloadError(e: any) {
  const msg = String(e);
  return msg.includes("503") || msg.includes("UNAVAILABLE");
}

/* ========================= FIX HERE */
function cleanJsonResponse(text: string): any[] {
  try {
    // Remove markdown
    let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    // Extract array
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      cleaned = arrayMatch[0];
    }
    
    // Try parsing
    return JSON.parse(cleaned);
  } catch (e) {
    // If truncated, try to fix incomplete JSON
    console.warn("JSON parse failed, attempting repair...");
    
    // Find last complete object
    const objects = text.match(/\{[^{}]*\}/g) || [];
    if (objects.length > 0) {
      return objects.map(obj => JSON.parse(obj));
    }
    
    return [];
  }
}
const LEVEL_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
      estimatedTime: { type: Type.STRING },
      tips: { type: Type.STRING },
      resources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            url: { type: Type.STRING },
          },
        },
      },
    },
    required: ["title", "description", "tasks", "estimatedTime"],
  },
};

/* ========================= */
async function generateWithRotation(ai: GoogleGenAI, prompt: string) {
  const attempted: string[] = [];

  while (attempted.length < LOGICAL_MODELS.length) {
    const model = pickModel();
    if (!model || attempted.includes(model)) continue;
    
    attempted.push(model);
    const isGemma = model.startsWith("gemma");

    try {
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.2,
          maxOutputTokens: 2048, // ⬅️ INCREASED from 900
          ...(!isGemma && {
            responseMimeType: "application/json",
            responseSchema: LEVEL_SCHEMA,
          }),
        },
      });

      const text = res.text || "[]";
      
      // Validate it's parseable before returning
      if (isGemma) {
        cleanJsonResponse(text); // Test parse
      }
      
      incrementUsage(model);
      return text;

    } catch (err) {
      console.warn(`${model} failed:`, err);
      if (isNotFoundError(err) || isQuotaError(err) || isOverloadError(err)) {
        continue;
      }
      // Don't throw on parse errors, try next model
      continue;
    }
  }
  throw new Error("All models failed");
}

/* ========================= */
export const generateLevelPlan = async (
  goal: string,
  category: GoalCategory,
  difficulty: Difficulty,
  levelCount: number
): Promise<LevelData[]> => {

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `Return ONLY a valid JSON array. No markdown, no explanation.

Goal: "${goal}"
Category: "${category}"
Difficulty: "${difficulty}"

Create exactly ${levelCount} progressive levels. Each level must have:
- title (string, max 5 words)
- description (string, 1-2 sentences)
- tasks (array of 3-5 strings)
- estimatedTime (string, e.g. "2 hours")
- tips (string, one helpful tip)
- resources (array of objects with title and url)

Return the complete array.`;

  try {
    const raw = await generateWithRotation(ai, prompt);
    const parsed = cleanJsonResponse(raw); // ⬅️ NOW RETURNS ARRAY DIRECTLY

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid response structure");
    }

    const { xp, coins } = getBaseRewards(difficulty);

    return parsed.slice(0, levelCount).map((l: any, i: number) => ({
      levelNumber: i + 1,
      title: l.title || `Level ${i + 1}`,
      description: l.description || "Complete this milestone.",
      tasks: l.tasks || [],
      estimatedTime: l.estimatedTime || "1 hour",
      tips: l.tips,
      resources: l.resources || [],
      xpReward: xp + i * 10,
      coinReward: coins + i * 5,
      status: i === 0 ? LevelStatus.UNLOCKED : LevelStatus.LOCKED,
    }));

  } catch (err) {
    console.error("Generation failed:", err);
    return Array.from({ length: levelCount }).map((_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      description: "Complete this milestone.",
      tasks: [],
      estimatedTime: "1 hour",
      xpReward: 50,
      coinReward: 10,
      status: i === 0 ? LevelStatus.UNLOCKED : LevelStatus.LOCKED,
    }));
  }
};