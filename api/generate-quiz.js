const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server Error: API Key missing" });

    // Extract numQuestions from request, default to 5 if not provided
    const { topic, difficulty, sourceText, numQuestions } = req.body;
    const count = numQuestions || 5;

    // 2. Dynamic Prompt Creation
    let systemInstruction = "";
    
    if (sourceText) {
        // DOCUMENT MODE PROMPT
        const truncatedText = sourceText.substring(0, 25000);
        
        systemInstruction = `You are an expert tutor and quiz generator.
        SOURCE MATERIAL:
        """
        ${truncatedText}
        """
        
        TASK: Generate exactly ${count} multiple choice questions based ONLY on the source material above.
        Difficulty: ${difficulty}
        `;
    } else {
        // TOPIC MODE PROMPT
        systemInstruction = `You are an expert tutor and quiz generator.
        TOPIC: "${topic}"
        TASK: Generate exactly ${count} multiple choice questions about this topic.
        Difficulty: ${difficulty}
        `;
    }

    const finalPrompt = `${systemInstruction}
    
    OUTPUT REQUIREMENTS:
    - Return ONLY a raw JSON array.
    - Format: [{"question": "...", "options": ["A","B","C","D"], "correctAnswer": "A", "explanation": "Detailed theory explaining why this answer is correct and providing context for learning."}]
    - No markdown, no \`\`\`json tags.
    - Make sure to generate exactly ${count} questions.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
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