import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Goal } from './models/Goal.js';
import { generateLevelPlan } from './services/geminiService.js';
import rateLimit from 'express-rate-limit';

dotenv.config({ path: '.env.local' });

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_levelr';

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: "No token, authorization denied" });

    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contains id and email
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

// Rate Limiter for AI Generation
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Increased to 20 to handle small shared-IP groups better
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: "Starting a new journey? You're moving fast! Take a short break before generating more levels." }
});

// --- Routes ---

// AI Generation
app.post('/api/generate', aiLimiter, async (req, res) => {
    try {
        const { title, category, difficulty, levels } = req.body;
        if (!title) return res.status(400).json({ message: "Please provide a goal title." });

        const levelPlan = await generateLevelPlan(title, category, difficulty, levels);
        res.json(levelPlan);
    } catch (err) {
        console.error("AI Route Error:", err);

        // Handle Gemini Overload Specifically
        if (err.status === 503 || err.message?.includes('Overloaded')) {
            return res.status(503).json({ message: "The AI is currently experiencing high traffic. Please try again in a moment." });
        }

        res.status(500).json({ message: "We couldn't generate your plan right now. Please try again." });
    }
});

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

        // Hash password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ username, email, password: hashedPassword });
        const savedUser = await user.save();

        console.log(`User created: ${savedUser.email}`);

        // Generate JWT Token
        const token = jwt.sign({ id: savedUser.id, email: savedUser.email }, JWT_SECRET, { expiresIn: '7d' });

        // safe user
        const { password: _, ...safeUser } = savedUser.toObject();
        res.status(201).json({ ...safeUser, token });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "Server error during registration" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        const { password: _, ...safeUser } = user.toObject();
        res.json({ ...safeUser, token });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server error during login" });
    }
});

app.get('/api/users/:id', authMiddleware, async (req, res) => {
    try {
        // Optional: Ensure users can only fetch their own profile
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        const user = await User.findOne({ id: req.params.id });
        if (!user) return res.status(404).json({ message: "User not found" });
        const { password: _, ...safeUser } = user.toObject();
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/users/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        const updates = { ...req.body };
        // If updating password, hash it first
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const user = await User.findOneAndUpdate({ id: req.params.id }, updates, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Goals
app.get('/api/goals', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: "userId required" });
        
        if (req.user.id !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const goals = await Goal.find({ userId });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/goals', authMiddleware, async (req, res) => {
    try {
        const { id, userId, ...data } = req.body;
        
        if (req.user.id !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }

        let goal;
        if (id) {
            goal = await Goal.findOneAndUpdate({ id }, { ...data, userId, id }, { new: true, upsert: true });
        } else {
            goal = new Goal({ ...data, userId });
            await goal.save();
        }
        res.json(goal);
    } catch (err) {
        console.error("Save Goal Error:", err);
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/goals/:id', authMiddleware, async (req, res) => {
    try {
        const goal = await Goal.findOne({ id: req.params.id });
        if (!goal) return res.status(404).json({ message: "Goal not found" });
        
        if (goal.userId !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        await Goal.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
