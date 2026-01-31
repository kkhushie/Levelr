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