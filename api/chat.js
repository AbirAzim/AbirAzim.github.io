/**
 * POST /api/chat — Gemini and/or OpenAI (server-side keys only).
 * Env: GEMINI_API_KEY, OPENAI_API_KEY (either or both). Optional: GEMINI_MODEL, OPENAI_MODEL, CHAT_PROVIDER=gemini|openai|auto
 */
const SYSTEM_PROMPT =
    "You are the site assistant for Abir Azim Badhon's portfolio (backend / full-stack engineer). Be concise and professional. You may summarize his work: production GraphQL backends (Doerfy, Blending Recipe), multi-tenant AWS (Bigtopa: AppSync, Lambda, CDK, MongoDB), TypeScript, Stack Learner training. Contact: badhonkhanbk007@gmail.com, GitHub @AbirAzim, Dhaka. If asked something unrelated, answer briefly or redirect to portfolio topics.";

const DEFAULT_GEMINI_MODELS = ['gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-2.0-flash'];
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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

async function tryGemini(apiKey, message, history) {
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

    const payload = JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: 768, temperature: 0.65 },
    });

    const envModel = (process.env.GEMINI_MODEL || '').trim();
    const tryModels = envModel ? [envModel, ...DEFAULT_GEMINI_MODELS.filter((m) => m !== envModel)] : [...DEFAULT_GEMINI_MODELS];

    let lastError = 'Gemini request failed';

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
            if (geminiRes.status === 404) continue;
            return { ok: false, error: lastError };
        }

        const candidate = data?.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (text) return { ok: true, reply: text };

        const block = data?.promptFeedback?.blockReason;
        if (block) return { ok: false, error: `Response blocked (${block})` };

        lastError = candidate?.finishReason ? `No text (finish: ${candidate.finishReason})` : 'Empty model response';
    }

    return { ok: false, error: lastError };
}

async function tryOpenAI(apiKey, message, history) {
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    const recent = history.slice(-12);
    for (const h of recent) {
        if (h.role === 'user' && h.text) {
            messages.push({ role: 'user', content: String(h.text) });
        } else if (h.role === 'model' && h.text) {
            messages.push({ role: 'assistant', content: String(h.text) });
        }
    }
    messages.push({ role: 'user', content: message.trim() });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
            model: DEFAULT_OPENAI_MODEL,
            messages,
            max_tokens: 768,
            temperature: 0.65,
        }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data?.error?.message || `OpenAI HTTP ${res.status}`;
        return { ok: false, error: msg };
    }

    const text = data?.choices?.[0]?.message?.content;
    if (!text || typeof text !== 'string') {
        return { ok: false, error: 'Empty OpenAI response' };
    }
    return { ok: true, reply: text };
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

    const geminiKey = typeof process.env.GEMINI_API_KEY === 'string' ? process.env.GEMINI_API_KEY.trim() : '';
    const openaiKey = typeof process.env.OPENAI_API_KEY === 'string' ? process.env.OPENAI_API_KEY.trim() : '';

    const hasGemini = geminiKey.length >= 8;
    const hasOpenAI = openaiKey.length >= 8;

    if (!hasGemini && !hasOpenAI) {
        res.status(503).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Chat not configured: set GEMINI_API_KEY and/or OPENAI_API_KEY on Vercel.' }));
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

    const provider = (process.env.CHAT_PROVIDER || 'auto').toLowerCase();
    const tryGeminiFirst = provider === 'openai' ? false : provider === 'gemini' ? hasGemini : hasGemini;

    const sendReply = (reply) => {
        res.status(200).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ reply }));
    };

    const sendErr = (status, error) => {
        res.status(status).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error }));
    };

    try {
        if (tryGeminiFirst && hasGemini) {
            const g = await tryGemini(geminiKey, message, history);
            if (g.ok) {
                sendReply(g.reply);
                return;
            }
            if (hasOpenAI && provider !== 'gemini') {
                const o = await tryOpenAI(openaiKey, message, history);
                if (o.ok) {
                    sendReply(o.reply);
                    return;
                }
                return sendErr(502, `${o.error} (Gemini fallback: ${(g.error || '').slice(0, 280)})`);
            }
            return sendErr(502, g.error || 'Gemini failed');
        }

        if (hasOpenAI) {
            const o = await tryOpenAI(openaiKey, message, history);
            if (o.ok) {
                sendReply(o.reply);
                return;
            }
            if (hasGemini && provider !== 'openai') {
                const g = await tryGemini(geminiKey, message, history);
                if (g.ok) {
                    sendReply(g.reply);
                    return;
                }
                return sendErr(502, `${g.error} (OpenAI: ${(o.error || '').slice(0, 200)})`);
            }
            return sendErr(502, o.error || 'OpenAI failed');
        }

        if (hasGemini) {
            const g = await tryGemini(geminiKey, message, history);
            if (g.ok) {
                sendReply(g.reply);
                return;
            }
            return sendErr(502, g.error || 'Gemini failed');
        }

        sendErr(503, 'No provider available');
    } catch (err) {
        console.error('api/chat error:', err);
        sendErr(502, err?.message || 'Upstream request failed');
    }
}
