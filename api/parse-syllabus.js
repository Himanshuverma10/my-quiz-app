const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { syllabusText } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!syllabusText) return res.status(400).json({ error: "No syllabus text provided" });

    // Prompt to extract topics
    const prompt = `
    Analyze the following syllabus text and extract a flat list of distinct study topics or chapters.
    Ignore generic terms like "Introduction" or "Conclusion" unless specific.
    
    SYLLABUS:
    """
    ${syllabusText.substring(0, 10000)}
    """

    OUTPUT REQUIREMENTS:
    - Return ONLY a raw JSON array of strings.
    - Example: ["Kinematics", "Laws of Motion", "Thermodynamics"]
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
        
        // Clean up JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const topics = JSON.parse(text);

        res.status(200).json({ topics });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to parse syllabus" });
    }
};