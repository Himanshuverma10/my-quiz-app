const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
    // CORS Headers setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const apiKey = process.env.GEMINI_API_KEY;
    const { topic, difficulty, sourceText, numQuestions } = req.body;
    const count = numQuestions || 5;

    // ✅ TERA MODEL: User ne bola 2.5 Flash hai, toh wahi use karenge.
    // Agar tujhe Gemini 3 try karna hai toh yahan 'gemini-3.0-pro-exp' (ya jo exact slug ho) daal dena.
    const modelVersion = 'gemini-2.5-flash'; 

    let systemInstruction = sourceText 
        ? `Source Material: """${sourceText.substring(0, 25000)}""". Generate ${count} MCQs based on this.`
        : `Topic: "${topic}". Generate ${count} MCQs.`;

    const finalPrompt = `${systemInstruction} Difficulty: ${difficulty}. Output JSON array: [{"question":..., "options":["A)...","B)..."], "correctAnswer":"A", "explanation":"..."}]`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: finalPrompt }] }],
                // 🔥 CRITICAL FIX: Ye line "Bad control character" error ko rokegi.
                // Ye model ko force karegi ki wo valid JSON hi return kare.
                generationConfig: {
                    response_mime_type: "application/json"
                }
            })
        });

        const data = await response.json();

        // Agar model name galat hua ya API key issue hua toh yahan pakda jayega
        if (data.error) {
            console.error("Gemini API Error:", JSON.stringify(data.error, null, 2));
            throw new Error(data.error.message);
        }

        // Response handling
        let text = data.candidates[0].content.parts[0].text;
        
        // Cleanup (Just in case model markdown backticks bhej de)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Ab ye fatna nahi chahiye
        const json = JSON.parse(text);
        
        const usage = data.usageMetadata || { totalTokenCount: 0 };
        res.status(200).json({ quiz: json, usage }); 

    } catch (error) {
        console.error("Server Logic Error:", error);
        res.status(500).json({ error: error.message });
    }
};
