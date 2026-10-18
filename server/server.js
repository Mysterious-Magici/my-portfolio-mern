const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();

// 1. Safe CORS Configuration (Compatible with both Express 4 & Express 5)
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 2. Non-Blocking Serverless MongoDB Connection
let isMongoConnected = false;
const memoryUsers = [];
const memoryMessages = [];

async function connectDB() {
    if (isMongoConnected || mongoose.connection.readyState === 1) {
        isMongoConnected = true;
        return;
    }
    const mongoUri = (process.env.MONGO_URI || '').trim();
    if (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')) {
        try {
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 3000
            });
            isMongoConnected = true;
            console.log('✅ MongoDB Atlas Connected');
        } catch (err) {
            console.warn('⚠️ MongoDB Fallback Mode:', err.message);
        }
    }
}

// Schemas
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

// 3. JWT Middleware
const JWT_SECRET = (process.env.JWT_SECRET || 'akash_portfolio_jwt_secret_key_2026_x99').trim();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. Token missing.' });
    }
    try {
        req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Session expired. Please sign in again.' });
    }
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        next();
    });
};

// 4. Health Check Route (Instant 200 OK — Never crashes on cold start)
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Portfolio Backend Online',
        mongoConfigured: Boolean(process.env.MONGO_URI),
        groqConfigured: Boolean(process.env.GROQ_API_KEY)
    });
});

// 5. Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        await connectDB();
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        const cleanEmail = email.toLowerCase().trim();
        const passwordHash = await bcrypt.hash(password, 10);

        if (isMongoConnected) {
            const existing = await User.findOne({ email: cleanEmail });
            if (existing) return res.status(400).json({ error: 'Email already registered. Please sign in.' });
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
        res.status(500).json({ error: 'Registration failed: ' + err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        await connectDB();
        const { identifier, password, loginType } = req.body;
        const cleanId = (identifier || '').trim();
        const cleanPass = (password || '').trim();

        if (loginType === 'admin') {
            const adminUser = (process.env.ADMIN_USERNAME || 'akash_admin').trim();
            const adminPass = (process.env.ADMIN_PASSWORD || 'SuperSecretAdminPassword123!').trim();

            if (cleanId === adminUser && cleanPass === adminPass) {
                const token = jwt.sign(
                    { role: 'admin', name: 'Akash Karmakar (Admin)', email: 'admin@akash.dev' },
                    JWT_SECRET,
                    { expiresIn: '12h' }
                );
                return res.json({
                    token,
                    user: { name: 'Akash Karmakar (Admin)', email: 'admin@akash.dev', role: 'admin' }
                });
            }
            return res.status(401).json({ error: 'Invalid Admin Username or Password.' });
        }

        const cleanEmail = cleanId.toLowerCase();
        const user = isMongoConnected
            ? await User.findOne({ email: cleanEmail })
            : memoryUsers.find((u) => u.email === cleanEmail);

        if (!user || !(await bcrypt.compare(cleanPass, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user._id, role: 'user', name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token, user: { name: user.name, email: user.email, role: 'user' } });
    } catch (err) {
        res.status(500).json({ error: 'Login error: ' + err.message });
    }
});

// 6. Contact & Message Routes
app.post('/api/contact', async (req, res) => {
    try {
        await connectDB();
        const { name, email, category, subject, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }
        if (isMongoConnected) {
            const saved = await Contact.create({
                name,
                email: email.toLowerCase().trim(),
                category,
                subject,
                message
            });
            return res.status(201).json({ message: 'Message saved to MongoDB!', data: saved });
        } else {
            const msgObj = {
                _id: Date.now().toString(),
                name,
                email: email.toLowerCase().trim(),
                category: category || 'Hiring / Full-Time',
                subject: subject || 'Portfolio Inquiry',
                message,
                status: 'Pending',
                adminReply: '',
                createdAt: new Date()
            };
            memoryMessages.unshift(msgObj);
            return res.status(201).json({ message: 'Message received!', data: msgObj });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to save message.' });
    }
});

app.get('/api/user/messages', verifyToken, async (req, res) => {
    await connectDB();
    const email = req.user.email.toLowerCase();
    const list = isMongoConnected
        ? await Contact.find({ email }).sort({ createdAt: -1 })
        : memoryMessages.filter((m) => m.email === email);
    res.json(list);
});

app.get('/api/admin/messages', verifyAdmin, async (req, res) => {
    await connectDB();
    const list = isMongoConnected ? await Contact.find().sort({ createdAt: -1 }) : memoryMessages;
    res.json(list);
});

app.patch('/api/admin/messages/:id', verifyAdmin, async (req, res) => {
    await connectDB();
    const { status, adminReply } = req.body;
    if (isMongoConnected) {
        const updated = await Contact.findByIdAndUpdate(
            req.params.id,
            { status, adminReply },
            { new: true }
        );
        return res.json(updated);
    }
    const idx = memoryMessages.findIndex((m) => m._id === req.params.id);
    if (idx !== -1) {
        if (status) memoryMessages[idx].status = status;
        if (adminReply !== undefined) memoryMessages[idx].adminReply = adminReply;
        return res.json(memoryMessages[idx]);
    }
    res.status(404).json({ error: 'Message not found' });
});

app.delete('/api/admin/messages/:id', verifyAdmin, async (req, res) => {
    await connectDB();
    if (isMongoConnected) {
        await Contact.findByIdAndDelete(req.params.id);
    } else {
        const idx = memoryMessages.findIndex((m) => m._id === req.params.id);
        if (idx !== -1) memoryMessages.splice(idx, 1);
    }
    res.json({ message: 'Deleted' });
});

// 7. Groq AI Chatbot Route
const PORTFOLIO_SYSTEM_PROMPT = `
You are the official AI Portfolio Assistant for Akash Karmakar (GitHub: https://github.com/Mysterious-Magici).
Answer concisely in 2 to 4 sentences.
- Education: B.Tech in Computer Science & Engineering at Bankura Unnayani Institute of Engineering (West Bengal, India).
- Experience: Data Analyst Intern at Codec Technologies; Deloitte Data Analytics Virtual Job Simulation.
- Skills: MERN Stack (MongoDB, Express, React, Node.js), Python, FastAPI, Django, XGBoost, LightGBM, CatBoost, Scikit-Learn, LangGraph, Power BI, Tableau, SQL, Kotlin.
- Projects: Anuman AI (LangGraph data agent), SmartFlow Portal (MERN), SiteEstimate AI (MERN + Claude API), Apnar Swasthya (XGBoost + FastAPI), A11yWeaver (Android Kotlin accessibility), Bank Customer Churn Analysis, Medical Cost Prediction, Prospective Customer Segmentation.
`;

function generateSmartFallback(query = '') {
    const q = query.toLowerCase();
    if (q.includes('project') || q.includes('work') || q.includes('github')) {
        return "Akash's key projects include Anuman AI (LangGraph agent), SmartFlow Portal (MERN), SiteEstimate AI, Apnar Swasthya (XGBoost + FastAPI), A11yWeaver (Kotlin), and Bank Customer Churn Analysis. Explore all repositories at https://github.com/Mysterious-Magici";
    }
    if (q.includes('skill') || q.includes('stack') || q.includes('tech')) {
        return "Akash is skilled in Full-Stack MERN (MongoDB, Express, React, Node.js), Python (FastAPI, Django), Machine Learning (XGBoost, Scikit-Learn, LangGraph), and Data Analytics (Power BI, Tableau, SQL).";
    }
    if (q.includes('intern') || q.includes('experience') || q.includes('deloitte')) {
        return "Akash completed a Data Analyst Internship at Codec Technologies and the Deloitte Data Analytics Virtual Job Simulation, building predictive models and executive BI dashboards.";
    }
    return "Hi! I'm Akash Karmakar's AI assistant. Akash is a Full-Stack MERN Developer and Data & AI Engineer. Ask me about his projects, technical skills, internships, or GitHub (@Mysterious-Magici)!";
}

app.post('/api/chat', async (req, res) => {
    const { message, imageBase64 } = req.body;
    const apiKey = (process.env.GROQ_API_KEY || '').trim();

    if (!apiKey || apiKey.includes('your_') || apiKey.includes('paste_')) {
        return res.json({ reply: generateSmartFallback(message) });
    }

    try {
        const groq = new Groq({ apiKey });
        let completion;

        if (imageBase64) {
            completion = await groq.chat.completions.create({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: `${PORTFOLIO_SYSTEM_PROMPT}\n\nUser Question: ${message || 'Analyze this image.'}` },
                            { type: 'image_url', image_url: { url: imageBase64 } }
                        ]
                    }
                ],
                temperature: 0.6,
                max_tokens: 350
            });
        } else {
            completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: PORTFOLIO_SYSTEM_PROMPT },
                    { role: 'user', content: message || 'Hello' }
                ],
                temperature: 0.6,
                max_tokens: 350
            });
        }

        res.json({ reply: completion.choices[0]?.message?.content || generateSmartFallback(message) });
    } catch (err) {
        res.json({ reply: generateSmartFallback(message) });
    }
});

// Local listen vs Vercel export
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;