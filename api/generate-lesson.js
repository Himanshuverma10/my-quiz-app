const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { topic, subjectContext, sourceText } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const modelVersion = 'gemini-2.5-pro';

    let prompt = sourceText 
        ? `Explain this material: """${sourceText.substring(0, 20000)}""". Structure: Overview, Breakdown, Key Takeaways, Summary. Format: Markdown.`
        : `Write a lesson on "${topic}" ${subjectContext ? `(Context: ${subjectContext})` : ""}. Structure: Intro, Concepts, Facts, Summary. Format: Markdown.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const lesson = data.candidates[0].content.parts[0].text;
        
        // 🔥 SEND USAGE DATA BACK
        const usage = data.usageMetadata || { totalTokenCount: 0 };
        res.status(200).json({ lesson, usage });

    } catch (error) {
       console.error(error);
    res.status(500).json({ error: error.message || JSON.stringify(error) });
    }
};