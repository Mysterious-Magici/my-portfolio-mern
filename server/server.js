const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '10mb' }));

// ================= 1. SAFE MONGODB CONNECTION WITH MEMORY FALLBACK ================= //
let isMongoConnected = false;
const memoryUsers = [];
const memoryMessages = [];

const mongoUri = process.env.MONGO_URI || '';
if (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')) {
    mongoose
        .connect(mongoUri)
        .then(() => {
            isMongoConnected = true;
            console.log('MongoDB Atlas Connected');
        })
        .catch((err) => {
            console.warn('MongoDB connection failed, using In-Memory Fallback:', err.message);
        });
} else {
    console.warn('Valid MONGO_URI not found in .env — running in safe In-Memory mode.');
}

// Mongoose Schemas
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    category: { type: String, default: 'Hiring / Full-Time' },
    subject: { type: String, default: 'Portfolio Inquiry' },
    message: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    adminReply: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

// ================= 2. JWT AUTH MIDDLEWARES ================= //
const JWT_SECRET = process.env.JWT_SECRET || 'akash_portfolio_jwt_secret_key_2026_x99';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. Token missing.' });
    }
    try {
        req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin privileges required.' });
        }
        next();
    });
};

// ================= 3. AUTH ROUTES (USER VS ADMIN) ================= //
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        const cleanEmail = email.toLowerCase().trim();
        const passwordHash = await bcrypt.hash(password, 10);

        if (isMongoConnected) {
            const existing = await User.findOne({ email: cleanEmail });
            if (existing) return res.status(400).json({ error: 'Email already registered.' });
            const user = await User.create({ name, email: cleanEmail, passwordHash });
            const token = jwt.sign({ id: user._id, role: 'user', name, email: cleanEmail }, JWT_SECRET, { expiresIn: '24h' });
            return res.status(201).json({ token, user: { name, email: cleanEmail, role: 'user' } });
        } else {
            if (memoryUsers.find((u) => u.email === cleanEmail)) {
                return res.status(400).json({ error: 'Email already registered.' });
            }
            const newUser = { _id: Date.now().toString(), name, email: cleanEmail, passwordHash, role: 'user' };
            memoryUsers.push(newUser);
            const token = jwt.sign({ id: newUser._id, role: 'user', name, email: cleanEmail }, JWT_SECRET, { expiresIn: '24h' });
            return res.status(201).json({ token, user: { name, email: cleanEmail, role: 'user' } });
        }
    } catch (err) {
        res.status(500).json({ error: 'Registration failed.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password, loginType } = req.body;

        // Admin Login
        if (loginType === 'admin') {
            const adminUser = process.env.ADMIN_USERNAME || 'akash_admin';
            const adminPass = process.env.ADMIN_PASSWORD || 'SuperSecretAdminPassword123!';
            if (identifier === adminUser && password === adminPass) {
                const token = jwt.sign(
                    { role: 'admin', name: 'Akash Karmakar (Admin)', email: 'admin@akash.dev' },
                    JWT_SECRET,
                    { expiresIn: '12h' }
                );
                return res.json({ token, user: { name: 'Akash Karmakar (Admin)', email: 'admin@akash.dev', role: 'admin' } });
            }
            return res.status(401).json({ error: 'Invalid Admin Username or Password.' });
        }

        // Normal User Login
        const cleanEmail = (identifier || '').toLowerCase().trim();
        const user = isMongoConnected
            ? await User.findOne({ email: cleanEmail })
            : memoryUsers.find((u) => u.email === cleanEmail);

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id, role: 'user', name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { name: user.name, email: user.email, role: 'user' } });
    } catch (err) {
        res.status(500).json({ error: 'Login failed.' });
    }
});

// ================= 4. CONTACT & MESSAGE ROUTES ================= //
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, category, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        if (isMongoConnected) {
            const saved = await Contact.create({ name, email: email.toLowerCase(), category, subject, message });
            return res.status(201).json({ message: 'Message saved to MongoDB!', data: saved });
        } else {
            const msgObj = {
                _id: Date.now().toString(),
                name,
                email: email.toLowerCase(),
                category: category || 'Hiring / Full-Time',
                subject: subject || 'Portfolio Inquiry',
                message,
                status: 'Pending',
                adminReply: '',
                createdAt: new Date()
            };
            memoryMessages.unshift(msgObj);
            return res.status(201).json({ message: 'Message saved!', data: msgObj });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to save message.' });
    }
});

app.get('/api/user/messages', verifyToken, async (req, res) => {
    const email = req.user.email.toLowerCase();
    const list = isMongoConnected
        ? await Contact.find({ email }).sort({ createdAt: -1 })
        : memoryMessages.filter((m) => m.email === email);
    res.json(list);
});

app.get('/api/admin/messages', verifyAdmin, async (req, res) => {
    const list = isMongoConnected ? await Contact.find().sort({ createdAt: -1 }) : memoryMessages;
    res.json(list);
});

app.patch('/api/admin/messages/:id', verifyAdmin, async (req, res) => {
    const { status, adminReply } = req.body;
    if (isMongoConnected) {
        const updated = await Contact.findByIdAndUpdate(req.params.id, { status, adminReply }, { new: true });
        return res.json(updated);
    } else {
        const idx = memoryMessages.findIndex((m) => m._id === req.params.id);
        if (idx !== -1) {
            if (status) memoryMessages[idx].status = status;
            if (adminReply !== undefined) memoryMessages[idx].adminReply = adminReply;
            return res.json(memoryMessages[idx]);
        }
        return res.status(404).json({ error: 'Not found' });
    }
});

app.delete('/api/admin/messages/:id', verifyAdmin, async (req, res) => {
    if (isMongoConnected) {
        await Contact.findByIdAndDelete(req.params.id);
    } else {
        const idx = memoryMessages.findIndex((m) => m._id === req.params.id);
        if (idx !== -1) memoryMessages.splice(idx, 1);
    }
    res.json({ message: 'Deleted' });
});

// ================= 5. GROQ AI CHATBOT ROUTE ================= //
function generateSmartFallback(query = '') {
    const q = query.toLowerCase();
    if (q.includes('project') || q.includes('work') || q.includes('github')) {
        return "Akash's featured projects include Anuman AI (LangGraph data agent), A11yWeaver (Kotlin accessibility toolkit), Apnar Swasthya (XGBoost + FastAPI medical triage), SiteEstimate AI (MERN + Claude API), and SmartFlow Portal. View all code at https://github.com/Mysterious-Magici";
    }
    if (q.includes('skill') || q.includes('stack') || q.includes('tech')) {
        return "Akash specializes in Full-Stack MERN (MongoDB, Express, React, Node.js), Python (FastAPI, Django), Data Analytics (Power BI, Tableau, SQL), and Machine Learning/GenAI (XGBoost, Scikit-Learn, LangGraph, Groq & Gemini APIs).";
    }
    if (q.includes('intern') || q.includes('experience') || q.includes('deloitte')) {
        return "Akash worked as a Data Analyst Intern at Codec Technologies and completed the Deloitte Data Analytics Virtual Job Simulation.";
    }
    return "Hi! I'm Akash Karmakar's AI assistant. Ask me about his MERN & AI projects (Anuman AI, Apnar Swasthya, SmartFlow Portal), his internships, or visit his GitHub (@Mysterious-Magici)!";
}

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const apiKey = (process.env.GROQ_API_KEY || '').trim();

    if (!apiKey || apiKey.includes('your_') || apiKey.includes('paste_')) {
        return res.json({ reply: generateSmartFallback(message) });
    }

    try {
        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content:
                        "You are the AI Portfolio Assistant for Akash Karmakar (B.Tech CSE, Bankura Unnayani Institute of Engineering; GitHub: github.com/Mysterious-Magici). Skills: MERN Stack, Python, FastAPI, XGBoost, LangGraph, Power BI. Projects: Anuman AI, A11yWeaver, Apnar Swasthya, SiteEstimate AI, SmartFlow Portal. Answer concisely in 2-4 sentences."
                },
                { role: 'user', content: message || 'Hello' }
            ],
            temperature: 0.6,
            max_tokens: 350
        });
        res.json({ reply: completion.choices[0]?.message?.content || generateSmartFallback(message) });
    } catch (err) {
        res.json({ reply: generateSmartFallback(message) });
    }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;