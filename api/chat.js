/**
 * POST /api/chat — Gemini proxy. API key stays in Vercel env only.
 * Body: { message: string, history?: { role: 'user'|'model', text: string }[] }
 */
/* Try smaller / separate free-tier pools before 2.0 (often hits quota: 0 first). */
const DEFAULT_MODELS = ['gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-2.0-flash'];

async function readJsonBody(req) {
    if (req.body != null && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return req.body;
    }
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch {
            return {};
        }
    }
    if (Buffer.isBuffer(req.body)) {
        try {
            return JSON.parse(req.body.toString('utf8') || '{}');
        } catch {
            return {};
        }
    }
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf8');
                resolve(raw ? JSON.parse(raw) : {});
            } catch {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(204).setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).setHeader('Allow', 'POST, OPTIONS').end();
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
        res.status(503).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Chat service not configured' }));
        return;
    }

    const body = await readJsonBody(req);
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

    const systemInstruction = {
        parts: [
            {
                text: "You are the site assistant for Abir Azim Badhon's portfolio (backend / full-stack engineer). Be concise and professional. You may summarize his work: production GraphQL backends (Doerfy, Blending Recipe), multi-tenant AWS (Bigtopa: AppSync, Lambda, CDK, MongoDB), TypeScript, Stack Learner training. Contact: badhonkhanbk007@gmail.com, GitHub @AbirAzim, Dhaka. If asked something unrelated, answer briefly or redirect to portfolio topics.",
            },
        ],
    };

    const payload = JSON.stringify({
        systemInstruction,
        contents,
        generationConfig: {
            maxOutputTokens: 768,
            temperature: 0.65,
        },
    });

    const envModel = (process.env.GEMINI_MODEL || '').trim();
    const tryModels = envModel ? [envModel, ...DEFAULT_MODELS.filter((m) => m !== envModel)] : [...DEFAULT_MODELS];

    let lastError = 'Gemini request failed';

    try {
        for (const model of tryModels) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
                apiKey.trim()
            )}`;

            const geminiRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
            });

            const data = await geminiRes.json();

            if (!geminiRes.ok) {
                lastError = data?.error?.message || `HTTP ${geminiRes.status}`;
                if (geminiRes.status === 404) {
                    continue;
                }
                console.error('Gemini API error:', lastError);
                res.status(502).setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: lastError }));
                return;
            }

            const candidate = data?.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text;
            if (text) {
                res.status(200).setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ reply: text }));
                return;
            }

            const block = data?.promptFeedback?.blockReason;
            if (block) {
                lastError = `Response blocked (${block})`;
                res.status(502).setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: lastError }));
                return;
            }

            lastError = candidate?.finishReason ? `No text (finish: ${candidate.finishReason})` : 'Empty model response';
        }

        res.status(502).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: lastError }));
    } catch (err) {
        console.error('api/chat error:', err);
        res.status(502).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err?.message || 'Upstream request failed' }));
    }
}
