const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-quiz', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: "Server configuration error: API Key missing" });
    }

    const { topic, difficulty } = req.body;

    const prompt = `You are a strict quiz generator API.
    Topic: "${topic}"
    Difficulty: "${difficulty}"
    Task: Generate exactly 5 multiple choice questions.
    Output Requirement: Return ONLY a raw JSON array. Do NOT use markdown, do NOT use \`\`\`json, do NOT add introduction or conclusion.
    
    JSON Structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A",
        "explanation": "Brief explanation why Option A is correct."
      }
    ]`;

    try {
        // UPDATED: Using Gemini 2.5 Pro
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7
                }
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            throw new Error(data.error.message || "API Error");
        }

        let text = data.candidates[0].content.parts[0].text;
        // Cleaning up any potential markdown formatting
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const json = JSON.parse(text);
            res.json(json);
        } catch (e) {
            console.error("JSON Parse Error. AI Output was:", text);
            throw new Error("AI generated invalid JSON format. Please try again.");
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate quiz. " + error.message });
    }
});

module.exports = app;