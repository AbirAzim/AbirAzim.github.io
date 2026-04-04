/**
 * GET /api/health — tells the client whether server-side chat (Gemini) is configured.
 * Never exposes the API key.
 */
export default function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).setHeader('Allow', 'GET').end();
        return;
    }

    const key = process.env.GEMINI_API_KEY;
    const chat = typeof key === 'string' && key.trim().length > 8;

    res.status(200).setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ chat }));
}
