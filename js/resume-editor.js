export function initResumeEditor(config) {
    const existing = document.querySelector('.resume-editor-root');
    if (existing) existing.remove();

    const githubUrl = config.social_links?.find((item) => item.icon === 'github')?.url || '';
    const match = githubUrl.match(/github\.com\/([^/]+)/i);
    const username = match?.[1] || 'AbirAzim';
    const avatarUrl = `https://github.com/${username}.png`;

    const root = document.createElement('div');
    root.className = 'resume-editor-root';
    root.innerHTML = `
        <button type="button" class="resume-editor-launch" id="resume-editor-launch" aria-label="Open resume editor in new tab" style="position:fixed;right:8px;bottom:8px;z-index:10002;width:24px;height:24px;border-radius:999px;overflow:hidden;padding:0;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.55);opacity:.78;box-shadow:0 4px 10px rgba(0,0,0,.28);">
            <img src="${avatarUrl}" alt="Open resume editor" style="display:block;width:24px;height:24px;object-fit:cover;border-radius:999px;" />
        </button>
    `;

    document.body.appendChild(root);

    const launch = root.querySelector('#resume-editor-launch');

    launch?.addEventListener('click', () => {
        window.open('resume-editor.html?v=20260425-1', '_blank', 'noopener,noreferrer');
    });
}
