/**
 * Zephyr Visual FX Engine
 * Canvas particles, cursor glow, interactive effects
 */
const ZephyrFX = {
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    canvas: null,
    ctx: null,
    particles: [],
    stars: [],
    shootingStars: [],
    burstParticles: [],
    animId: null,
    frameCount: 0,

    init() {
        this.createParticleCanvas();
        this.createCursorGlow();
        this.initTiltCards();
        this.initMagneticElements();
        this.initRipples();
        this.initLogoFX();
        this.initTypingPlaceholder();
        this.initSmoothReveal();
        this.initHoverGlows();
        this.initWelcomeEffects();
        this.initNavAnimations();   // NEW: stagger + glow nav
        this.initSidebarFX();       // NEW: sidebar sweep shimmer
        this.initScrollbarFX();     // NEW: glowing scrollbars + pulse
        this.trackMouse();
        this.animate();
        window.addEventListener('resize', () => this.resizeCanvas());
        console.log('✨ ZephyrFX engine started');
    },

    /* ==========================================
       CANVAS PARTICLE SYSTEM
       Floating particles across the whole page
    ========================================== */
    createParticleCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'fx-canvas';
        this.canvas.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 1;
    `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.spawnStars(220);
        this.spawnFloaters(180);
        this.nebulaClouds = this.createNebulaClouds(10);
        this.initClickBurst();
    },

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    spawnStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            const depth = Math.random();
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: 0.3 + depth * 1.8,
                alpha: 0.05 + depth * 0.4,
                pulse: Math.random() * Math.PI * 2,
                speed: 0.003 + depth * 0.015,
                depth: depth,
            });
        }
    },

    spawnFloaters(count) {
        this.particles = [];
        const colors = [
            { r: 139, g: 92, b: 246 },   // purple
            { r: 167, g: 139, b: 250 },  // lighter purple
            { r: 196, g: 181, b: 253 },  // soft lavender
            { r: 6, g: 182, b: 212 },    // cyan
            { r: 59, g: 130, b: 246 },   // blue
            { r: 251, g: 191, b: 36 },   // gold
            { r: 236, g: 72, b: 153 },   // pink
            { r: 255, g: 255, b: 255 },  // white
            { r: 16, g: 185, b: 129 },   // emerald
            { r: 245, g: 158, b: 11 },   // amber
        ];
        for (let i = 0; i < count; i++) {
            const c = colors[Math.floor(Math.random() * colors.length)];
            const baseSize = 0.8 + Math.random() * 3.5;
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.35,
                vy: -0.08 - Math.random() * 0.28,
                size: baseSize,
                baseSize: baseSize,
                color: c,
                alpha: 0.12 + Math.random() * 0.45,
                baseAlpha: 0.12 + Math.random() * 0.45,
                life: Math.random(),
                lifeSpeed: 0.0005 + Math.random() * 0.0012,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.005 + Math.random() * 0.016,
                orbitAngle: Math.random() * Math.PI * 2,
            });
        }
    },

    initClickBurst() {
        document.addEventListener('click', (e) => {
            // Use theme particle colors for burst
            const colors = (this._themeColors?.primary)
                ? [ {r:this._themeColors.primary[0],g:this._themeColors.primary[1],b:this._themeColors.primary[2]},
                    {r:this._themeColors.secondary?.[0]||255,g:this._themeColors.secondary?.[1]||255,b:this._themeColors.secondary?.[2]||255},
                    {r:255,g:255,b:255},{r:251,g:191,b:36} ]
                : [ {r:139,g:92,b:246},{r:167,g:139,b:250},{r:251,g:191,b:36},{r:6,g:182,b:212} ];
            for (let i = 0; i < 14; i++) {
                const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
                const speed = 2 + Math.random() * 3.5;
                const c = colors[Math.floor(Math.random() * colors.length)];
                this.burstParticles.push({
                    x: e.clientX, y: e.clientY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 1.5 + Math.random() * 2.5,
                    color: c,
                    alpha: 0.7 + Math.random() * 0.3,
                    life: 1,
                    trail: [],
                });
            }
            // Center flash
            this.burstParticles.push({
                x: e.clientX, y: e.clientY,
                vx: 0, vy: 0,
                size: 8,
                color: { r: 255, g: 255, b: 255 },
                alpha: 0.9,
                life: 0.4,
                trail: [],
            });
        });
    },

    maybeSpawnShootingStar() {
        if (Math.random() > 0.994) {
            const W = this.canvas.width, H = this.canvas.height;
            const tc = this._themeColors;
            const hues = tc ? [`${tc.cursorGlow}`,`${tc.lineHover}`,`${tc.lineColor}`,'rgba(255,255,255,']
                           : ['rgba(200,190,255,','rgba(139,92,246,','rgba(236,72,153,','rgba(6,182,212,'];
            const hue = hues[Math.floor(Math.random() * hues.length)];
            this.shootingStars.push({
                x: Math.random() * W * 0.8,
                y: Math.random() * H * 0.35,
                vx: 3 + Math.random() * 5,
                vy: 1 + Math.random() * 2.5,
                life: 1,
                length: 50 + Math.random() * 90,
                hue,
            });
        }
    },

    drawParticles() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;
        ctx.clearRect(0, 0, W, H);
        this.frameCount++;

        // Draw nebula clouds (behind everything)
        if (this.nebulaClouds) {
            this.nebulaClouds.forEach(cloud => {
                cloud.phase += 0.003;
                const x = cloud.x + Math.sin(cloud.phase) * 30;
                const y = cloud.y + Math.cos(cloud.phase * 0.7) * 20;
                const a = cloud.alpha * (0.5 + 0.5 * Math.sin(cloud.phase * 0.5));
                const grad = ctx.createRadialGradient(x, y, 0, x, y, cloud.radius);
                grad.addColorStop(0, `rgba(${cloud.color.r},${cloud.color.g},${cloud.color.b},${a})`);
                grad.addColorStop(0.5, `rgba(${cloud.color.r},${cloud.color.g},${cloud.color.b},${a * 0.3})`);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.beginPath(); ctx.arc(x, y, cloud.radius, 0, Math.PI * 2);
                ctx.fillStyle = grad; ctx.fill();
            });
        }

        // Shooting stars
        this.maybeSpawnShootingStar();
        this.shootingStars = this.shootingStars.filter(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.life -= 0.018;
            if (s.life <= 0) return false;
            const hue = s.hue || 'rgba(200,190,255,';
            const grad = ctx.createLinearGradient(
                s.x, s.y, s.x - s.vx * s.length / Math.max(s.vx, 1), s.y - s.vy * s.length / Math.max(s.vy, 1)
            );
            grad.addColorStop(0, `${hue}${s.life * 0.8})`);
            grad.addColorStop(1, `${hue}0)`);
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.vx * 10, s.y - s.vy * 10);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5 + s.life;
            ctx.lineCap = 'round';
            ctx.stroke();
            // Head glow
            const hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 5);
            hg.addColorStop(0, `rgba(255,255,255,${s.life * 0.9})`);
            hg.addColorStop(1, `${hue}0)`);
            ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = hg; ctx.fill();
            return true;
        });

        // Draw twinkling stars
        const _sc = this._themeColors?.starColor || '200,190,255';
        this.stars.forEach(s => {
            s.pulse += s.speed;
            const a = s.alpha * (0.4 + 0.6 * Math.sin(s.pulse));
            const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
            sg.addColorStop(0, `rgba(${_sc}, ${a * 0.5})`);
            sg.addColorStop(1, `rgba(${_sc}, 0)`);
            ctx.beginPath(); ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
            ctx.fillStyle = sg; ctx.fill();
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${_sc}, ${a})`;
            ctx.fill();
        });

        // Draw floating particles
        this.particles.forEach(p => {
            p.wobble += p.wobbleSpeed;
            p.x += p.vx + Math.sin(p.wobble) * 0.35;
            p.y += p.vy + Math.cos(p.wobble * 0.7) * 0.15;
            p.life += p.lifeSpeed;

            if (p.life > 1) p.life = 0;
            const fadeAlpha = p.life < 0.15 ? p.life / 0.15 :
                p.life > 0.85 ? (1 - p.life) / 0.15 : 1;
            const alpha = p.alpha * fadeAlpha;

            // Respawn
            if (p.y < -30) { p.y = H + 20; p.x = Math.random() * W; }
            if (p.x < -30) p.x = W + 20;
            if (p.x > W + 30) p.x = -20;

            // Outer glow halo
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
            grad.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha * 0.6})`);
            grad.addColorStop(0.4, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha * 0.2})`);
            grad.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
            ctx.fillStyle = grad; ctx.fill();

            // Inner bright core
            const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            core.addColorStop(0, `rgba(255,255,255,${alpha * 0.8})`);
            core.addColorStop(0.5, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha})`);
            core.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = core; ctx.fill();
        });

        // Connection lines — extended range, themed
        const _lc = this._themeColors?.lineColor || 'rgba(139,92,246,';
        const _lh = this._themeColors?.lineHover || 'rgba(236,72,153,';
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const a = this.particles[i], b = this.particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 170) {
                    const lineAlpha = (1 - dist / 170) * 0.09;
                    const mdx = (a.x + b.x) / 2 - this.mouse.x;
                    const mdy = (a.y + b.y) / 2 - this.mouse.y;
                    const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                    const nearMouse = mDist < 220;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = nearMouse
                        ? `${_lh}${lineAlpha * 1.5})`
                        : `${_lc}${lineAlpha})`;
                    ctx.lineWidth = nearMouse ? 0.8 : 0.5;
                    ctx.stroke();
                }
            }
        }

        // Burst particles (from clicks)
        this.burstParticles = this.burstParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.life -= 0.025;
            if (p.life <= 0) return false;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
            grad.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${p.life * p.alpha})`);
            grad.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            ctx.fillStyle = grad; ctx.fill();
            // Bright core
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${p.life * 0.8})`;
            ctx.fill();
            return true;
        });

        // Smooth mouse interaction: attract + orbit + repulse + proximity glow
        const mx = this.mouse.x, my = this.mouse.y;

        // Draw cursor glow ring — themed
        const _cg = this._themeColors?.cursorGlow || 'rgba(139,92,246,';
        const _ch = this._themeColors?.lineHover || 'rgba(236,72,153,';
        const cursorGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
        cursorGrad.addColorStop(0, `${_cg}0.07)`);
        cursorGrad.addColorStop(0.4, `${_cg}0.03)`);
        cursorGrad.addColorStop(0.7, `${_ch}0.015)`);
        cursorGrad.addColorStop(1, `${_cg}0)`);
        ctx.beginPath(); ctx.arc(mx, my, 120, 0, Math.PI * 2);
        ctx.fillStyle = cursorGrad; ctx.fill();

        this.particles.forEach(p => {
            const dx = mx - p.x, dy = my - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 250 && dist > 0) {
                const t = 1 - dist / 200;
                const smoothT = t * t * (3 - 2 * t);

                // Orbit/swirl effect
                p.orbitAngle += 0.02 * smoothT;
                const perpX = -dy / dist;
                const perpY = dx / dist;
                const orbitForce = 0.08 * smoothT;
                p.vx += perpX * orbitForce;
                p.vy += perpY * orbitForce;

                // Gentle attraction
                const attractForce = 0.025 * smoothT;
                p.vx += (dx / dist) * attractForce;
                p.vy += (dy / dist) * attractForce;

                // Proximity glow
                p.size = p.baseSize * (1 + smoothT * 0.8);
                p.alpha = p.baseAlpha * (1 + smoothT * 1.2);
            } else {
                p.size += (p.baseSize - p.size) * 0.05;
                p.alpha += (p.baseAlpha - p.alpha) * 0.05;
            }

            p.vx *= 0.988;
            p.vy *= 0.988;
            if (p.vy > -0.06) p.vy -= 0.003;
        });
    },

    createNebulaClouds(count) {
        const clouds = [];
        const colors = [
            { r: 139, g: 92, b: 246 },
            { r: 88, g: 28, b: 135 },
            { r: 6, g: 182, b: 212 },
            { r: 30, g: 58, b: 138 },
            { r: 124, g: 58, b: 237 },
            { r: 59, g: 130, b: 246 },
            { r: 236, g: 72, b: 153 },
            { r: 16, g: 185, b: 129 },
            { r: 245, g: 158, b: 11 },
            { r: 99, g: 102, b: 241 },
        ];
        for (let i = 0; i < count; i++) {
            clouds.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: 180 + Math.random() * 320,
                color: colors[i % colors.length],
                alpha: 0.022 + Math.random() * 0.028,
                phase: Math.random() * Math.PI * 2,
            });
        }
        return clouds;
    },

    animate() {
        this.drawParticles();
        this.animId = requestAnimationFrame(() => this.animate());
    },

    /* ==========================================
       CURSOR GLOW
    ========================================== */
    createCursorGlow() {
        const glow = document.createElement('div');
        glow.id = 'cursor-glow';
        glow.style.cssText = `
      position: fixed; width: 400px; height: 400px;
      border-radius: 50%; pointer-events: none; z-index: 0;
      background: radial-gradient(circle,
        color-mix(in srgb, var(--primary-500) 8%, transparent) 0%,
        color-mix(in srgb, var(--primary-500) 3%, transparent) 40%,
        transparent 70%
      );
      transform: translate(-50%, -50%);
      will-change: left, top;
      transition: opacity 0.4s;
      opacity: 0;
    `;
        document.body.appendChild(glow);

        let gx = 0, gy = 0;
        const lerp = (a, b, t) => a + (b - a) * t;

        const move = () => {
            gx = lerp(gx, this.mouse.x, 0.06);
            gy = lerp(gy, this.mouse.y, 0.06);
            glow.style.left = gx + 'px';
            glow.style.top = gy + 'px';
            requestAnimationFrame(move);
        };
        move();

        document.addEventListener('mousemove', () => { glow.style.opacity = '1'; });
        document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    },

    /* ==========================================
       3D TILT ON CARDS
    ========================================== */
    initTiltCards() {
        const apply = (el) => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px) scale(1.03)`;
                el.style.transition = 'transform 0.08s linear';
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
                el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
            });
        };
        document.querySelectorAll('.quick-action-card, .trend-card, .daily-tip-card').forEach(apply);

        // Re-apply on dynamically added cards
        new MutationObserver(muts => {
            muts.forEach(m => m.addedNodes.forEach(n => {
                if (n.nodeType === 1) {
                    n.querySelectorAll?.('.quick-action-card, .trend-card').forEach(apply);
                }
            }));
        }).observe(document.body, { childList: true, subtree: true });
    },

    /* ==========================================
       MAGNETIC BUTTONS
    ========================================== */
    initMagneticElements() {
        const apply = (el, strength = 0.3) => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const dx = (e.clientX - cx) * strength;
                const dy = (e.clientY - cy) * strength;
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
                el.style.transition = 'transform 0.12s ease-out';
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
                el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
            });
        };
        document.querySelectorAll('.btn-send, .logo-icon, .welcome-icon').forEach(el => apply(el, 0.3));
        document.querySelectorAll('.btn-new-chat, .btn-primary').forEach(el => apply(el, 0.15));
    },

    /* ==========================================
       CLICK RIPPLE
    ========================================== */
    initRipples() {
        const style = document.createElement('style');
        style.textContent = `
      .fx-ripple-wave {
        position: absolute; border-radius: 50%; pointer-events: none;
        background: rgba(255,255,255,0.2);
        transform: scale(0); animation: fxRipple 0.55s ease-out forwards;
      }
      @keyframes fxRipple { to { transform: scale(3.5); opacity: 0; } }
    `;
        document.head.appendChild(style);

        const targets = '.btn-primary, .btn-send, .btn-new-chat, .mood-chip, .nav-item, .quick-action-card, .tab, .tip-action, .btn-icon, .capability-tag';
        document.addEventListener('click', (e) => {
            const el = e.target.closest(targets);
            if (!el) return;
            el.style.position = el.style.position || 'relative';
            el.style.overflow = 'hidden';
            const r = el.getBoundingClientRect();
            const size = Math.max(r.width, r.height);
            const wave = document.createElement('span');
            wave.className = 'fx-ripple-wave';
            wave.style.width = wave.style.height = size + 'px';
            wave.style.left = (e.clientX - r.left - size / 2) + 'px';
            wave.style.top = (e.clientY - r.top - size / 2) + 'px';
            el.appendChild(wave);
            setTimeout(() => wave.remove(), 550);
        });
    },

    /* ==========================================
       LOGO FX — rings, hover reaction
    ========================================== */
    initLogoFX() {
        const logo = document.querySelector('.logo-icon');
        if (logo) {
            logo.style.position = 'relative';
            logo.addEventListener('mouseenter', () => {
                this.spawnRings(logo, 3, 'rgba(139,92,246,0.35)');
            });
        }

        const welcomeIcon = document.querySelector('.welcome-icon');
        if (welcomeIcon) {
            welcomeIcon.style.position = 'relative';
            welcomeIcon.addEventListener('mouseenter', () => {
                this.spawnRings(welcomeIcon, 3, 'rgba(139,92,246,0.3)');
                welcomeIcon.style.transform = 'scale(1.12) rotate(5deg)';
                welcomeIcon.style.boxShadow = '0 0 60px rgba(139,92,246,0.4), 0 20px 40px rgba(0,0,0,0.2)';
                welcomeIcon.style.transition = 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)';
            });
            welcomeIcon.addEventListener('mouseleave', () => {
                welcomeIcon.style.transform = '';
                welcomeIcon.style.boxShadow = '';
                welcomeIcon.style.transition = 'all 0.5s ease';
            });
        }

        // Avatar hover in messages
        document.addEventListener('mouseenter', (e) => {
            if (e.target.closest?.('.message.assistant .message-avatar')) {
                const av = e.target.closest('.message-avatar');
                av.style.transform = 'scale(1.15)';
                av.style.boxShadow = '0 0 28px rgba(139,92,246,0.5)';
                av.style.transition = 'all 0.25s ease';
            }
        }, true);
        document.addEventListener('mouseleave', (e) => {
            if (e.target.closest?.('.message.assistant .message-avatar')) {
                const av = e.target.closest('.message-avatar');
                av.style.transform = '';
                av.style.boxShadow = '';
            }
        }, true);
    },

    spawnRings(el, count, color) {
        for (let i = 0; i < count; i++) {
            const ring = document.createElement('div');
            ring.style.cssText = `
        position: absolute; inset: -4px; border-radius: inherit;
        border: 1.5px solid ${color}; pointer-events: none;
        animation: fxRingPop 0.7s ease-out ${i * 0.12}s forwards;
        opacity: 0;
      `;
            el.appendChild(ring);
            setTimeout(() => ring.remove(), 900);
        }
    },

    /* ==========================================
       ANIMATED PLACEHOLDER
    ========================================== */
    initTypingPlaceholder() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        const prompts = [
            'Ask about the latest fashion trends...',
            'What should I wear to a party? 🎉',
            'Help me build a capsule wardrobe...',
            'What colors suit my skin tone? 🎨',
            'Style me for a date night 💕',
            'What\'s trending in streetwear? 🔥',
        ];

        let idx = 0, charIdx = 0, deleting = false;

        const tick = () => {
            if (document.activeElement === input || input.value.length > 0) {
                setTimeout(tick, 400);
                return;
            }
            const text = prompts[idx];
            if (!deleting) {
                charIdx++;
                input.placeholder = text.substring(0, charIdx);
                if (charIdx >= text.length) {
                    setTimeout(() => { deleting = true; tick(); }, 2200);
                    return;
                }
                setTimeout(tick, 35 + Math.random() * 25);
            } else {
                charIdx--;
                input.placeholder = text.substring(0, charIdx);
                if (charIdx <= 0) {
                    deleting = false;
                    idx = (idx + 1) % prompts.length;
                    setTimeout(tick, 250);
                    return;
                }
                setTimeout(tick, 18);
            }
        };
        setTimeout(tick, 2200);
    },

    /* ==========================================
       SMOOTH REVEAL ON SCROLL
    ========================================== */
    initSmoothReveal() {
        const style = document.createElement('style');
        style.textContent = `
      .fx-hidden { opacity: 0; transform: translateY(16px); transition: all 0.5s cubic-bezier(0.23,1,0.32,1); }
      .fx-show { opacity: 1; transform: translateY(0); }
      @keyframes fxRingPop {
        0% { transform: scale(1); opacity: 0.7; }
        100% { transform: scale(1.8); opacity: 0; }
      }
    `;
        document.head.appendChild(style);

        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('fx-show');
            });
        }, { threshold: 0.05 });

        // Observe existing + new messages
        const chatInner = document.getElementById('messages-inner');
        if (chatInner) {
            new MutationObserver(muts => {
                muts.forEach(m => m.addedNodes.forEach(n => {
                    if (n.nodeType === 1 && n.classList?.contains('message')) {
                        n.classList.add('fx-hidden');
                        obs.observe(n);
                        // Trigger immediately since it'll be visible
                        requestAnimationFrame(() => requestAnimationFrame(() => n.classList.add('fx-show')));
                    }
                }));
            }).observe(chatInner, { childList: true });
        }
    },

    /* ==========================================
       HOVER GLOWS ON INTERACTIVE ELEMENTS
    ========================================== */
    initHoverGlows() {
        // Add glow effect on nav items
        document.querySelectorAll('.nav-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.boxShadow = '0 0 20px rgba(139,92,246,0.08), inset 0 0 12px rgba(139,92,246,0.04)';
                el.style.transition = 'all 0.25s ease';
            });
            el.addEventListener('mouseleave', () => {
                el.style.boxShadow = '';
            });
        });

        // Mood chips spring
        document.querySelectorAll('.mood-chip').forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.transform = 'translateY(-3px) scale(1.06)';
                el.style.boxShadow = '0 6px 20px rgba(139,92,246,0.2)';
                el.style.transition = 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)';
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
                el.style.boxShadow = '';
                el.style.transition = 'all 0.4s ease';
            });
        });

        // History items slide
        document.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.transform = 'translateX(6px)';
                el.style.transition = 'transform 0.2s ease';
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
                el.style.transition = 'transform 0.3s ease';
            });
        });

        // Re-apply to dynamically added items
        new MutationObserver(() => {
            document.querySelectorAll('.history-item:not([data-fx])').forEach(el => {
                el.dataset.fx = '1';
                el.addEventListener('mouseenter', () => {
                    el.style.transform = 'translateX(6px)';
                    el.style.transition = 'transform 0.2s ease';
                });
                el.addEventListener('mouseleave', () => {
                    el.style.transform = '';
                });
            });
        }).observe(document.body, { childList: true, subtree: true });
    },

    /* ==========================================
       WELCOME AREA INTERACTIONS
    ========================================== */
    initWelcomeEffects() {
        // Title text scramble on hover
        const title = document.querySelector('.welcome-title');
        if (title) {
            const originalText = title.textContent;
            const chars = '⚡✨💫🌟✦☆◇◆▪▫';

            title.addEventListener('mouseenter', () => {
                let iterations = 0;
                const interval = setInterval(() => {
                    title.textContent = originalText.split('')
                        .map((c, i) => {
                            if (i < iterations) return originalText[i];
                            if (c === ' ') return ' ';
                            return chars[Math.floor(Math.random() * chars.length)];
                        }).join('');
                    iterations += 1.5;
                    if (iterations >= originalText.length) {
                        clearInterval(interval);
                        title.textContent = originalText;
                    }
                }, 35);
            });
        }

        // Capability tags: burst particles on click
        document.querySelectorAll('.capability-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const rect = tag.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const colors = [
                    { r: 139, g: 92, b: 246 },
                    { r: 251, g: 191, b: 36 },
                    { r: 255, g: 255, b: 255 },
                ];
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 * i) / 6;
                    const speed = 1 + Math.random() * 1.5;
                    this.burstParticles.push({
                        x: cx, y: cy,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: 1 + Math.random() * 1.5,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        alpha: 0.7, life: 1,
                    });
                }
            });
        });

        // Quick action cards: spotlight glow following cursor
        document.querySelectorAll('.quick-action-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--spot-x', x + 'px');
                card.style.setProperty('--spot-y', y + 'px');
            });
        });

        // Add spotlight style
        const style = document.createElement('style');
        style.textContent = `
            .quick-action-card {
                --spot-x: 50%;
                --spot-y: 50%;
            }
            .quick-action-card::after {
                content: '';
                position: absolute; inset: 0; border-radius: inherit;
                background: radial-gradient(circle 120px at var(--spot-x) var(--spot-y),
                    rgba(139,92,246,0.12), transparent 70%
                );
                opacity: 0; transition: opacity 0.3s ease;
                pointer-events: none;
            }
            .quick-action-card:hover::after { opacity: 1; }
        `;
        document.head.appendChild(style);
    },

    /* ==========================================
       MOUSE TRACKING
    ========================================== */
    trackMouse() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    },

    /* ==========================================
       NAV ITEM ANIMATIONS — stagger, active glow, hover lift
    ========================================== */
    initNavAnimations() {
        const navItems = document.querySelectorAll('.nav-item');

        // Stagger slide-in on load
        navItems.forEach((item, i) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                item.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 400 + i * 80);
        });

        // Active item: pulse glow border
        const style = document.createElement('style');
        style.textContent = `
            .nav-item {
                position: relative;
                overflow: hidden;
                transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1) !important;
            }
            .nav-item::before {
                content: '';
                position: absolute;
                left: 0; top: 0; bottom: 0;
                width: 3px;
                background: linear-gradient(180deg, var(--primary-500), var(--primary-300));
                border-radius: 0 2px 2px 0;
                opacity: 0;
                transition: opacity 0.3s ease;
                box-shadow: 0 0 8px var(--primary-500);
            }
            .nav-item.active::before {
                opacity: 1;
                animation: navBarPulse 2s ease-in-out infinite;
            }
            @keyframes navBarPulse {
                0%, 100% { box-shadow: 0 0 6px var(--primary-400); }
                50% { box-shadow: 0 0 18px var(--primary-500), 0 0 30px var(--primary-300); }
            }
            .nav-item .nav-item-icon {
                transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), filter 0.3s ease;
            }
            .nav-item:hover .nav-item-icon {
                transform: scale(1.2) rotate(-5deg);
                filter: drop-shadow(0 0 6px var(--primary-400));
            }
            .nav-item.active .nav-item-icon {
                filter: drop-shadow(0 0 5px var(--primary-400));
            }
            .nav-item:hover {
                transform: translateX(4px) !important;
                background: color-mix(in srgb, var(--primary-500) 12%, transparent) !important;
                box-shadow: inset 0 0 20px color-mix(in srgb, var(--primary-500) 6%, transparent),
                            0 2px 12px color-mix(in srgb, var(--primary-500) 10%, transparent) !important;
            }
            .nav-item.active {
                background: color-mix(in srgb, var(--primary-500) 15%, transparent) !important;
                box-shadow: inset 0 0 25px color-mix(in srgb, var(--primary-500) 8%, transparent) !important;
            }
            .btn-new-chat {
                animation: newChatPulse 3s ease-in-out infinite;
                position: relative;
                overflow: hidden;
            }
            .btn-new-chat::after {
                content: '';
                position: absolute;
                top: 0; left: -100%;
                width: 60%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                transform: skewX(-20deg);
                animation: newChatShimmer 3s ease-in-out infinite;
            }
            @keyframes newChatPulse {
                0%, 100% { box-shadow: 0 4px 15px color-mix(in srgb, var(--primary-500) 30%, transparent); }
                50% { box-shadow: 0 4px 25px color-mix(in srgb, var(--primary-500) 55%, transparent), 0 0 0 2px color-mix(in srgb, var(--primary-500) 15%, transparent); }
            }
            @keyframes newChatShimmer {
                0% { left: -100%; }
                50%, 100% { left: 160%; }
            }
        `;
        document.head.appendChild(style);
    },

    /* ==========================================
       SIDEBAR FX — sweep reflection + border glow
    ========================================== */
    initSidebarFX() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        const style = document.createElement('style');
        style.textContent = `
            #sidebar {
                position: relative;
                overflow: hidden;
            }
            #sidebar::after {
                content: '';
                position: absolute;
                top: -100%;
                left: -60%;
                width: 40%;
                height: 300%;
                background: linear-gradient(105deg,
                    transparent 40%,
                    color-mix(in srgb, var(--primary-500) 4%, transparent) 50%,
                    color-mix(in srgb, var(--primary-300) 6%, transparent) 55%,
                    transparent 65%
                );
                transform: skewX(-10deg);
                animation: sidebarSweep 6s ease-in-out infinite;
                pointer-events: none;
            }
            @keyframes sidebarSweep {
                0%   { top: -100%; }
                40%, 100% { top: 120%; }
            }
            #sidebar {
                border-right: 1px solid color-mix(in srgb, var(--primary-500) 15%, transparent) !important;
                box-shadow: 2px 0 30px color-mix(in srgb, var(--primary-500) 6%, transparent),
                            inset -1px 0 0 color-mix(in srgb, var(--primary-500) 8%, transparent) !important;
            }
            .sidebar-section-title {
                background: linear-gradient(90deg, var(--primary-300), var(--primary-400));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 700;
                letter-spacing: 0.8px;
            }
            .logo-icon {
                animation: logoGlow 3s ease-in-out infinite alternate;
            }
            @keyframes logoGlow {
                0%   { text-shadow: 0 0 10px var(--primary-400), 0 0 20px var(--primary-300); }
                100% { text-shadow: 0 0 20px var(--primary-500), 0 0 40px var(--primary-300), 0 0 60px var(--primary-400); }
            }
            .daily-tip-card, .tip-card {
                border: 1px solid color-mix(in srgb, var(--primary-500) 25%, transparent) !important;
                animation: tipBorderGlow 4s ease-in-out infinite alternate;
            }
            @keyframes tipBorderGlow {
                0%   { box-shadow: 0 0 8px color-mix(in srgb, var(--primary-500) 10%, transparent); }
                100% { box-shadow: 0 0 20px color-mix(in srgb, var(--primary-500) 25%, transparent), 0 0 40px color-mix(in srgb, var(--primary-500) 8%, transparent); }
            }
        `;
        document.head.appendChild(style);
    },

    /* ==========================================
       SCROLLBAR FX — glowing custom scrollbars
    ========================================== */
    initScrollbarFX() {
        const style = document.createElement('style');
        style.textContent = `
            /* Global glowing scrollbar */
            ::-webkit-scrollbar {
                width: 4px;
                height: 4px;
            }
            ::-webkit-scrollbar-track {
                background: rgba(139, 92, 246, 0.03);
                border-radius: 10px;
            }
            ::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #8b5cf6, #ec4899, #8b5cf6);
                border-radius: 10px;
                box-shadow: 0 0 6px rgba(139, 92, 246, 0.6);
                transition: all 0.3s ease;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, #a78bfa, #f472b6, #a78bfa);
                box-shadow: 0 0 12px rgba(139, 92, 246, 0.9), 0 0 20px rgba(236, 72, 153, 0.4);
                width: 6px;
            }
            ::-webkit-scrollbar-corner {
                background: transparent;
            }
            /* Sidebar scroll area */
            .sidebar-content::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, rgba(139,92,246,0.6), rgba(236,72,153,0.5));
            }
            /* Chat messages scroll */
            .chat-messages::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.2);
            }
            /* Momentum scroll for iOS */
            .chat-messages, .sidebar-content {
                -webkit-overflow-scrolling: touch;
                scroll-behavior: smooth;
            }
        `;
        document.head.appendChild(style);
    }
};

// Boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ZephyrFX.init());
} else {
    ZephyrFX.init();
}
