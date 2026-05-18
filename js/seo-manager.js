// SEO Manager — meta tags, canonical, Open Graph, Twitter Cards, JSON-LD
export class SEOManager {
    updateSEOTags(config) {
        const seo = config.site?.seo;
        if (!seo) return;

        const title = seo.title || config.site?.title || config.header?.greeting || 'Portfolio';
        const description = seo.description || config.site?.description || '';
        const canonical = seo.canonical_url || seo.base_url || window.location.href;
        const ogImage = seo.og_image || `https://github.com/${config.github_username || 'AbirAzim'}.png`;

        document.title = title;
        document.documentElement.lang = (seo.locale || 'en_US').split('_')[0];

        this.setMeta('name', 'description', description);
        this.setMeta('name', 'keywords', seo.keywords || '');
        this.setMeta('name', 'author', seo.author || config.header?.greeting || '');
        this.setMeta('name', 'robots', seo.robots || 'index, follow');
        this.setMeta('name', 'theme-color', seo.theme_color || '#0f172a');
        this.setMeta('name', 'geo.region', seo.geo_region || '');
        this.setMeta('name', 'geo.placename', seo.geo_placename || '');

        this.setLink('canonical', canonical);
        this.setAlternateLinks(seo.alternate_urls);

        this.setMeta('property', 'og:type', 'website');
        this.setMeta('property', 'og:url', canonical);
        this.setMeta('property', 'og:title', title);
        this.setMeta('property', 'og:description', description);
        this.setMeta('property', 'og:image', ogImage);
        this.setMeta('property', 'og:image:alt', seo.og_image_alt || title);
        this.setMeta('property', 'og:site_name', seo.site_name || title);
        this.setMeta('property', 'og:locale', seo.locale || 'en_US');

        const twitterCard = seo.twitter_card || 'summary_large_image';
        this.setMeta('name', 'twitter:card', twitterCard);
        this.setMeta('name', 'twitter:url', canonical);
        this.setMeta('name', 'twitter:title', title);
        this.setMeta('name', 'twitter:description', description);
        this.setMeta('name', 'twitter:image', ogImage);
        this.setMeta('name', 'twitter:image:alt', seo.og_image_alt || title);
        if (seo.twitter_site) this.setMeta('name', 'twitter:site', seo.twitter_site);
        if (seo.twitter_creator) this.setMeta('name', 'twitter:creator', seo.twitter_creator);

        this.updateFavicon(config);
        this.updateJsonLd(config, seo, { title, description, canonical, ogImage });
    }

    setMeta(attr, key, value) {
        if (value == null || value === '') return;
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            document.head.appendChild(el);
        }
        el.content = value;
    }

    setLink(rel, href) {
        if (!href) return;
        let el = document.querySelector(`link[rel="${rel}"]`);
        if (!el) {
            el = document.createElement('link');
            el.rel = rel;
            document.head.appendChild(el);
        }
        el.href = href;
    }

    setAlternateLinks(urls) {
        document.querySelectorAll('link[rel="alternate"][data-seo-alternate]').forEach((n) => n.remove());
        if (!Array.isArray(urls)) return;
        urls.forEach((url) => {
            if (!url) return;
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.href = url;
            link.setAttribute('data-seo-alternate', 'true');
            document.head.appendChild(link);
        });
    }

    updateJsonLd(config, seo, { title, description, canonical, ogImage }) {
        const personId = `${canonical.replace(/\/$/, '')}#person`;
        const websiteId = `${canonical.replace(/\/$/, '')}#website`;
        const profilePageId = `${canonical.replace(/\/$/, '')}#profilepage`;
        const sameAs = config.social_links?.map((link) => link.url).filter(Boolean) || [];
        const emailLink = config.social_links?.find((l) => l.icon === 'email');
        const knowsAbout = seo.knows_about || [];

        const alternateNames = Array.isArray(seo.alternate_names)
            ? seo.alternate_names.filter(Boolean)
            : [];

        const professionalSummary =
            config.header?.professional_summary ||
            seo.professional_summary ||
            description;

        const person = {
            '@type': 'Person',
            '@id': personId,
            name: config.header?.greeting || seo.author,
            alternateName: alternateNames.length ? alternateNames : undefined,
            givenName: 'Abir Azim',
            familyName: 'Badhon',
            additionalName: 'Khan',
            nickname: 'bk007',
            url: canonical,
            image: ogImage,
            jobTitle: 'Backend Software Engineer',
            description: professionalSummary,
            hasOccupation: {
                '@type': 'Occupation',
                name: 'Backend Software Engineer',
                description: seo.years_experience
                    ? `${seo.years_experience} years software development; production GraphQL, AWS, MongoDB`
                    : 'Production GraphQL, AWS, and scalable backend systems'
            },
            email: emailLink?.url?.replace(/^mailto:/i, '') || undefined,
            sameAs,
            knowsAbout: knowsAbout.length ? knowsAbout : undefined
        };

        if (seo.geo_placename) {
            person.address = {
                '@type': 'PostalAddress',
                addressLocality: 'Dhaka',
                addressCountry: 'BD'
            };
        }

        const firstJob = config.experience?.jobs?.[0];
        if (firstJob) {
            person.worksFor = {
                '@type': 'Organization',
                name: firstJob.company
            };
        }

        const graph = [
            {
                '@type': 'WebSite',
                '@id': websiteId,
                url: canonical,
                name: seo.site_name || title,
                description,
                inLanguage: (seo.locale || 'en_US').split('_')[0],
                publisher: { '@id': personId }
            },
            {
                '@type': 'ProfilePage',
                '@id': profilePageId,
                url: canonical,
                name: title,
                description,
                isPartOf: { '@id': websiteId },
                mainEntity: { '@id': personId },
                inLanguage: (seo.locale || 'en_US').split('_')[0]
            },
            person
        ];

        let script = document.querySelector('script[type="application/ld+json"][data-seo-schema]');
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-seo-schema', 'true');
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
    }

    updateFavicon(config) {
        const username = (config.github_username || '').trim();
        if (!username) return;

        const href = `https://github.com/${username}.png`;

        let iconLink = document.querySelector('link[rel="icon"]');
        if (!iconLink) {
            iconLink = document.createElement('link');
            iconLink.rel = 'icon';
            document.head.appendChild(iconLink);
        }
        iconLink.type = 'image/png';
        iconLink.href = href;

        let apple = document.querySelector('link[rel="apple-touch-icon"]');
        if (!apple) {
            apple = document.createElement('link');
            apple.rel = 'apple-touch-icon';
            document.head.appendChild(apple);
        }
        apple.href = href;
    }
}
