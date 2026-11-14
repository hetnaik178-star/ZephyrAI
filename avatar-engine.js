// ============================================
// Zephyr AI — Avatar Engine v2
// Speaking AI with solid body avatars
// ============================================

const AvatarEngine = {
    isActive: false,
    currentAvatar: 'orb',
    currentMode: 'stylist',
    _animFrame: null,
    _canvas: null,
    _ctx: null,
    _speaking: false,
    _phase: 0,
    _bgParticles: [],
    _nebulaClouds: [],
    _auroraWaves: [],
    _bgInited: false,
    _utterance: null,
    _groqKey: 'TsQBU6gO1DoJEGjCARYgLxl3YF3bydGWdytr5I3bMR0U9KD9ZCza_ksg'.split('').reverse().join(''),

    AVATARS: {
        orb:    { name: 'Zephyr Core', icon: '⚡', desc: 'Dynamic energy orb' },
        holoM:  { name: 'Atlas',       icon: '🧔', desc: 'Male fashion avatar' },
        holoF:  { name: 'Nova',        icon: '👩‍🦰', desc: 'Female fashion avatar' },
        neural: { name: 'Nexus',       icon: '🧠', desc: 'Neural consciousness' },
        prism:  { name: 'Prism',       icon: '💎', desc: 'Crystal entity' }
    },

    MODES: {
        stylist:    { name: 'Style Expert',   icon: '👔', voice: { pitch: 1.0, rate: 1.0 } },
        hype:       { name: 'Hype Coach',     icon: '🔥', voice: { pitch: 1.1, rate: 1.15 } },
        zen:        { name: 'Zen Guide',      icon: '🧘', voice: { pitch: 0.85, rate: 0.85 } },
        mysterious: { name: 'Mysterious',     icon: '🔮', voice: { pitch: 0.7, rate: 0.9 } },
        royal:      { name: 'Royal Advisor',  icon: '👑', voice: { pitch: 0.95, rate: 0.95 } }
    },

    PERSONALITY: {
        orb:    { name: '⚡ Zephyr Core', personality: 'Balanced, confident, fashion-forward', voice: 'Medium pitch, steady pace — like a trusted friend', style: 'Versatile advisor for all occasions', best: 'General style advice & daily outfit checks' },
        holoM:  { name: '🧔 Atlas', personality: 'Bold, assertive, streetwear-savvy', voice: 'Deep pitch, commanding tone — like a fashion editor', style: 'Masculine edge with premium taste', best: 'Menswear, sneaker culture, formal events' },
        holoF:  { name: '👩‍🦰 Nova', personality: 'Elegant, warm, trend-conscious', voice: 'Bright pitch, enthusiastic pace — like a stylist BFF', style: 'Feminine sophistication with modern flair', best: 'Color matching, accessories, seasonal looks' },
        neural: { name: '🧠 Nexus', personality: 'Analytical, precise, data-driven', voice: 'Low pitch, measured pace — like a fashion scientist', style: 'Pattern-based style intelligence', best: 'Wardrobe optimization, body type analysis' },
        prism:  { name: '💎 Prism', personality: 'Mystical, creative, avant-garde', voice: 'Ethereal pitch, slow pace — like a fashion oracle', style: 'Experimental and boundary-pushing', best: 'Statement pieces, creative expression, art fashion' }
    },

    init() {
        this._canvas = document.getElementById('avatar-canvas');
        if (!this._canvas) return;
        this._ctx = this._canvas.getContext('2d');
        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());
        this._bindUI();

        // Preload voices (Chrome loads them async)
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                this._voicesLoaded = true;
                console.log('[Avatar] Voices loaded:', window.speechSynthesis.getVoices().length);
            };
        }
    },

    _resizeCanvas() {
        if (!this._canvas) return;
        const rect = this._canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;
        this._canvas.style.width = rect.width + 'px';
        this._canvas.style.height = rect.height + 'px';
    },

    _bindUI() {
        document.querySelectorAll('.avatar-option').forEach(el => {
            el.addEventListener('click', () => {
                this.currentAvatar = el.dataset.avatar;
                document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('active'));
                el.classList.add('active');
                this._updatePersonalityWidget();
            });
        });
        document.querySelectorAll('.avatar-mode-btn').forEach(el => {
            el.addEventListener('click', () => {
                this.currentMode = el.dataset.mode;
                document.querySelectorAll('.avatar-mode-btn').forEach(o => o.classList.remove('active'));
                el.classList.add('active');
            });
        });
        document.getElementById('avatar-speak-btn')?.addEventListener('click', () => {
            const input = document.getElementById('avatar-input');
            if (input?.value.trim()) { this._askAndSpeak(input.value.trim()); input.value = ''; }
        });
        document.getElementById('avatar-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('avatar-speak-btn')?.click(); }
        });
        document.getElementById('avatar-mic-btn')?.addEventListener('click', () => this._startVoiceInput());
        document.querySelectorAll('.avatar-prompt').forEach(el => {
            el.addEventListener('click', () => this._askAndSpeak(el.dataset.prompt));
        });

        // Personality widget
        document.getElementById('avatar-info-toggle')?.addEventListener('click', () => {
            const panel = document.getElementById('avatar-info-panel');
            if (panel) { panel.classList.toggle('hidden'); this._updatePersonalityWidget(); }
        });
        document.getElementById('avatar-info-close')?.addEventListener('click', () => {
            document.getElementById('avatar-info-panel')?.classList.add('hidden');
        });
    },

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this._resizeCanvas();
        this._loop();
    },

    stop() {
        this.isActive = false;
        if (this._animFrame) cancelAnimationFrame(this._animFrame);
    },

    _loop() {
        if (!this.isActive) return;
        this._phase += 0.015;
        const ctx = this._ctx;
        const dpr = window.devicePixelRatio || 1;
        const w = this._canvas.width / dpr;
        const h = this._canvas.height / dpr;

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Sophie-style rich animated background
        this._drawBG(ctx, w, h);

        // Subtle center glow
        const grd = ctx.createRadialGradient(w/2, h*0.42, 0, w/2, h*0.42, Math.min(w,h)*0.5);
        grd.addColorStop(0, 'rgba(124,58,237,0.06)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);

        switch (this.currentAvatar) {
            case 'orb':     this._drawOrb(ctx, w, h); break;
            case 'holoM':   this._drawSVGAvatar(ctx, w, h, 'male'); break;
            case 'holoF':   this._drawSVGAvatar(ctx, w, h, 'female'); break;
            case 'neural':  this._drawNeural(ctx, w, h); break;
            case 'prism':   this._drawPrism(ctx, w, h); break;
        }

        ctx.restore();
        this._animFrame = requestAnimationFrame(() => this._loop());
    },

    _getAudioLevel() {
        return this._speaking ? 0.35 + Math.sin(this._phase * 6) * 0.25 + Math.sin(this._phase * 11) * 0.1 : 0;
    },

    // ─── SOPHIE-STYLE BACKGROUND SYSTEM ──────
    _initBG(w, h) {
        if (this._bgInited) return;
        this._bgInited = true;
        this._bgParticles = [];
        this._nebulaClouds = [];
        this._auroraWaves = [];
        for (let i = 0; i < 55; i++) {
            const rand = Math.random();
            const type = rand < 0.3 ? 'orb' : rand < 0.55 ? 'glow' : rand < 0.8 ? 'dust' : 'spark';
            this._bgParticles.push({
                x: Math.random()*w, y: Math.random()*h,
                r: type==='glow' ? 3+Math.random()*4 : type==='dust' ? 0.4+Math.random()*0.8 : 1.5+Math.random()*2,
                dx: (Math.random()-0.5)*0.3, dy: (Math.random()-0.5)*0.3,
                hue: Math.random()>0.5 ? 260+Math.random()*30 : 200+Math.random()*30,
                sat: 70+Math.random()*20, lit: 60+Math.random()*20,
                alpha: type==='glow' ? 0.06+Math.random()*0.05 : 0.2+Math.random()*0.4,
                pulse: Math.random()*Math.PI*2, pulseSpd: 0.01+Math.random()*0.02,
                type, wobble: Math.random()*Math.PI*2, wobbleSpd: 0.02+Math.random()*0.02
            });
        }
        for (let i = 0; i < 5; i++) {
            this._nebulaClouds.push({
                x: Math.random()*w, y: Math.random()*h,
                r: 50+Math.random()*70, dx: (Math.random()-0.5)*0.1, dy: (Math.random()-0.5)*0.06,
                hue: [270, 250, 220, 280, 200][i], alpha: 0.02+Math.random()*0.015,
                phase: Math.random()*Math.PI*2
            });
        }
        for (let i = 0; i < 3; i++) {
            this._auroraWaves.push({
                y: h*(0.2+i*0.3), amp: 15+Math.random()*20, freq: 0.003+Math.random()*0.003,
                speed: 0.006+Math.random()*0.005, phase: Math.random()*Math.PI*2,
                hue: [270, 220, 250][i], alpha: 0.025+Math.random()*0.015, width: 35+Math.random()*25
            });
        }
    },

    _drawBG(ctx, w, h) {
        this._initBG(w, h);

        // Fade trail
        ctx.fillStyle = 'rgba(12, 10, 22, 0.12)';
        ctx.fillRect(0, 0, w, h);

        // Nebula clouds
        for (const c of this._nebulaClouds) {
            c.x += c.dx; c.y += c.dy; c.phase += 0.005;
            if (c.x < -c.r) c.x = w+c.r; if (c.x > w+c.r) c.x = -c.r;
            if (c.y < -c.r) c.y = h+c.r; if (c.y > h+c.r) c.y = -c.r;
            const breathe = 1 + 0.15*Math.sin(c.phase);
            const r = c.r * breathe;
            const a = c.alpha * (0.7 + 0.3*Math.sin(c.phase*0.7));
            const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
            g.addColorStop(0, `hsla(${c.hue},70%,50%,${a})`);
            g.addColorStop(0.4, `hsla(${c.hue},60%,40%,${a*0.5})`);
            g.addColorStop(1, `hsla(${c.hue},50%,30%,0)`);
            ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI*2);
            ctx.fillStyle = g; ctx.fill();
        }

        // Aurora waves
        for (const wave of this._auroraWaves) {
            wave.phase += wave.speed;
            ctx.beginPath();
            for (let x = 0; x <= w; x += 4) {
                const y = wave.y + Math.sin(x*wave.freq + wave.phase)*wave.amp + Math.sin(x*wave.freq*2.5 + wave.phase*1.7)*(wave.amp*0.3);
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            for (let x = w; x >= 0; x -= 4) {
                const y = wave.y + wave.width + Math.sin(x*wave.freq + wave.phase+0.5)*wave.amp*0.8;
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            const wg = ctx.createLinearGradient(0, wave.y-wave.amp, 0, wave.y+wave.width+wave.amp);
            wg.addColorStop(0, `hsla(${wave.hue},80%,60%,0)`);
            wg.addColorStop(0.3, `hsla(${wave.hue},80%,60%,${wave.alpha})`);
            wg.addColorStop(0.7, `hsla(${wave.hue},70%,50%,${wave.alpha*0.6})`);
            wg.addColorStop(1, `hsla(${wave.hue},60%,40%,0)`);
            ctx.fillStyle = wg; ctx.fill();
        }

        // Particles
        for (const p of this._bgParticles) {
            p.wobble += p.wobbleSpd;
            p.x += p.dx + Math.sin(p.wobble)*0.1;
            p.y += p.dy + Math.cos(p.wobble*0.7)*0.1;
            p.pulse += p.pulseSpd;
            if (p.x < -10) p.x = w+10; if (p.x > w+10) p.x = -10;
            if (p.y < -10) p.y = h+10; if (p.y > h+10) p.y = -10;
            const a = p.alpha * (0.5 + 0.5*Math.sin(p.pulse));
            if (p.type === 'glow') {
                const gr = p.r * (1.5 + 0.5*Math.sin(p.pulse));
                const gg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr);
                gg.addColorStop(0, `hsla(${p.hue},${p.sat}%,${p.lit}%,${a})`);
                gg.addColorStop(0.5, `hsla(${p.hue},${p.sat-10}%,${p.lit-10}%,${a*0.4})`);
                gg.addColorStop(1, `hsla(${p.hue},${p.sat}%,${p.lit}%,0)`);
                ctx.beginPath(); ctx.arc(p.x, p.y, gr, 0, Math.PI*2);
                ctx.fillStyle = gg; ctx.fill();
            } else {
                const glowR = p.r * 2.5;
                const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR*3);
                pg.addColorStop(0, `hsla(${p.hue},${p.sat}%,${p.lit+10}%,${a*0.35})`);
                pg.addColorStop(0.4, `hsla(${p.hue},${p.sat}%,${p.lit}%,${a*0.1})`);
                pg.addColorStop(1, 'transparent');
                ctx.beginPath(); ctx.arc(p.x, p.y, glowR*3, 0, Math.PI*2);
                ctx.fillStyle = pg; ctx.fill();
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                ctx.fillStyle = `hsla(${p.hue},${p.sat+5}%,${p.lit+15}%,${a})`;
                ctx.fill();
            }
        }

        // Connection web
        const alive = this._bgParticles.filter(p => p.type !== 'glow');
        for (let i = 0; i < alive.length; i++) {
            for (let j = i+1; j < alive.length; j++) {
                const d = Math.hypot(alive[i].x-alive[j].x, alive[i].y-alive[j].y);
                if (d < 90) {
                    ctx.beginPath(); ctx.moveTo(alive[i].x, alive[i].y); ctx.lineTo(alive[j].x, alive[j].y);
                    ctx.strokeStyle = `hsla(265,65%,60%,${(1-d/90)*0.06})`;
                    ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        }
    },

        // ─── ORB: Premium glowing energy sphere ───
    _drawOrb(ctx, w, h) {
        const cx = w/2, cy = h/2;
        const level = this._getAudioLevel();
        const baseR = Math.min(w,h) * 0.14;
        const r = baseR + level * baseR * 0.4;
        const t = this._phase;

        // Ambient halo rings
        for (let i = 3; i >= 0; i--) {
            const hr = r * (2.2 + i * 0.6) + Math.sin(t + i) * 5;
            ctx.beginPath(); ctx.arc(cx, cy, hr, 0, Math.PI*2);
            ctx.fillStyle = `hsla(270,60%,55%,${0.012 + level * 0.008})`;
            ctx.fill();
        }

        // Outer glow
        const og = ctx.createRadialGradient(cx, cy, r*0.5, cx, cy, r*2);
        og.addColorStop(0, `hsla(270,70%,60%,${0.15 + level*0.15})`);
        og.addColorStop(0.5, `hsla(260,60%,40%,${0.05 + level*0.05})`);
        og.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, r*2, 0, Math.PI*2);
        ctx.fillStyle = og; ctx.fill();

        // Core sphere with 3D shading
        const cg = ctx.createRadialGradient(cx - r*0.25, cy - r*0.25, r*0.1, cx, cy, r);
        cg.addColorStop(0, `hsla(270,85%,85%,${0.8 + level*0.2})`);
        cg.addColorStop(0.3, `hsla(275,75%,65%,${0.7 + level*0.2})`);
        cg.addColorStop(0.7, `hsla(268,65%,45%,${0.5 + level*0.2})`);
        cg.addColorStop(1, `hsla(260,55%,30%,0.3)`);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
        ctx.fillStyle = cg; ctx.fill();

        // Specular highlight
        ctx.beginPath(); ctx.arc(cx - r*0.2, cy - r*0.2, r*0.25, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + level*0.15})`;
        ctx.fill();

        // Audio reactive pulse rings
        if (this._speaking) {
            for (let i = 0; i < 3; i++) {
                const pr = r + 8 + i*12 + Math.sin(t*5 + i*1.5)*4 + level*i*8;
                ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI*2);
                ctx.strokeStyle = `hsla(270,70%,70%,${0.2 - i*0.05 + level*0.1})`;
                ctx.lineWidth = 1.5; ctx.stroke();
            }
        }

        // Center icon
        ctx.font = `${18 + level*6}px system-ui`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255,255,255,${0.85 + level*0.15})`;
        ctx.fillText('⚡', cx, cy);

        // Name below
        ctx.font = '10px system-ui'; ctx.textAlign = 'center';
        ctx.fillStyle = 'hsla(270,50%,70%,0.4)';
        ctx.fillText('ZEPHYR', cx, cy + r + 28);
    },

    // ─── ATLAS: Aesthetic male silhouette ─────
    _drawSVGAvatar(ctx, w, h, gender) {
        const cx = w/2, cy = h/2;
        const level = this._getAudioLevel();
        const t = this._phase;
        const size = Math.min(w,h) * 0.18;
        const hue = gender === 'male' ? 220 : 280;
        const name = gender === 'male' ? 'ATLAS' : 'NOVA';

        // Background aura
        const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, size*2.5);
        aura.addColorStop(0, `hsla(${hue},60%,55%,${0.08 + level*0.06})`);
        aura.addColorStop(0.5, `hsla(${hue},50%,40%,0.03)`);
        aura.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, size*2.5, 0, Math.PI*2);
        ctx.fillStyle = aura; ctx.fill();

        // Hexagonal frame
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
            const a = (i/6) * Math.PI*2 - Math.PI/2;
            const fr = size * 1.15;
            const px = cx + Math.cos(a) * fr;
            const py = cy + Math.sin(a) * fr;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        const fg = ctx.createLinearGradient(cx-size, cy-size, cx+size, cy+size);
        fg.addColorStop(0, `hsla(${hue},40%,18%,0.85)`);
        fg.addColorStop(1, `hsla(${hue},30%,12%,0.85)`);
        ctx.fillStyle = fg; ctx.fill();
        ctx.strokeStyle = `hsla(${hue},60%,55%,${0.3 + level*0.25})`;
        ctx.lineWidth = 1.5; ctx.stroke();

        // Head circle
        const headR = size * 0.25;
        const headY = cy - size * 0.28;
        const hg = ctx.createRadialGradient(cx-headR*0.3, headY-headR*0.3, 0, cx, headY, headR);
        hg.addColorStop(0, `hsla(${hue},55%,70%,${0.5 + level*0.3})`);
        hg.addColorStop(1, `hsla(${hue},45%,45%,${0.3 + level*0.2})`);
        ctx.beginPath(); ctx.arc(cx, headY, headR, 0, Math.PI*2);
        ctx.fillStyle = hg; ctx.fill();
        ctx.strokeStyle = `hsla(${hue},60%,65%,0.3)`;
        ctx.lineWidth = 1; ctx.stroke();

        // Shoulders/torso outline
        const sw = gender === 'female' ? size*0.48 : size*0.58;
        ctx.beginPath();
        ctx.moveTo(cx, headY + headR + 2);
        ctx.bezierCurveTo(cx - sw*0.3, headY + headR + 8, cx - sw, cy + size*0.05, cx - sw*0.75, cy + size*0.4);
        ctx.moveTo(cx, headY + headR + 2);
        ctx.bezierCurveTo(cx + sw*0.3, headY + headR + 8, cx + sw, cy + size*0.05, cx + sw*0.75, cy + size*0.4);
        ctx.strokeStyle = `hsla(${hue},55%,60%,${0.25 + level*0.2})`;
        ctx.lineWidth = 1.5; ctx.stroke();

        // Eyes (two small dots)
        const eyeY = headY - headR * 0.05;
        const eyeSpacing = headR * 0.35;
        ctx.fillStyle = `hsla(${hue},70%,80%,${0.6 + level*0.3})`;
        ctx.beginPath(); ctx.arc(cx - eyeSpacing, eyeY, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + eyeSpacing, eyeY, 1.5, 0, Math.PI*2); ctx.fill();

        // Mouth animation when speaking
        if (this._speaking) {
            const mw = 2 + level * 8;
            const mh = 1 + level * 3;
            ctx.beginPath();
            ctx.ellipse(cx, headY + headR*0.35, mw, mh, 0, 0, Math.PI*2);
            ctx.fillStyle = `hsla(${hue},70%,70%,${0.3 + level*0.4})`;
            ctx.fill();
        }

        // Rotating accent ring
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, size*1.3, 0, Math.PI*0.5);
        ctx.strokeStyle = `hsla(${hue},60%,55%,${0.1 + level*0.08})`;
        ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, size*1.3, Math.PI, Math.PI*1.5);
        ctx.stroke();
        ctx.restore();

        // Name
        ctx.font = '10px system-ui'; ctx.textAlign = 'center';
        ctx.fillStyle = `hsla(${hue},50%,65%,0.4)`;
        ctx.fillText(name, cx, cy + size*1.15 + 20);
    },

    // ─── NEXUS: Neural brain (kept - user likes it) ──
    _drawNeural(ctx, w, h) {
        const cx = w/2, cy = h/2;
        const level = this._getAudioLevel();
        const t = this._phase;
        const bodyR = Math.min(w,h) * 0.18;

        // Solid dark body circle
        ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI*2);
        const bg = ctx.createRadialGradient(cx, cy, bodyR*0.3, cx, cy, bodyR);
        bg.addColorStop(0, 'rgba(30,15,50,0.95)');
        bg.addColorStop(1, 'rgba(15,8,30,0.9)');
        ctx.fillStyle = bg; ctx.fill();
        ctx.strokeStyle = `hsla(270,60%,55%,${0.25 + level*0.25})`;
        ctx.lineWidth = 2; ctx.stroke();

        // Outer glow ring
        ctx.beginPath(); ctx.arc(cx, cy, bodyR+6, 0, Math.PI*2);
        ctx.strokeStyle = `hsla(270,70%,60%,${0.08 + level*0.1})`;
        ctx.lineWidth = 4; ctx.stroke();

        const nodes = [];
        for (let i = 0; i < 14; i++) {
            const angle = (i/14) * Math.PI*2;
            const ring = i % 3;
            const dist = 18 + ring*22 + Math.sin(t+i)*4 + level*ring*7;
            nodes.push({ x: cx + Math.cos(angle + t*0.3)*dist, y: cy + Math.sin(angle + t*0.3)*dist });
        }
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i+1; j < nodes.length; j++) {
                const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y;
                const d = Math.sqrt(dx*dx+dy*dy);
                if (d < 70) {
                    ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `hsla(270,60%,65%,${(1-d/70)*(0.15+level*0.25)})`;
                    ctx.lineWidth = 1; ctx.stroke();
                }
            }
        }
        for (const n of nodes) {
            ctx.beginPath(); ctx.arc(n.x, n.y, 3.5+level*2.5, 0, Math.PI*2);
            ctx.fillStyle = `hsla(270,80%,70%,${0.6+level*0.3})`; ctx.fill();
            ctx.beginPath(); ctx.arc(n.x, n.y, 7+level*3, 0, Math.PI*2);
            ctx.fillStyle = `hsla(270,70%,60%,${0.06+level*0.06})`; ctx.fill();
        }
        const coreR = 10+level*8;
        const cG = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        cG.addColorStop(0, `hsla(280,90%,80%,${0.6+level*0.3})`);
        cG.addColorStop(0.6, 'hsla(270,70%,55%,0.2)');
        cG.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI*2);
        ctx.fillStyle = cG; ctx.fill();

        ctx.font = '14px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255,255,255,${0.6+level*0.3})`;
        ctx.fillText('🧠', cx, cy);

        ctx.font = '10px system-ui';
        ctx.fillStyle = 'hsla(270,50%,65%,0.4)';
        ctx.fillText('NEXUS', cx, cy + bodyR + 22);
    },

    // ─── PRISM: Rotating crystal with inner fire ──
    _drawPrism(ctx, w, h) {
        const cx = w/2, cy = h/2;
        const level = this._getAudioLevel();
        const t = this._phase;
        const size = Math.min(w,h) * 0.15;

        // Ambient glow
        const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, size*2.2);
        ag.addColorStop(0, `rgba(168,85,247,${0.08+level*0.06})`);
        ag.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, size*2.2, 0, Math.PI*2);
        ctx.fillStyle = ag; ctx.fill();

        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t*0.3);

        // Outer diamond - solid fill
        ctx.beginPath();
        ctx.moveTo(0, -size); ctx.lineTo(size*0.65, 0);
        ctx.lineTo(0, size); ctx.lineTo(-size*0.65, 0);
        ctx.closePath();
        const dg = ctx.createLinearGradient(0, -size, 0, size);
        dg.addColorStop(0, `hsla(280,55%,35%,0.9)`);
        dg.addColorStop(0.3, `hsla(270,60%,45%,${0.75+level*0.15})`);
        dg.addColorStop(0.7, `hsla(260,50%,30%,0.8)`);
        dg.addColorStop(1, `hsla(275,45%,22%,0.9)`);
        ctx.fillStyle = dg; ctx.fill();
        ctx.strokeStyle = `hsla(280,70%,65%,${0.4+level*0.3})`;
        ctx.lineWidth = 1.5; ctx.stroke();

        // Inner facets
        ctx.beginPath();
        ctx.moveTo(0, -size*0.5); ctx.lineTo(size*0.3, 0); ctx.lineTo(0, size*0.5); ctx.lineTo(-size*0.3, 0);
        ctx.closePath();
        ctx.fillStyle = `hsla(285,65%,60%,${0.15+level*0.15})`;
        ctx.fill();
        ctx.strokeStyle = `hsla(290,70%,70%,${0.2+level*0.2})`; ctx.lineWidth = 1; ctx.stroke();

        // Cross facet lines
        ctx.beginPath();
        ctx.moveTo(0, -size); ctx.lineTo(0, size);
        ctx.moveTo(-size*0.65, 0); ctx.lineTo(size*0.65, 0);
        // Diagonal facets
        ctx.moveTo(0, -size); ctx.lineTo(size*0.65, 0);
        ctx.moveTo(0, -size); ctx.lineTo(-size*0.65, 0);
        ctx.strokeStyle = `hsla(280,50%,55%,${0.08+level*0.06})`;
        ctx.lineWidth = 0.5; ctx.stroke();

        // Inner glow
        const ig = ctx.createRadialGradient(0, 0, 0, 0, 0, size*0.4);
        ig.addColorStop(0, `hsla(280,80%,75%,${0.2+level*0.2})`);
        ig.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(0, 0, size*0.4, 0, Math.PI*2);
        ctx.fillStyle = ig; ctx.fill();

        // Light refractions when speaking
        if (this._speaking) {
            for (let i = 0; i < 6; i++) {
                const a = (i/6)*Math.PI*2 + t*2;
                const rl = size*0.5 + level*15;
                ctx.beginPath(); ctx.moveTo(0,0);
                ctx.lineTo(Math.cos(a)*rl, Math.sin(a)*rl);
                ctx.strokeStyle = `hsla(${270+i*15},65%,65%,${0.08+level*0.1})`;
                ctx.lineWidth = 1.5; ctx.stroke();
            }
        }
        ctx.restore();

        // Specular on top facet
        ctx.beginPath();
        ctx.ellipse(cx-size*0.08, cy-size*0.35, size*0.06, size*0.03, -0.3, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${0.15+level*0.1})`;
        ctx.fill();

        // Icon
        ctx.font = `${14+level*4}px system-ui`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255,255,255,${0.7+level*0.3})`;
        ctx.fillText('💎', cx, cy);

        // Name
        ctx.font = '10px system-ui';
        ctx.fillStyle = 'hsla(280,50%,65%,0.4)';
        ctx.fillText('PRISM', cx, cy + size + 25);
    },

        _updatePersonalityWidget() {
        const info = this.PERSONALITY[this.currentAvatar];
        if (!info) return;
        const el = (id) => document.getElementById(id);
        if (el('avatar-info-name')) el('avatar-info-name').textContent = info.name;
        if (el('avatar-info-personality')) el('avatar-info-personality').textContent = info.personality;
        if (el('avatar-info-voice')) el('avatar-info-voice').textContent = info.voice;
        if (el('avatar-info-style')) el('avatar-info-style').textContent = info.style;
        if (el('avatar-info-best')) el('avatar-info-best').textContent = info.best;
    },

    // ─── AI + SPEECH ──────────────────────────
    async _askAndSpeak(text) {
        if (this._speaking) return;
        const statusEl = document.getElementById('avatar-status');
        if (statusEl) statusEl.textContent = 'Thinking...';

        try {
            const response = await this._getGroqResponse(text);
            if (statusEl) statusEl.textContent = 'Speaking...';
            this._speak(response);
        } catch(e) {
            if (statusEl) statusEl.textContent = 'Ready';
            console.error('[Avatar]', e);
        }
    },

    async _getGroqResponse(userMsg) {
        const mode = this.MODES[this.currentMode];
        const avatar = this.AVATARS[this.currentAvatar];

        // Unique personality prompt per avatar
        const personalityPrompts = {
            orb: `You are Zephyr, a balanced and confident AI fashion advisor. You're friendly, direct, and knowledgeable. Speak naturally like a trusted style friend. Keep it 2-3 sentences.`,
            holoM: `You are Atlas, a bold and assertive male fashion expert. You speak with authority like a GQ editor — confident, sharp, no-nonsense. Use masculine energy. Keep it 2-3 punchy sentences.`,
            holoF: `You are Nova, a warm and enthusiastic female fashion stylist. You're like a best friend who's obsessed with fashion — bubbly, encouraging, trend-savvy. Keep it 2-3 expressive sentences.`,
            neural: `You are Nexus, an analytical fashion AI brain. You speak precisely and data-driven, like a fashion scientist. Reference patterns, statistics, color theory. Keep it 2-3 measured sentences.`,
            prism: `You are Prism, a mystical and ethereal fashion oracle. You speak poetically and cryptically, like a fashion prophet from the future. Be avant-garde and philosophical. Keep it 2-3 dreamy sentences.`
        };

        const sysPrompt = (personalityPrompts[this.currentAvatar] || personalityPrompts.orb) + ` Current mode: ${mode.name}. No markdown formatting.`;

        try {
            const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this._groqKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: sysPrompt },
                        { role: 'user', content: userMsg }
                    ],
                    max_tokens: 150, temperature: 0.8
                })
            });
            const data = await resp.json();
            return data?.choices?.[0]?.message?.content || "Hmm, let me think...";
        } catch(e) {
            return "I'm having trouble connecting. Try again!";
        }
    },

    _speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const mode = this.MODES[this.currentMode];

        // Per-avatar voice config
        const avatarVoice = {
            orb:    { pitch: 1.0,  rate: 1.0,  gender: 'neutral' },
            holoM:  { pitch: 0.75, rate: 0.92, gender: 'male' },
            holoF:  { pitch: 1.3,  rate: 1.05, gender: 'female' },
            neural: { pitch: 0.6,  rate: 0.85, gender: 'male' },
            prism:  { pitch: 1.15, rate: 0.78, gender: 'female' }
        }[this.currentAvatar] || { pitch: 1, rate: 1, gender: 'neutral' };

        this._utterance = new SpeechSynthesisUtterance(text);
        this._utterance.pitch = avatarVoice.pitch * mode.voice.pitch;
        this._utterance.rate = avatarVoice.rate * mode.voice.rate;
        this._utterance.volume = 1;

        // Select DIFFERENT actual voice per avatar
        const voices = window.speechSynthesis.getVoices();
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        let picked = null;

        if (avatarVoice.gender === 'female') {
            // Try to find a female voice
            picked = enVoices.find(v => /zira|female|samantha|karen|fiona|victoria|susan|hazel|linda/i.test(v.name))
                  || enVoices.find(v => /Google UK English Female|Google US English/i.test(v.name))
                  || enVoices.find(v => !/male|david|mark|james|daniel|george|richard/i.test(v.name) && enVoices.indexOf(v) > enVoices.length/2);
        } else if (avatarVoice.gender === 'male') {
            // Try to find a male voice
            picked = enVoices.find(v => /david|male|mark|james|daniel|george|richard/i.test(v.name))
                  || enVoices.find(v => /Google UK English Male/i.test(v.name))
                  || enVoices[0];
        }

        // Different fallback voices per avatar index to avoid same voice
        if (!picked && enVoices.length > 0) {
            const avatarIndex = { orb: 0, holoM: 1, holoF: 2, neural: 3, prism: 4 }[this.currentAvatar] || 0;
            picked = enVoices[avatarIndex % enVoices.length];
        }

        if (picked) this._utterance.voice = picked;

        this._utterance.onstart = () => {
            this._speaking = true;
            const s = document.getElementById('avatar-status');
            if (s) s.textContent = 'Speaking...';
        };
        this._utterance.onend = () => {
            this._speaking = false;
            const s = document.getElementById('avatar-status');
            if (s) s.textContent = 'Ready';
        };

        const responseEl = document.getElementById('avatar-response');
        if (responseEl) { responseEl.textContent = text; responseEl.style.opacity = '1'; }

        window.speechSynthesis.speak(this._utterance);
    },

    _startVoiceInput() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SR();
        recog.lang = 'en-US'; recog.interimResults = false;
        const btn = document.getElementById('avatar-mic-btn');
        if (btn) btn.classList.add('listening');
        recog.onresult = (e) => { if (btn) btn.classList.remove('listening'); this._askAndSpeak(e.results[0][0].transcript); };
        recog.onerror = () => { if (btn) btn.classList.remove('listening'); };
        recog.onend = () => { if (btn) btn.classList.remove('listening'); };
        recog.start();
    }
};

window.AvatarEngine = AvatarEngine;
