import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, GoalCategory, LevelData, LevelStatus } from "../types";

// Helper to determine base rewards based on difficulty
const getBaseRewards = (difficulty: Difficulty) => {
  switch (difficulty) {
    case Difficulty.HARD: return { xp: 150, coins: 50 };
    case Difficulty.MEDIUM: return { xp: 100, coins: 25 };
    default: return { xp: 50, coins: 10 };
  }
};

export const generateLevelPlan = async (
  goal: string,
  category: GoalCategory,
  difficulty: Difficulty,
  levelCount: number
): Promise<LevelData[]> => {

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API Key is missing. Please set the GEMINI_API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    I am creating a gamified roadmap for a user.
    Goal: "${goal}"
    Category: "${category}"
    Difficulty: "${difficulty}"
    Total Levels: ${levelCount}

    Break this goal down into exactly ${levelCount} progressive levels.
    Level 1 should be the starting point (easy setup/basics).
    The last level should be the completion of the goal.
    Return a JSON array where each item represents a level.
  `;

  console.log("Generating level plan for:", { goal, category, difficulty, levelCount });
  console.log("Prompt length:", prompt.length);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short punchy title for the level (max 5 words)" },
              description: { type: Type.STRING, description: "Actionable instructions for this level (1-2 sentences)" },
              tasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 3-5 specific sub-tasks/checklist items to complete this level."
              },
              estimatedTime: { type: Type.STRING, description: "Estimated time to complete (e.g. '2 hours', '30 mins')" },
              tips: { type: Type.STRING, description: "One helpful pro-tip for this level." },
              resources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING }
                  }
                },
                description: "1-2 dummy/placeholder links to helpful resources (e.g. documentation, tutorials)."
              }
            },
            required: ["title", "description", "tasks", "estimatedTime"],
          },
        },
      },
    });

    console.log("Gemini Response Object:", response);
    const rawText = response.text || "";
    console.log("Raw Response Text:", rawText);

    const rawLevels = JSON.parse(rawText || "[]") as Array<{
      title: string;
      description: string;
      tasks?: string[];
      estimatedTime?: string;
      tips?: string;
      resources?: { title: string; url: string }[];
    }>;
    const { xp, coins } = getBaseRewards(difficulty);

    // Transform into app-ready LevelData
    return rawLevels.map((l, index) => ({
      levelNumber: index + 1,
      title: l.title,
      description: l.description,
      tasks: l.tasks || [],
      estimatedTime: l.estimatedTime,
      tips: l.tips,
      resources: l.resources || [],
      xpReward: xp + (index * 10), // Progressive XP
      coinReward: coins + (index * 5), // Progressive Coins
      status: index === 0 ? LevelStatus.UNLOCKED : LevelStatus.LOCKED,
    }));

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Fallback if API fails (Graceful degradation)
    return Array.from({ length: levelCount }).map((_, i) => ({
      levelNumber: i + 1,
      title: `Level ${i + 1}`,
      description: "Complete the task for this milestone.",
      xpReward: 50,
      coinReward: 10,
      status: i === 0 ? LevelStatus.UNLOCKED : LevelStatus.LOCKED
    }));
  }
};