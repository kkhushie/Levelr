import { Difficulty, GoalCategory, LevelData, LevelStatus } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to determine base rewards based on difficulty
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

  console.log("Generating level plan via Server for:", { goal, category, difficulty, levelCount });

  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: goal, category, difficulty, levels: levelCount })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server Error: ${errText}`);
    }

    const rawLevels = await response.json();

    // Validate if it is array
    if (!Array.isArray(rawLevels)) {
      throw new Error("Invalid format from AI service");
    }

    const { xp, coins } = getBaseRewards(difficulty);

    return rawLevels.map((l: any, index: number) => ({
      levelNumber: index + 1,
      title: l.title,
      description: l.description,
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