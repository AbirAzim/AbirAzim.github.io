/**
 * POST /api/chat — Gemini proxy. API key stays in Vercel env only.
 * Body: { message: string, history?: { role: 'user'|'model', text: string }[] }
 */
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).setHeader('Allow', 'POST').end();
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
        res.status(503).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Chat service not configured' }));
        return;
    }

    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            res.status(400).setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            return;
        }
    }

    const message = body?.message;
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'message is required' }));
        return;
    }

    const contents = [];
    const recent = history.slice(-12);
    for (const h of recent) {
        if (h.role === 'user' && h.text) {
            contents.push({ role: 'user', parts: [{ text: String(h.text) }] });
        } else if (h.role === 'model' && h.text) {
            contents.push({ role: 'model', parts: [{ text: String(h.text) }] });
        }
    }
    contents.push({ role: 'user', parts: [{ text: message.trim() }] });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(
        apiKey.trim()
    )}`;

    const systemInstruction = {
        parts: [
            {
                text: "You are the site assistant for Abir Azim Badhon's portfolio (backend / full-stack engineer). Be concise and professional. You may summarize his work: production GraphQL backends (Doerfy, Blending Recipe), multi-tenant AWS (Bigtopa: AppSync, Lambda, CDK, MongoDB), TypeScript, Stack Learner training. Contact: badhonkhanbk007@gmail.com, GitHub @AbirAzim, Dhaka. If asked something unrelated, answer briefly or redirect to portfolio topics.",
            },
        ],
    };

    try {
        const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction,
                contents,
                generationConfig: {
                    maxOutputTokens: 768,
                    temperature: 0.65,
                },
            }),
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            const msg = data?.error?.message || 'Gemini request failed';
            console.error('Gemini API error:', msg);
            res.status(502).setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: msg }));
            return;
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            res.status(502).setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Empty model response' }));
            return;
        }

        res.status(200).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ reply: text }));
    } catch (err) {
        console.error('api/chat error:', err);
        res.status(502).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Upstream request failed' }));
    }
}
