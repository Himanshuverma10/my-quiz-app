const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { syllabusText } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!syllabusText) return res.status(400).json({ error: "No syllabus text provided" });

    // 🔥 UPDATED PROMPT: Ask for Hierarchy (Units -> Topics)
    const prompt = `
    Analyze the following syllabus text and structure it into Units and their corresponding Topics.
    
    SYLLABUS:
    """
    ${syllabusText.substring(0, 15000)}
    """

    OUTPUT REQUIREMENTS:
    - Return ONLY a raw JSON array of objects.
    - Format: [{"unit": "Unit 1 Name", "topics": ["Topic A", "Topic B"]}, {"unit": "Unit 2 Name", "topics": ["Topic C"]}]
    - If no clear units are found, group everything under "General Unit".
    - No markdown, no code blocks.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        let text = data.candidates[0].content.parts[0].text;
        
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const syllabusData = JSON.parse(text); // Expected: [{ unit: "...", topics: [...] }]

        res.status(200).json({ syllabusData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to parse syllabus" });
    }
};