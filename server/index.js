import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Goal } from './models/Goal.js';

dotenv.config({ path: '.env.local' });

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// --- Routes ---

// Auth
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Basic Validation
        if (!email || !password || !username) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const user = new User({ username, email, password });
        const savedUser = await user.save();

        console.log(`User created: ${savedUser.email}`);

        // safe user
        const { password: _, ...safeUser } = savedUser.toObject();
        res.status(201).json(safeUser);
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "Server error during registration" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const { password: _, ...safeUser } = user.toObject();
        res.json(safeUser);
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server error during login" });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) return res.status(404).json({ message: "User not found" });
        const { password: _, ...safeUser } = user.toObject();
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Goals
app.get('/api/goals', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: "userId required" });
        const goals = await Goal.find({ userId });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/goals', async (req, res) => {
    try {
        const { id, ...data } = req.body;

        let goal;
        if (id) {
            goal = await Goal.findOneAndUpdate({ id }, { ...data, id }, { new: true, upsert: true });
        } else {
            goal = new Goal(data);
            await goal.save();
        }
        res.json(goal);
    } catch (err) {
        console.error("Save Goal Error:", err);
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/goals/:id', async (req, res) => {
    try {
        await Goal.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
