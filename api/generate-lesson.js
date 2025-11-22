const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { topic, subjectContext, sourceText } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!topic && !sourceText) return res.status(400).json({ error: "Topic or Source Text is required" });

    // 🔥 ALWAYS USE PRO FOR LEARNING (Better Quality)
    const modelVersion = 'gemini-2.5-pro';

    let prompt = "";

    if (sourceText) {
        const truncatedText = sourceText.substring(0, 20000); // Pro can handle more context
        prompt = `
        You are an expert tutor. Analyze the SOURCE MATERIAL and create a structured study lesson.
        SOURCE MATERIAL: """${truncatedText}"""
        STRUCTURE: Overview, Detailed Breakdown, Key Takeaways, Summary.
        OUTPUT: Markdown format. Engaging tone.
        `;
    } else {
        const context = subjectContext ? `Context: This is part of the subject "${subjectContext}".` : "";
        prompt = `
        You are an expert tutor. Write a comprehensive study lesson about: "${topic}". ${context}
        STRUCTURE: Introduction, Core Concepts (with examples), Key Facts, Summary.
        OUTPUT: Markdown format.
        `;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        if (!data.candidates) throw new Error("AI response invalid");
        const lesson = data.candidates[0].content.parts[0].text;
        res.status(200).json({ lesson });

    } catch (error) {
        res.status(500).json({ error: "Failed to generate lesson." });
    }
};