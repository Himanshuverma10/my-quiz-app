const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server Error: API Key missing" });

    const { topic, difficulty, sourceText, numQuestions } = req.body;
    const count = numQuestions || 5;

    // 🔥 SMART ROUTING LOGIC
    // Agar Hard hai toh 'Pro' model use karo, warna 'Flash' (Fast) model use karo.
    const modelVersion = difficulty === 'Hard' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    let systemInstruction = "";
    
    if (sourceText) {
        const truncatedText = sourceText.substring(0, 25000);
        systemInstruction = `You are an expert tutor.
        SOURCE MATERIAL:
        """
        ${truncatedText}
        """
        TASK: Generate exactly ${count} multiple choice questions based ONLY on the source material above.
        Difficulty: ${difficulty}
        `;
    } else {
        systemInstruction = `You are an expert tutor.
        TOPIC: "${topic}"
        TASK: Generate exactly ${count} multiple choice questions about this topic.
        Difficulty: ${difficulty}
        `;
    }

    const finalPrompt = `${systemInstruction}
    
    OUTPUT REQUIREMENTS:
    - Return ONLY a raw JSON array.
    - Format: [{"question": "...", "options": ["A) ...","B) ...","C) ...","D) ..."], "correctAnswer": "A", "explanation": "..."}]
    - IMPORTANT: Start every option with a label like "A) ", "B) ", etc.
    - No markdown, no \`\`\`json tags.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: finalPrompt }] }],
                generationConfig: { temperature: 0.5 }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "Gemini API Error");

        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const json = JSON.parse(text);
            res.status(200).json(json);
        } catch (e) {
            throw new Error("AI generated invalid JSON. Please try again.");
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};