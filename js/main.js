// Main Application Module
import { ConfigManager } from './config-manager.js?v=20260718-1';
import { SEOManager } from './seo-manager.js';
import { ThemeManager } from './theme-manager.js?v=20260718-1';
import { LoadingManager } from './loading-manager.js';
import { SectionManager } from './section-manager.js?v=20260718-1';
import { HeaderManager } from './header-manager.js?v=20260718-1';
import { GitHubProjectsManager } from './github-projects-manager.js?v=20260718-1';
import { FooterManager } from './footer-manager.js?v=20260718-1';
import { FluidBackground } from './fluid-background.js';
import { RainLayer } from './rain-layer.js';
import { ChatbotManager } from './chatbot.js';
import { initMiniTerminal } from './mini-terminal.js';
import { initResumeEditor } from './resume-editor.js?v=20260425-7';

function initPayoneerPanel() {
    const btn = document.getElementById('payoneer-copy');
    const span = document.getElementById('payoneer-email');
    if (!btn || !span) return;
    const raw = span.textContent.trim().replace(/\s/g, '');
    btn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(raw);
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = 'Copy email';
            }, 2000);
        } catch {
            btn.textContent = 'Copy manually';
            setTimeout(() => {
                btn.textContent = 'Copy email';
            }, 2500);
        }
    });
}

class PortfolioApp {
    constructor() {
        this.configManager = new ConfigManager();
        this.seoManager = new SEOManager();
        this.themeManager = new ThemeManager();
        this.loadingManager = new LoadingManager();
        this.sectionManager = new SectionManager(this.configManager);
        this.headerManager = new HeaderManager();
        this.githubProjectsManager = new GitHubProjectsManager();
        this.footerManager = new FooterManager();
        this.fluidBackground = new FluidBackground();
        this.rainLayer = new RainLayer();
        this.chatbotManager = new ChatbotManager();
    }

    async init() {
        try {
            // Initialize theme first
            this.themeManager.init();

            // Initialize fluid background
            this.fluidBackground.init();

            this.rainLayer.init();

            // Initialize chatbot (conditionally based on API key)
            await this.chatbotManager.init();
            initPayoneerPanel();
            initMiniTerminal();

            // Load configuration
            const config = await this.configManager.loadConfig();
            if (!config) {
                this.loadingManager.hideLoadingScreen(false);
                return;
            }

            // Update SEO tags first
            this.seoManager.updateSEOTags(config);

            // Update header section
            this.headerManager.updateHeaderSection(config);

            // Update page content from config
            this.sectionManager.updatePageContent(config);

            // Update footer section
            this.footerManager.updateFooterSection(config);

            // Password-protected resume editor + markdown download
            initResumeEditor(config);

            // Render Projects on GitHub section (manual projects always shown)
            const features = { github_projects: true, ...config.features };
            if (features.github_projects) {
                await this.githubProjectsManager.fetchGitHubProjects(config);
            }
            
            // Hide loading screen after all content has loaded
            this.loadingManager.hideLoadingScreen();

        } catch (error) {
            console.error('Error initializing portfolio:', error);
            this.loadingManager.hideLoadingScreen(false);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    app.init();
});
