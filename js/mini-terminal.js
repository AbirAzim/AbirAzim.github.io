/**
 * Decorative mini-terminal: types random dev/Linux-style commands (typing animation).
 */
const PROMPT_HTML = `<span class="mini-terminal-prompt-user">abir@portfolio</span><span class="mini-terminal-prompt-muted">:</span><span class="mini-terminal-prompt-path">~</span><span class="mini-terminal-prompt-muted">$ </span>`;

const COMMANDS = [
    'git status --short',
    'npm run build',
    'docker compose ps',
    'kubectl get pods -n production',
    'curl -sSf localhost:4000/health | jq .',
    'cd ~/work/doerfy && yarn dev',
    'aws lambda list-functions --max-items 5',
    'mongosh --eval "db.stats()"',
    'cdk diff --all',
    'pnpm exec eslint src --max-warnings 0',
    'ssh deploy@api.example.com "uptime"',
    'grep -R "TODO" src/ --include="*.ts" | head -3',
    'chmod +x scripts/deploy.sh && ./scripts/deploy.sh',
    'vercel env pull .env.local',
    'terraform plan -out=tfplan',
    'redis-cli ping',
    'openssl x509 -in cert.pem -noout -dates',
];

const OUTPUTS = [
    'On branch main\nnothing to commit, working tree clean',
    '✓ built in 4.2s',
    'NAME    STATE\napi-1   running',
    'NAME           READY   STATUS\ngraphql-svc    2/2     Running',
    '{"status":"ok","uptime":"72h"}',
    '▶ GraphQL Yoga listening on :4000',
    '… 5 functions loaded',
    '{ ok: 1 }',
    'No changes — stack is up to date',
    '✓ 0 problems',
    'load average: 0.12, 0.08, 0.05',
    'src/api/handler.ts:42:  // TODO: cache',
    '→ Deploy complete.',
    '✓ Downloaded Environment Variables',
    'Plan: 2 to add, 0 to change, 1 to destroy.',
    'PONG',
    'notBefore=Jan  1 00:00:00 2025 GMT',
];

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function pickDifferent(last) {
    let cmd = COMMANDS[Math.floor(Math.random() * COMMANDS.length)];
    let guard = 0;
    while (cmd === last && guard++ < 20) {
        cmd = COMMANDS[Math.floor(Math.random() * COMMANDS.length)];
    }
    return cmd;
}

export function initMiniTerminal() {
    const root = document.getElementById('mini-terminal');
    const historyEl = document.getElementById('mini-terminal-history');
    const typedEl = document.getElementById('mini-terminal-typed');
    const screenEl = root?.querySelector('.mini-terminal-screen');
    if (!root || !historyEl || !typedEl || !screenEl) return;

    const maxLines = 40;
    let lastCmd = '';
    let cancelled = false;

    function scrollTerminalToBottom() {
        requestAnimationFrame(() => {
            screenEl.scrollTop = screenEl.scrollHeight;
        });
    }

    function trimHistory() {
        while (historyEl.children.length > maxLines) {
            historyEl.removeChild(historyEl.firstChild);
        }
    }

    function appendHistory(html, className = 'mini-terminal-line') {
        const row = document.createElement('div');
        row.className = className;
        row.innerHTML = html;
        historyEl.appendChild(row);
        trimHistory();
        scrollTerminalToBottom();
    }

    async function typeCommand(cmd) {
        typedEl.textContent = '';
        for (let i = 0; i < cmd.length; i++) {
            if (cancelled) return;
            while (document.hidden) {
                await sleep(400);
            }
            typedEl.textContent += cmd[i];
            if (i % 4 === 0 || i === cmd.length - 1) {
                scrollTerminalToBottom();
            }
            await sleep(28 + Math.random() * 55);
        }
        scrollTerminalToBottom();
    }

    async function loop() {
        while (!cancelled) {
            const cmd = pickDifferent(lastCmd);
            lastCmd = cmd;

            await typeCommand(cmd);
            if (cancelled) return;

            await sleep(180 + Math.random() * 220);

            const fullLine = `${PROMPT_HTML}<span class="mini-terminal-cmd">${escapeHtml(cmd)}</span>`;
            appendHistory(fullLine, 'mini-terminal-line mini-terminal-line--input');

            typedEl.textContent = '';

            const out = OUTPUTS[Math.floor(Math.random() * OUTPUTS.length)];
            const outEscaped = escapeHtml(out).replace(/\n/g, '<br>');
            appendHistory(`<span class="mini-terminal-output">${outEscaped}</span>`, 'mini-terminal-line mini-terminal-line--out');

            await sleep(1400 + Math.random() * 1800);
        }
    }

    loop();
    return () => {
        cancelled = true;
    };
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
