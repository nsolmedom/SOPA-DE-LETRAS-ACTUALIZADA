// api/generate_level.js
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    const { topic, difficulty, usedWords } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    const difficultyMap = {
        'facil': { count: 6, gridSize: 8, directions: ['horizontal', 'vertical'] },
        'medio': { count: 8, gridSize: 10, directions: ['horizontal', 'vertical', 'diagonal'] },
        'dificil': { count: 10, gridSize: 12, directions: ['horizontal', 'vertical', 'diagonal', 'reverse'] },
        'experto': { count: 12, gridSize: 15, directions: ['horizontal', 'vertical', 'diagonal', 'reverse', 'diagonal-reverse'] }
    };

    const configSettings = difficultyMap[difficulty] || difficultyMap['facil'];
    const count = configSettings.count;

    const prompt = `
    Actúa como un profesor experto en agricultura. Genera un nivel de sopa de letras sobre el tema: "${topic}".
    
    Requisitos estrictos:
    1. Genera exactamente ${count} palabras relacionadas.
    2. Las palabras deben tener máximo 12 letras, en mayúsculas, sin tildes, sin espacios (usa _ si es necesario).
    3. Para CADA palabra, genera un "fact" (dato curioso) educativo, interesante y breve (máximo 20 palabras).
    4. NO repitas estas palabras: ${usedWords ? usedWords : 'ninguna'}.
    
    Responde SOLAMENTE con este formato JSON válido:
    {
      "words": [
        { "word": "EJEMPLO", "fact": "Dato curioso sobre el ejemplo." },
        ...
      ]
    }
    `;

    const payload = {
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 800,
        temperature: 0.7
    };

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://agroletras.vercel.app', // Ajustar según producción
                'X-Title': 'Agroletras'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Error upstream provider');
        }

        const data = await response.json();
        // Just return the raw data or parsed content?
        // Let's return the content directly to simplify client
        const content = JSON.parse(data.choices[0].message.content);

        // Return structured data for the client
        return res.status(200).json({
            gridSize: configSettings.gridSize,
            directions: configSettings.directions,
            wordsData: content.words // [{word, fact}, ...]
        });

    } catch (error) {
        console.error('AI Proxy Error:', error);
        return res.status(500).json({ error: 'Error generating level' });
    }
}
