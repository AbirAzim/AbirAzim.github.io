// Theme Manager Module
const THEMES = ['light', 'dark', 'dev'];

export class ThemeManager {
    constructor() {
        this.themeSwitch = null;
        this.root = document.documentElement;
    }

    init() {
        this.themeSwitch = document.querySelector('.theme-switch');

        // Saved choice wins; otherwise default dev
        const saved = localStorage.getItem('theme');
        const initial = THEMES.includes(saved) ? saved : 'dev';
        this.root.setAttribute('data-theme', initial);

        if (this.themeSwitch) {
            this.updateAriaLabel(initial);
            this.themeSwitch.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        const current = this.root.getAttribute('data-theme');
        const idx = THEMES.indexOf(current);
        const next = THEMES[(idx + 1) % THEMES.length];

        this.root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);

        this.updateAriaLabel(next);
    }

    updateAriaLabel(currentTheme) {
        if (!this.themeSwitch) return;
        const labels = {
            light: 'Switch to dark mode',
            dark: 'Switch to developer mode',
            dev: 'Switch to light mode'
        };
        this.themeSwitch.setAttribute('aria-label', labels[currentTheme] ?? 'Switch theme');
    }

    getCurrentTheme() {
        return this.root.getAttribute('data-theme');
    }
}
