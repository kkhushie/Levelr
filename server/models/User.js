import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
    id: { type: String, unique: true, default: uuidv4 },
    username: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Storing plaintext as per MVP requirement, but TODO: Hash this!
    stats: {
        xp: { type: Number, default: 0 },
        coins: { type: Number, default: 0 },
        completedQuests: { type: Number, default: 0 }
    },
    joinedAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
