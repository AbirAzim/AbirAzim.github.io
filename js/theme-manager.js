// Theme Manager Module
export class ThemeManager {
    constructor() {
        this.themeSwitch = null;
        this.root = document.documentElement;
    }

    init() {
        this.themeSwitch = document.querySelector('.theme-switch');

        // Saved choice wins; otherwise default dark (matches portfolio + Safari expectations)
        const saved = localStorage.getItem('theme');
        const initial = saved === 'light' || saved === 'dark' ? saved : 'dark';
        this.root.setAttribute('data-theme', initial);

        // Add event listener for theme switch
        if (this.themeSwitch) {
            this.themeSwitch.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        const currentTheme = this.root.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    getCurrentTheme() {
        return this.root.getAttribute('data-theme');
    }
}
