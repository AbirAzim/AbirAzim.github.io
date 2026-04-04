// Configuration Manager Module
export class ConfigManager {
    constructor() {
        this.config = null;
    }

    // Load and parse config
    async loadConfig() {
        const timeoutMs = 12000;
        const isFileProtocol = typeof window !== 'undefined' && window.location?.protocol === 'file:';
        try {
            const signal =
                typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
                    ? AbortSignal.timeout(timeoutMs)
                    : undefined;

            const response = await fetch('./config.json', signal ? { signal } : {});

            if (!response.ok) {
                throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
            }

            this.config = await response.json();

            if (!this.config) {
                throw new Error('Failed to parse config file - empty or invalid JSON');
            }

            console.log('Config loaded successfully');
            return this.config;
        } catch (error) {
            console.error('Error loading config:', error);
            const name = error?.name || '';
            const isTimeout = name === 'TimeoutError' || name === 'AbortError';
            const hint = isTimeout
                ? `Request timed out after ${timeoutMs / 1000}s.`
                : error?.message || 'Unknown error';
            this.showErrorMessage(hint, isFileProtocol);
            return null;
        }
    }

    // Display error message to user (keep DOM; file:// cannot fetch JSON in most browsers)
    showErrorMessage(message, isFileProtocol = false) {
        const loadingScreen = document.getElementById('loading-screen');
        const fileHint =
            isFileProtocol || (typeof window !== 'undefined' && window.location?.protocol === 'file:')
                ? `<p><strong>আপনি index.html সরাসরি ফাইল হিসেবে খুলেছেন (file://)।</strong> ব্রাউজার সুরক্ষার কারণে এভাবে <code>config.json</code> লোড করা যায় না বা আটকে যেতে পারে।</p>
                   <p>প্রজেক্ট ফোল্ডারে টার্মিনাল খুলে চালান:</p>
                   <pre style="background: rgba(0,0,0,.06); padding: 1rem; border-radius: 8px; overflow: auto; text-align: left;">npm run start</pre>
                   <p>তারপর ব্রাউজারে যে ঠিকানা দেখাবে (যেমন <code>http://localhost:5173</code>) সেটি খুলুন।</p>`
                : `<p>সমস্যা থাকলে <code>config.json</code> ফরম্যাট ও ফাইল পাথ চেক করুন। উপরের মতো <code>npm run start</code> দিয়ে লোকাল সার্ভারেও চেষ্টা করতে পারেন।</p>`;

        const safeMsg = String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;');

        if (loadingScreen) {
            loadingScreen.setAttribute('role', 'alert');
            loadingScreen.innerHTML = `
            <div style="max-width: 32rem; margin: 0 auto; padding: 1.5rem; text-align: left; font-family: system-ui, sans-serif; line-height: 1.5;">
                <h1 style="font-size: 1.25rem; margin-bottom: 0.75rem;">কনফিগ লোড হয়নি</h1>
                <p style="color: #b91c1c;">${safeMsg}</p>
                ${fileHint}
            </div>`;
            return;
        }

        document.body.innerHTML = `
            <div style="color: #b91c1c; padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
                <h1>Error Loading Configuration</h1>
                <p>${safeMsg}</p>
            </div>`;
    }

    getConfig() {
        return this.config;
    }

    // Helper function to get section title with fallback
    getSectionTitle(sectionKey) {
        const titles = {
            about: 'About',
            projects: this.config?.projects?.title || 'Projects',
            experience: this.config?.experience?.title || 'Experience',
            skills: this.config?.skills?.title || 'Skills',
            github_projects: this.config?.github_projects?.title || 'GitHub Projects'
        };
        return titles[sectionKey] || '';
    }

    // Helper function to check if content exists for a section
    hasContent(sectionKey) {
        switch (sectionKey) {
            case 'about':
                return this.config?.about?.paragraphs?.length > 0;
            case 'projects':
                return this.config?.projects?.items?.length > 0;
            case 'experience':
                return this.config?.experience?.jobs?.length > 0;
            case 'skills':
                return this.config?.skills?.categories?.length > 0;
            case 'github_projects':
                return Boolean(this.config?.github_username);
            default:
                return true;
        }
    }
}
