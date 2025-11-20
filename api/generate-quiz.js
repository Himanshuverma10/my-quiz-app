const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    // 1. Enable CORS (Taaki frontend baat kar sake)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // 2. Preflight Check (Browser styling request)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

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
            throw new Error(data.error.message || "API Error");
        }

        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const json = JSON.parse(text);
            res.status(200).json(json);
        } catch (e) {
            throw new Error("AI generated invalid JSON format.");
        }

    } catch (error) {
        res.status(500).json({ error: "Failed to generate quiz. " + error.message });
    }
};