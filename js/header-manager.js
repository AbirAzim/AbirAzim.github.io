// Header Manager Module
export class HeaderManager {
    // Update header section
    updateHeaderSection(config) {
        // Extract GitHub username for profile image
        const githubUsername = config.github_username || this.extractGithubUsername(config.social_links);
        
        // Update profile image
        const profileImg = document.querySelector('.profile-img');
        if (githubUsername && profileImg) {
            profileImg.src = `https://avatars.githubusercontent.com/${githubUsername}`;
        }
        if (profileImg) {
            const displayName = config.header?.greeting || 'Abir Azim Badhon';
            profileImg.alt = `${displayName} — Badhon Khan (bk007)`;
        }

        // Update header text
        document.querySelector('h1').textContent = config.header.greeting;
        this.updateSearchAliases(config.header?.search_aliases);
        document.querySelector('.tagline').textContent = config.header.tagline;
        this.updateProfessionalSummary(
            config.header?.professional_summary || config.site?.seo?.professional_summary
        );

        this.updateResumeButton(config);

        // Update social links
        this.updateSocialLinks(config);
    }

    updateProfessionalSummary(summaryText) {
        const el = document.querySelector('.professional-summary');
        if (!el) return;
        const text = (summaryText || '').trim();
        if (!text) {
            el.hidden = true;
            return;
        }
        el.textContent = text;
        el.hidden = false;
    }

    updateSearchAliases(aliasesText) {
        const el = document.querySelector('.name-aliases');
        if (!el) return;
        const text = (aliasesText || '').trim();
        if (!text) {
            el.hidden = true;
            return;
        }
        el.textContent = text;
        el.hidden = false;
    }

    updateResumeButton(config) {
        const wrap = document.getElementById('header-resume-wrap');
        const btn = document.getElementById('resume-download-btn');
        if (!wrap || !btn) return;

        const path = config.header?.resume_pdf?.trim();
        if (!path) {
            wrap.hidden = true;
            return;
        }

        btn.href = path;
        const filename = config.header?.resume_download_name?.trim() || 'resume.pdf';
        btn.setAttribute('download', filename);
        btn.setAttribute('aria-label', `Download resume as ${filename}`);
        wrap.hidden = false;
    }

    // Extract GitHub username from social links
    extractGithubUsername(socialLinks) {
        const githubLink = socialLinks?.find(link => link.icon === 'github');
        if (githubLink?.url) {
            const match = githubLink.url.match(/github\.com\/([^\/]+)/);
            return match?.[1];
        }
        return null;
    }

    // Update social links dynamically
    updateSocialLinks(config) {
        const socialLinks = document.querySelector('.social-links');
        const fragment = document.createDocumentFragment();
        
        // Clear existing links
        socialLinks.innerHTML = '';

        const requiredLinks = [
            { name: 'LinkedIn', url: 'https://www.linkedin.com/in/badhon-khan-007/', icon: 'linkedin' },
            { name: 'GitHub', url: 'https://github.com/AbirAzim', icon: 'github' },
            { name: 'Email', url: 'mailto:badhonkhanbk007@gmail.com', icon: 'email' },
            { name: 'LeetCode', url: 'https://leetcode.com/u/AbirAzimKhan/', icon: 'leetcode' }
        ];

        const configuredLinks = Array.isArray(config.social_links) ? config.social_links : [];
        const mergedLinks = this.mergeSocialLinks(requiredLinks, configuredLinks);

        // Process social links from config
        if (mergedLinks.length > 0) {
            mergedLinks.forEach(linkConfig => {
                const link = this.createSocialLink(linkConfig);
                if (link) fragment.appendChild(link);
            });
        }

        // Append all links at once
        socialLinks.appendChild(fragment);
    }

    // Create individual social link element
    createSocialLink(linkConfig) {
        const iconTemplate = document.querySelector(`#${linkConfig.icon}-icon`);
        const link = document.createElement('a');
        
        link.href = linkConfig.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${linkConfig.name} Profile`);

        if (iconTemplate) {
            const iconClone = iconTemplate.content.cloneNode(true);
            link.appendChild(iconClone);
        } else {
            console.warn(`Icon template not found for: ${linkConfig.icon}`);
            link.appendChild(document.createTextNode('🔗'));
        }

        link.appendChild(document.createTextNode(linkConfig.name));
        
        return link;
    }

    mergeSocialLinks(requiredLinks, configuredLinks) {
        const byIcon = new Map();

        requiredLinks.forEach((item) => byIcon.set(item.icon, item));
        configuredLinks.forEach((item) => {
            if (item && item.icon) byIcon.set(item.icon, item);
        });

        const preferredOrder = ['linkedin', 'github', 'email', 'leetcode'];
        const ordered = [];

        preferredOrder.forEach((icon) => {
            if (byIcon.has(icon)) ordered.push(byIcon.get(icon));
        });

        byIcon.forEach((value, key) => {
            if (!preferredOrder.includes(key)) ordered.push(value);
        });

        return ordered;
    }
}
