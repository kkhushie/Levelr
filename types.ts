export enum GoalCategory {
  STUDY = 'Study 📚',
  FITNESS = 'Fitness 💪',
  WORK = 'Work 💼',
  PERSONAL = 'Growth 🌱',
  PROJECT = 'Projects 🧠'
}

export enum Difficulty {
  EASY = 'Easy 🟢',
  MEDIUM = 'Medium 🟡',
  HARD = 'Hard 🔴'
}

export enum LevelStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  COMPLETED = 'COMPLETED'
}

export interface LevelData {
  levelNumber: number;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  status: LevelStatus;
  // Enhanced Details
  tasks?: string[];
  estimatedTime?: string;
  resources?: { title: string; url: string }[];
  tips?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  difficulty: Difficulty;
  totalLevels: number;
  createdAt: string;
  levels: LevelData[];
  currentLevel: number; // The highest unlocked level number
  progress: number; // Percentage 0-100
  isCompleted: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  stats: {
    xp: number;
    coins: number;
    completedQuests: number;
  };
  joinedAt: string;
}

// Gemini Response Schema Helper
export interface GeminiLevelSchema {
  title: string;
  description: string;
  checklist: string[];
}