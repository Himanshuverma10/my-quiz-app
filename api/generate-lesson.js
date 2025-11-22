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

    let prompt = "";

    if (sourceText) {
        // MODE A: Explain Provided Material
        const truncatedText = sourceText.substring(0, 15000); // Limit text
        prompt = `
        You are an expert tutor. Your task is to analyze the provided SOURCE MATERIAL and create a structured, easy-to-understand study lesson based *strictly* on it.
        
        SOURCE MATERIAL:
        """
        ${truncatedText}
        """

        TASK:
        Refine this content into a clear study guide.
        
        STRUCTURE:
        1. **Overview**: What is this material about?
        2. **Detailed Breakdown**: Explain the key concepts found in the text clearly.
        3. **Key Takeaways**: Bullet points of the most important facts/rules from the text.
        4. **Summary**: A concluding sentence.

        OUTPUT FORMAT:
        Return Markdown formatted text. Make it engaging.
        `;
    } else {
        // MODE B: Generate from Topic
        const context = subjectContext ? `Context: This is part of the subject "${subjectContext}".` : "";
        prompt = `
        You are an expert tutor. Write a comprehensive, easy-to-understand study lesson about: "${topic}".
        ${context}

        STRUCTURE:
        1. **Introduction**: Brief overview.
        2. **Core Concepts**: Explain the main ideas clearly with examples.
        3. **Key Facts**: Bullet points of important data/rules.
        4. **Summary**: A one-sentence conclusion.

        OUTPUT FORMAT:
        Return Markdown formatted text.
        `;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        if (!data.candidates) throw new Error("AI response invalid");
        const lesson = data.candidates[0].content.parts[0].text;
        res.status(200).json({ lesson });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate lesson." });
    }
};