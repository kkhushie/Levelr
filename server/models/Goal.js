import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const goalSchema = new mongoose.Schema({
    id: { type: String, unique: true, default: uuidv4 },
    userId: { type: String, required: true },
    title: String,
    category: String,
    difficulty: String,
    totalLevels: Number,
    createdAt: { type: Date, default: Date.now },
    currentLevel: { type: Number, default: 1 },
    progress: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    levels: [{
        levelNumber: Number,
        title: String,
        description: String,
        xpReward: Number,
        coinReward: Number,
        status: String,

        // Enhanced Fields
        tasks: [String],
        estimatedTime: String,
        resources: [{ title: String, url: String }],
        tips: String
    }]
});

export const Goal = mongoose.model('Goal', goalSchema);
