const EDITOR_PASSWORD = 'badhonush007';

function stripHtml(value = '') {
    return String(value).replace(/<[^>]*>/g, '');
}

function escapeMd(text = '') {
    return String(text).replace(/\n/g, ' ').trim();
}

function pickSocial(config, icon) {
    return config.social_links?.find((item) => item.icon === icon)?.url || '';
}

function buildSkillsMarkdown(config) {
    const categories = config.skills?.categories || [];
    return categories
        .map((category) => {
            const items = (category.items || []).map((item) => (typeof item === 'object' ? item.name : item));
            return `### ${category.name}\n${items.map((x) => `- ${escapeMd(x)}`).join('\n')}`;
        })
        .join('\n\n');
}

function buildProjectsMarkdown(config) {
    const featured = config.projects?.items || [];
    const lines = featured.map((project) => {
        const url = typeof project.link === 'object' ? project.link.url : project.link || '';
        return `- ${escapeMd(project.name)}${url ? `\n  Live: ${url}` : ''}`;
    });
    return lines.join('\n');
}

function buildExperienceMarkdown(config) {
    const jobs = config.experience?.jobs || [];
    return jobs
        .map((job) => {
            const items = (job.responsibilities || []).map((r) => `  - ${escapeMd(stripHtml(r))}`);
            return [
                `### ${escapeMd(job.company)}`,
                `- Role: ${escapeMd(job.role)}`,
                `- Duration: ${escapeMd(job.date || 'N/A')}`,
                '- Key Contributions:',
                ...items
            ].join('\n');
        })
        .join('\n\n');
}

function generateMarkdownFromConfig(config) {
    return `# ${escapeMd(config.header?.greeting || 'Profile')}

## Basic Information
- Name: ${escapeMd(config.header?.greeting)}
- Current Role: ${escapeMd(config.header?.tagline)}
- Location: Dhaka, Bangladesh
- Email: ${pickSocial(config, 'email').replace('mailto:', '')}
- LinkedIn: ${pickSocial(config, 'linkedin')}
- GitHub: ${pickSocial(config, 'github')}
- LeetCode: ${pickSocial(config, 'leetcode')}
- Portfolio: ${escapeMd(config.site?.seo?.base_url || '')}

## Professional Summary
${escapeMd(config.site?.description || '')}

## Professional Experience
${buildExperienceMarkdown(config)}

## Projects
${buildProjectsMarkdown(config)}

## Skills
${buildSkillsMarkdown(config)}
`;
}

async function loadConfig() {
    const res = await fetch(`./config.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load config');
    return res.json();
}

document.addEventListener('DOMContentLoaded', async () => {
    const auth = document.getElementById('editor-auth');
    const body = document.getElementById('editor-body');
    const password = document.getElementById('editor-password');
    const unlock = document.getElementById('editor-unlock');
    const error = document.getElementById('editor-error');
    const textarea = document.getElementById('editor-textarea');
    const download = document.getElementById('editor-download');

    let config = null;
    try {
        config = await loadConfig();
    } catch {
        error.hidden = false;
        error.textContent = 'Failed to load data from config.json';
        return;
    }

    unlock?.addEventListener('click', () => {
        if (password.value !== EDITOR_PASSWORD) {
            error.hidden = false;
            error.textContent = 'Wrong password';
            return;
        }
        error.hidden = true;
        auth.hidden = true;
        body.hidden = false;
        textarea.value = generateMarkdownFromConfig(config);
    });

    download?.addEventListener('click', () => {
        const blob = new Blob([textarea.value], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ABIR_PROFILE_EXTRACTED.md';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });
});
