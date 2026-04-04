/**
 * GET /api/health — whether server-side chat is configured (Gemini and/or OpenAI).
 */
export default function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).setHeader('Allow', 'GET').end();
        return;
    }

    const g = typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.trim().length > 8;
    const o = typeof process.env.OPENAI_API_KEY === 'string' && process.env.OPENAI_API_KEY.trim().length > 8;
    const chat = g || o;

    res.status(200).setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ chat, providers: { gemini: g, openai: o } }));
}
