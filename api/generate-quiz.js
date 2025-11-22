const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const apiKey = process.env.GEMINI_API_KEY;
    const { topic, difficulty, sourceText, numQuestions } = req.body;
    const count = numQuestions || 5;
    const modelVersion = difficulty === 'Hard' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    let systemInstruction = sourceText 
        ? `Source Material: """${sourceText.substring(0, 25000)}""". Generate ${count} MCQs based on this.`
        : `Topic: "${topic}". Generate ${count} MCQs.`;

    const finalPrompt = `${systemInstruction} Difficulty: ${difficulty}. Output JSON array: [{"question":..., "options":["A)...","B)..."], "correctAnswer":"A", "explanation":"..."}]`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        let text = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(text);
        
        // 🔥 SEND USAGE DATA BACK
        const usage = data.usageMetadata || { totalTokenCount: 0 };
        res.status(200).json({ quiz: json, usage }); 

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};