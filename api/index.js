const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-quiz', async (req, res) => {
    // Yaha hum Environment Variable se key uthayenge (Secure Tarika)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: "Server configuration error: API Key missing" });
    }

    const { topic, difficulty } = req.body;

    const prompt = `Generate a quiz about "${topic}" with difficulty "${difficulty}".
    Create exactly 5 multiple choice questions.
    Return ONLY a raw JSON array. No markdown, no code blocks.
    Format:
    [
      {
        "question": "Question text?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "explanation": "Reason."
      }
    ]`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        res.json(JSON.parse(text));

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate quiz" });
    }
});

// Vercel ke liye export
module.exports = app;