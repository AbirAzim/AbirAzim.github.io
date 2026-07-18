// GitHub Projects Manager Module
export class GitHubProjectsManager {
    constructor() {
        this.projectsContainer = null;
    }

    // Fetch GitHub projects with "featured" topic
    async fetchGitHubProjects(config) {
        this.projectsContainer = document.getElementById('projects');
        const username = config.github_username;
        const manualProjects = this.getManualProjects();

        if (!this.projectsContainer) return;

        // Always render manual projects in this section, even without GitHub username
        if (!username) {
            this.projectsContainer.innerHTML = '';
            this.renderProjects(manualProjects, null);
            return;
        }
        
        try {
            // Clear loading message
            this.projectsContainer.innerHTML = '';
            
            const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;
            const signal =
                typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
                    ? AbortSignal.timeout(15000)
                    : undefined;
            const response = await fetch(apiUrl, signal ? { signal } : {});
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            
            const repos = await response.json();
            
            // Filter repositories that have "featured" topic
            const featuredRepos = repos.filter(repo => 
                repo.topics && repo.topics.includes('community')
            );
            
            const reposToRender = this.mergeUniqueProjects(manualProjects, featuredRepos);
            this.renderProjects(reposToRender, username);
        } catch (error) {
            // Keep section useful even when GitHub API fails (rate-limit/network)
            this.renderProjects(manualProjects, username);
            console.error('Error loading GitHub projects:', error);
        }
    }

    // Render GitHub projects
    renderProjects(repos, username) {
        const fragment = document.createDocumentFragment();
        
        repos.forEach((repo, index) => {
            const card = this.createGitHubProjectCard(repo, index);
            fragment.appendChild(card);
        });
        
        this.projectsContainer.appendChild(fragment);
        if (username) {
            this.addSeeAllRepositoriesLink(username);
        }
    }

    // Create GitHub project card
    createGitHubProjectCard(repo, index) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Create content with improved accessibility
        card.innerHTML = `
            <h3>${repo.name}</h3>
            ${repo.description ? `<p>${repo.description}</p>` : '<p>No description available</p>'}
            <div class="project-links">
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" aria-label="View ${repo.name} repository on GitHub">View Repository</a>
                ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" aria-label="View live demo of ${repo.name}">Live Demo</a>` : ''}
            </div>
        `;
        
        return card;
    }

    // Helper function to add "See all repositories" link
    addSeeAllRepositoriesLink(username) {
        const projectsSection = document.querySelector('.projects-on-github');
        
        // Check if the "See all repositories" link already exists
        let seeAllLink = projectsSection.querySelector('.see-all-repos');
        
        if (!seeAllLink) {
            seeAllLink = document.createElement('div');
            seeAllLink.className = 'see-all-repos';
            
            const link = document.createElement('a');
            link.href = `https://github.com/${username}?tab=repositories`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', `See all GitHub repositories for ${username}`);
            link.textContent = 'See all repositories →';
            
            seeAllLink.appendChild(link);
            projectsSection.appendChild(seeAllLink);
        }
    }

    // Manual fallback projects shown when no community-tagged repos are found
    getManualProjects() {
        return [
            {
                name: 'Ke Jitbe (CTrend)',
                description: 'Ke Jitbe is my personal social comparison app — post side-by-side options, vote in real time, chat, earn coins, and follow friends. NestJS GraphQL backend + React/Expo clients. Web: kejitbe.app · Android on Google Play.',
                html_url: 'https://github.com/AbirAzim/CTrend',
                homepage: 'https://www.kejitbe.app/'
            },
            {
                name: 'typespeed',
                description: 'It helps users test and improve typing speed by typing randomly generated text under time pressure.',
                html_url: 'https://github.com/AbirAzim/typespeed',
                homepage: 'https://typespeedtesting.netlify.app'
            }
        ];
    }

    // Merge arrays and drop duplicate repositories by GitHub URL
    mergeUniqueProjects(primaryRepos, secondaryRepos) {
        const seen = new Set();
        const merged = [];

        [...primaryRepos, ...secondaryRepos].forEach((repo) => {
            const key = repo.html_url || repo.name;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(repo);
            }
        });

        return merged;
    }
}
