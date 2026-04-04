// Professional rain: slate-blue streaks + fine drizzle only (no text / no glyph rain).
export class RainLayer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.drops = [];
        this.animationId = null;
    }

    init() {
        const container = document.getElementById('rain-layer');
        if (!container) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            container.style.display = 'none';
            return;
        }

        document.documentElement.classList.add('rainy-site');

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        container.appendChild(this.canvas);

        this.resizeCanvas();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.resizeCanvas(), 120);
        });

        this.animate();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;
        this.initDrops();
    }

    initDrops() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const area = w * h;
        const mobile = w <= 768;

        const heavyN = Math.min(mobile ? 70 : 150, Math.max(40, Math.floor(area / 22000)));
        const drizzleN = Math.min(mobile ? 85 : 180, Math.max(45, Math.floor(area / 14000)));

        const heavy = Array.from({ length: heavyN }, () => this.spawnDrop(w, h, true, 'heavy'));
        const drizzle = Array.from({ length: drizzleN }, () => this.spawnDrop(w, h, true, 'drizzle'));
        this.drops = [...heavy, ...drizzle];
    }

    spawnDrop(w, h, scatterY, tier) {
        if (tier === 'drizzle') {
            return {
                tier,
                x: Math.random() * w,
                y: scatterY ? Math.random() * h : -15 - Math.random() * 90,
                len: 3 + Math.random() * 12,
                speed: 0.4 + Math.random() * 0.9,
                drift: -0.1 + Math.random() * 0.2,
                width: 0.35 + Math.random() * 0.4,
                opacity: 0.04 + Math.random() * 0.07,
            };
        }

        return {
            tier: 'heavy',
            x: Math.random() * w,
            y: scatterY ? Math.random() * h : -40 - Math.random() * 150,
            len: 16 + Math.random() * 44,
            speed: 0.2 + Math.random() * 0.52,
            drift: -0.24 + Math.random() * 0.48,
            width: 0.45 + Math.random() * 0.65,
            opacity: 0.07 + Math.random() * 0.1,
        };
    }

    animate = () => {
        if (!this.ctx || !this.canvas) return;

        const w = this.canvas.width;
        const h = this.canvas.height;
        const light = document.documentElement.getAttribute('data-theme') === 'light';

        this.ctx.fillStyle = light
            ? 'rgba(248, 250, 252, 0.14)'
            : 'rgba(5, 12, 22, 0.16)';
        this.ctx.fillRect(0, 0, w, h);

        const pal = light
            ? {
                  heavy: {
                      head: 'rgba(55, 85, 118, 0.38)',
                      mid: 'rgba(90, 118, 148, 0.18)',
                      tail: 'rgba(148, 163, 184, 0)',
                  },
                  drizzle: {
                      head: 'rgba(75, 105, 138, 0.28)',
                      mid: 'rgba(110, 138, 168, 0.12)',
                      tail: 'rgba(160, 180, 200, 0)',
                  },
              }
            : {
                  heavy: {
                      head: 'rgba(215, 232, 248, 0.42)',
                      mid: 'rgba(140, 178, 210, 0.22)',
                      tail: 'rgba(95, 140, 175, 0)',
                  },
                  drizzle: {
                      head: 'rgba(185, 210, 232, 0.32)',
                      mid: 'rgba(125, 165, 198, 0.14)',
                      tail: 'rgba(80, 125, 155, 0)',
                  },
              };

        this.ctx.lineCap = 'round';

        for (let i = 0; i < this.drops.length; i++) {
            const d = this.drops[i];
            const p = pal[d.tier] || pal.heavy;
            const dx = d.drift * d.len * 0.35;
            const x1 = d.x;
            const y1 = d.y;
            const x2 = d.x + dx;
            const y2 = d.y + d.len;

            const g = this.ctx.createLinearGradient(x1, y1, x2, y2);
            g.addColorStop(0, p.head);
            g.addColorStop(0.42, p.mid);
            g.addColorStop(1, p.tail);

            this.ctx.strokeStyle = g;
            this.ctx.globalAlpha = d.opacity;
            this.ctx.lineWidth = d.width;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;

            d.y += d.speed;
            d.x += d.drift * 0.22;

            if (d.y > h + d.len + 24) {
                Object.assign(d, this.spawnDrop(w, h, false, d.tier));
            }
            if (d.x < -50) d.x = w + 24;
            if (d.x > w + 50) d.x = -24;
        }

        this.animationId = requestAnimationFrame(this.animate);
    };

    destroy() {
        document.documentElement.classList.remove('rainy-site');
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.canvas?.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    }
}
