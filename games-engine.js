// ============================================
// MindBloom — Zen Games Engine
// 11 stress-relief interactive canvas games
// All sounds via Web Audio API (zero copyright)
// ============================================

const ZenGames = {
    _initialized: false,
    activeGame: null,
    canvas: null,
    ctx: null,
    animFrame: null,
    audioCtx: null,
    _entities: [],
    _particles: [],
    _score: 0,
    _mouseX: 0, _mouseY: 0,
    _mouseDown: false,
    _lastMouse: { x: 0, y: 0 },

    GAMES: {
        smash:        { name: '🔨 Stress Smash',   color: '#e76f51' },
        piano:        { name: '🎹 Zen Piano',      color: '#7c5cbf' },
        smoke:        { name: '💨 Smoke Art',      color: '#4ecdc4' },
        bubbles:      { name: '🫧 Bubble Pop',    color: '#ffd166' },
        breathe:      { name: '🎨 Color Breathe',  color: '#ff6b9d' },
        colormatch:   { name: '🎯 Color Match',    color: '#f72585' },
        neonbounce:   { name: '⚡ Neon Bounce',    color: '#00f5d4' },
        orbit:        { name: '🔮 Orbit Spinner',  color: '#f4a261' },
        gravity:      { name: '✨ Gravity Wells',  color: '#9d4edd' },
        kaleidoscope: { name: '🪩 Kaleidoscope',  color: '#06d6a0' },
        ripple:       { name: '🌊 Ripple Pool',   color: '#48cae4' }
    },

    init() {
        if (this._initialized) return;
        this._initialized = true;

        // Card clicks
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const game = card.dataset.game;
                if (game) this.launch(game);
            });
        });

        // Back button
        document.getElementById('games-back-btn')?.addEventListener('click', () => this.exit());
    },

    launch(gameKey) {
        const game = this.GAMES[gameKey];
        if (!game) return;

        this.activeGame = gameKey;
        this._score = 0;
        this._entities = [];
        this._particles = [];

        // Switch UI
        document.getElementById('games-selector').style.display = 'none';
        const arena = document.getElementById('games-arena');
        arena.style.display = 'flex';
        arena.style.animation = 'none';
        arena.offsetHeight;
        arena.style.animation = 'gamesFadeUp 0.4s ease-out';

        document.getElementById('games-active-name').textContent = game.name;
        document.getElementById('games-score').textContent = '';

        // Piano keys visibility
        document.getElementById('games-piano-keys').style.display = gameKey === 'piano' ? 'flex' : 'none';

        // Setup canvas
        this.canvas = document.getElementById('games-canvas');
        this.ctx = this.canvas.getContext('2d');
        this._resizeCanvas();

        // Events
        this._bindEvents();

        // Audio
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        // Launch specific game
        if (gameKey === 'piano') this._initPiano();
        if (gameKey === 'gravity') this._initGravity();
        if (gameKey === 'ripple') this._initRipple();
        if (gameKey === 'kaleidoscope') this._initKaleidoscope();
        if (gameKey === 'colormatch') this._initColorMatch();
        if (gameKey === 'neonbounce') this._initNeonBounce();
        if (gameKey === 'orbit') this._initOrbit();
        this._gameLoop();
    },

    exit() {
        this.activeGame = null;
        cancelAnimationFrame(this.animFrame);
        this._unbindEvents();

        document.getElementById('games-arena').style.display = 'none';
        document.getElementById('games-piano-keys').style.display = 'none';
        const sel = document.getElementById('games-selector');
        sel.style.display = 'block';
        sel.style.animation = 'none';
        sel.offsetHeight;
        sel.style.animation = 'gamesFadeUp 0.4s ease-out';
    },

    _resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height - 50; // topbar
    },

    // ==========================================
    // EVENT HANDLING
    // ==========================================
    _boundHandlers: {},

    _bindEvents() {
        this._unbindEvents();
        const c = this.canvas;

        this._boundHandlers.mousemove = (e) => {
            const r = c.getBoundingClientRect();
            this._lastMouse = { x: this._mouseX, y: this._mouseY };
            this._mouseX = e.clientX - r.left;
            this._mouseY = e.clientY - r.top;
        };
        this._boundHandlers.mousedown = (e) => {
            this._mouseDown = true;
            this._boundHandlers.mousemove(e);
            this._onClick();
        };
        this._boundHandlers.mouseup = () => { this._mouseDown = false; };
        this._boundHandlers.touchmove = (e) => {
            e.preventDefault();
            const t = e.touches[0];
            const r = c.getBoundingClientRect();
            this._lastMouse = { x: this._mouseX, y: this._mouseY };
            this._mouseX = t.clientX - r.left;
            this._mouseY = t.clientY - r.top;
        };
        this._boundHandlers.touchstart = (e) => {
            this._mouseDown = true;
            this._boundHandlers.touchmove(e);
            this._onClick();
        };
        this._boundHandlers.touchend = () => { this._mouseDown = false; };
        this._boundHandlers.resize = () => this._resizeCanvas();

        c.addEventListener('mousemove', this._boundHandlers.mousemove);
        c.addEventListener('mousedown', this._boundHandlers.mousedown);
        c.addEventListener('mouseup', this._boundHandlers.mouseup);
        c.addEventListener('touchmove', this._boundHandlers.touchmove, { passive: false });
        c.addEventListener('touchstart', this._boundHandlers.touchstart, { passive: false });
        c.addEventListener('touchend', this._boundHandlers.touchend);
        window.addEventListener('resize', this._boundHandlers.resize);
    },

    _unbindEvents() {
        const c = this.canvas;
        if (!c) return;
        Object.entries(this._boundHandlers).forEach(([evt, fn]) => {
            c.removeEventListener(evt, fn);
            window.removeEventListener(evt, fn);
        });
        this._boundHandlers = {};
    },

    _onClick() {
        if (this.activeGame === 'smash') this._smashClick();
        if (this.activeGame === 'bubbles') this._bubblesClick();
        if (this.activeGame === 'gravity') this._gravityClick();
        if (this.activeGame === 'ripple') this._rippleClick();
        if (this.activeGame === 'colormatch') this._colorMatchClick();
        if (this.activeGame === 'neonbounce') this._neonBounceClick();
        if (this.activeGame === 'orbit') this._orbitClick();
    },

    // ==========================================
    // GAME LOOP
    // ==========================================
    _gameLoop() {
        if (!this.activeGame) return;
        this.animFrame = requestAnimationFrame(() => this._gameLoop());

        const ctx = this.ctx;
        const w = this.canvas.width, h = this.canvas.height;

        // Fade trail (gives motion blur effect)
        ctx.fillStyle = 'rgba(15, 12, 20, 0.15)';
        ctx.fillRect(0, 0, w, h);

        switch (this.activeGame) {
            case 'smash':        this._smashUpdate(ctx, w, h); break;
            case 'piano':        this._pianoUpdate(ctx, w, h); break;
            case 'smoke':        this._smokeUpdate(ctx, w, h); break;
            case 'bubbles':      this._bubblesUpdate(ctx, w, h); break;
            case 'breathe':      this._breatheUpdate(ctx, w, h); break;
            case 'colormatch':   this._colorMatchUpdate(ctx, w, h); break;
            case 'neonbounce':   this._neonBounceUpdate(ctx, w, h); break;
            case 'orbit':        this._orbitUpdate(ctx, w, h); break;
            case 'gravity':      this._gravityUpdate(ctx, w, h); break;
            case 'kaleidoscope': this._kaleidoscopeUpdate(ctx, w, h); break;
            case 'ripple':       this._rippleUpdate(ctx, w, h); break;
        }

        // Universal particles
        this._updateParticles(ctx);
    },

    _updateParticles(ctx) {
        for (let i = this._particles.length - 1; i >= 0; i--) {
            const p = this._particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.vy += (p.gravity || 0);

            if (p.life <= 0) { this._particles.splice(i, 1); continue; }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace('1)', `${p.life})`);
            ctx.fill();
        }
    },

    _spawnParticles(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            this._particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: Math.random() * 4 + 2,
                life: 1,
                decay: 0.015 + Math.random() * 0.01,
                gravity: 0.05,
                color: color || 'rgba(255,150,100,1)'
            });
        }
    },

    // ==========================================
    // 🔨 STRESS SMASH
    // ==========================================
    _smashSpawnTimer: 0,

    _smashUpdate(ctx, w, h) {
        // Spawn orbs
        this._smashSpawnTimer++;
        if (this._smashSpawnTimer > 40) {
            this._smashSpawnTimer = 0;
            const hue = Math.random() * 360;
            this._entities.push({
                x: Math.random() * (w - 60) + 30,
                y: h + 30,
                r: 20 + Math.random() * 20,
                vy: -(1.5 + Math.random() * 2),
                vx: (Math.random() - 0.5) * 0.8,
                hue,
                pulse: Math.random() * Math.PI * 2,
                alive: true
            });
        }

        // Draw orbs
        for (let i = this._entities.length - 1; i >= 0; i--) {
            const e = this._entities[i];
            e.x += e.vx;
            e.y += e.vy;
            e.pulse += 0.06;

            if (e.y < -50) { this._entities.splice(i, 1); continue; }

            const pr = e.r + Math.sin(e.pulse) * 4;
            const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, pr);
            grad.addColorStop(0, `hsla(${e.hue}, 80%, 65%, 0.9)`);
            grad.addColorStop(0.6, `hsla(${e.hue}, 70%, 50%, 0.5)`);
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(e.x, e.y, pr, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Glow ring
            ctx.beginPath();
            ctx.arc(e.x, e.y, pr + 3, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${e.hue}, 80%, 65%, 0.3)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        document.getElementById('games-score').textContent = `Score: ${this._score}`;
    },

    _smashClick() {
        for (let i = this._entities.length - 1; i >= 0; i--) {
            const e = this._entities[i];
            const dx = this._mouseX - e.x, dy = this._mouseY - e.y;
            if (Math.sqrt(dx * dx + dy * dy) < e.r + 15) {
                // SMASH!
                this._spawnParticles(e.x, e.y, `hsla(${e.hue}, 80%, 65%, 1)`, 20);
                this._playTone(200 + e.hue, 0.15, 'square');
                this._entities.splice(i, 1);
                this._score += 10;

                // Screen shake
                this.canvas.style.transform = `translate(${(Math.random()-0.5)*6}px, ${(Math.random()-0.5)*6}px)`;
                setTimeout(() => { this.canvas.style.transform = ''; }, 100);
                break;
            }
        }
    },

    // ==========================================
    // 🎹 ZEN PIANO
    // ==========================================
    _pianoRipples: [],

    // Pentatonic scale - universally pleasant, no copyright
    PIANO_NOTES: [
        { note: 'C',  freq: 261.63, color: '#ff6b9d' },
        { note: 'D',  freq: 293.66, color: '#ffd166' },
        { note: 'E',  freq: 329.63, color: '#4ecdc4' },
        { note: 'F',  freq: 349.23, color: '#7c5cbf' },
        { note: 'G',  freq: 392.00, color: '#52b788' },
        { note: 'A',  freq: 440.00, color: '#e76f51' },
        { note: 'B',  freq: 493.88, color: '#457b9d' },
        { note: 'C2', freq: 523.25, color: '#ff6b9d' },
        { note: 'D2', freq: 587.33, color: '#ffd166' },
        { note: 'E2', freq: 659.25, color: '#4ecdc4' },
    ],

    _initPiano() {
        const container = document.getElementById('games-piano-keys');
        container.innerHTML = this.PIANO_NOTES.map((n, i) => 
            `<div class="piano-key white" data-note="${i}" style="--key-color: ${n.color}">${n.note}</div>`
        ).join('');

        container.querySelectorAll('.piano-key').forEach(key => {
            const play = () => {
                const idx = parseInt(key.dataset.note);
                this._playPianoNote(idx);
                key.classList.add('pressed');
                setTimeout(() => key.classList.remove('pressed'), 200);
            };
            key.addEventListener('mousedown', play);
            key.addEventListener('touchstart', (e) => { e.preventDefault(); play(); });
        });
    },

    _playPianoNote(idx) {
        const note = this.PIANO_NOTES[idx];
        if (!note) return;

        // Play tone
        const ctx = this.audioCtx;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        osc.connect(g).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);

        // Harmonic overtone for richness
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = note.freq * 2;
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.04, ctx.currentTime);
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc2.connect(g2).connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 1);

        // Visual ripple
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const keyX = (idx / this.PIANO_NOTES.length) * this.canvas.width;
        this._pianoRipples.push({
            x: keyX,
            y: this.canvas.height,
            r: 10,
            maxR: 200 + Math.random() * 100,
            color: note.color,
            alpha: 0.6
        });
    },

    _pianoUpdate(ctx, w, h) {
        for (let i = this._pianoRipples.length - 1; i >= 0; i--) {
            const r = this._pianoRipples[i];
            r.r += 3;
            r.alpha -= 0.008;
            r.y -= 1;

            if (r.alpha <= 0 || r.r > r.maxR) {
                this._pianoRipples.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            ctx.strokeStyle = r.color;
            ctx.globalAlpha = r.alpha;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Inner glow
            const grad = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.r * 0.5);
            grad.addColorStop(0, r.color + '15');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fill();
        }
    },

    // ==========================================
    // 💨 SMOKE ART
    // ==========================================
    _smokeHue: 0,

    _smokeUpdate(ctx, w, h) {
        this._smokeHue = (this._smokeHue + 0.3) % 360;

        if (this._mouseDown) {
            const dx = this._mouseX - this._lastMouse.x;
            const dy = this._mouseY - this._lastMouse.y;
            const speed = Math.sqrt(dx * dx + dy * dy);

            for (let i = 0; i < Math.min(speed * 0.5 + 2, 8); i++) {
                this._particles.push({
                    x: this._mouseX + (Math.random() - 0.5) * 20,
                    y: this._mouseY + (Math.random() - 0.5) * 20,
                    vx: dx * 0.1 + (Math.random() - 0.5) * 2,
                    vy: dy * 0.1 - Math.random() * 1.5,
                    r: 8 + Math.random() * 15,
                    life: 1,
                    decay: 0.003 + Math.random() * 0.004,
                    gravity: -0.02,
                    color: `hsla(${this._smokeHue + Math.random() * 40}, 70%, 60%, 1)`
                });
            }
        }

        // Instruction
        if (this._particles.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.font = '600 14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Click and drag to create smoke', w / 2, h / 2);
        }
    },

    // ==========================================
    // 🫧 BUBBLE POP
    // ==========================================
    _bubbleSpawnTimer: 0,

    _bubblesUpdate(ctx, w, h) {
        // Spawn bubbles
        this._bubbleSpawnTimer++;
        if (this._bubbleSpawnTimer > 30) {
            this._bubbleSpawnTimer = 0;
            const hue = Math.random() * 360;
            this._entities.push({
                x: Math.random() * (w - 40) + 20,
                y: h + 20,
                r: 15 + Math.random() * 25,
                vy: -(0.5 + Math.random() * 1.2),
                vx: (Math.random() - 0.5) * 0.5,
                hue,
                wobble: Math.random() * Math.PI * 2,
                shimmer: Math.random() * Math.PI * 2
            });
        }

        // Draw bubbles
        for (let i = this._entities.length - 1; i >= 0; i--) {
            const b = this._entities[i];
            b.wobble += 0.03;
            b.shimmer += 0.05;
            b.x += b.vx + Math.sin(b.wobble) * 0.5;
            b.y += b.vy;

            if (b.y < -40) { this._entities.splice(i, 1); continue; }

            // Bubble body
            const grad = ctx.createRadialGradient(
                b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1,
                b.x, b.y, b.r
            );
            grad.addColorStop(0, `hsla(${b.hue}, 60%, 80%, 0.15)`);
            grad.addColorStop(0.7, `hsla(${b.hue}, 50%, 60%, 0.08)`);
            grad.addColorStop(1, `hsla(${b.hue}, 40%, 50%, 0.02)`);

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Bubble rim
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${b.hue}, 60%, 70%, ${0.25 + Math.sin(b.shimmer) * 0.1})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Highlight
            ctx.beginPath();
            ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fill();
        }

        document.getElementById('games-score').textContent = `Popped: ${this._score}`;
    },

    _bubblesClick() {
        for (let i = this._entities.length - 1; i >= 0; i--) {
            const b = this._entities[i];
            const dx = this._mouseX - b.x, dy = this._mouseY - b.y;
            if (Math.sqrt(dx * dx + dy * dy) < b.r + 10) {
                // POP!
                this._spawnParticles(b.x, b.y, `hsla(${b.hue}, 60%, 70%, 1)`, 15);
                this._playTone(400 + b.hue * 2, 0.08, 'sine');
                this._entities.splice(i, 1);
                this._score++;
                break;
            }
        }
    },

    // ==========================================
    // 🎨 COLOR BREATHE
    // ==========================================
    _breathePhase: 0,
    _breatheTouchRipples: [],

    _breatheUpdate(ctx, w, h) {
        this._breathePhase += 0.008;
        const cx = w / 2, cy = h / 2;

        // Background gradient shift
        const hue1 = (Date.now() / 50) % 360;
        const hue2 = (hue1 + 120) % 360;

        // Central breathing orb
        const breathScale = 0.5 + 0.5 * Math.sin(this._breathePhase * 2);
        const orbR = 60 + breathScale * 60;

        // Outer glow rings
        for (let ring = 3; ring >= 0; ring--) {
            const ringR = orbR + ring * 40 + Math.sin(this._breathePhase + ring) * 15;
            const grad = ctx.createRadialGradient(cx, cy, ringR * 0.5, cx, cy, ringR);
            grad.addColorStop(0, `hsla(${hue1 + ring * 30}, 60%, 50%, ${0.04 - ring * 0.008})`);
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }

        // Core orb
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR);
        coreGrad.addColorStop(0, `hsla(${hue1}, 70%, 65%, 0.4)`);
        coreGrad.addColorStop(0.5, `hsla(${hue2}, 60%, 50%, 0.15)`);
        coreGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Breathing text
        const breathPhases = ['Breathe In...', 'Hold...', 'Breathe Out...', 'Hold...'];
        const phaseIdx = Math.floor((this._breathePhase * 2) % 4);
        ctx.font = '600 16px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = `hsla(${hue1}, 50%, 70%, ${0.3 + breathScale * 0.3})`;
        ctx.fillText(breathPhases[phaseIdx], cx, cy + orbR + 40);

        // Touch ripples
        if (this._mouseDown) {
            this._breatheTouchRipples.push({
                x: this._mouseX, y: this._mouseY,
                r: 5, maxR: 80 + Math.random() * 60,
                hue: hue1 + Math.random() * 60,
                alpha: 0.5
            });
        }

        for (let i = this._breatheTouchRipples.length - 1; i >= 0; i--) {
            const r = this._breatheTouchRipples[i];
            r.r += 2;
            r.alpha -= 0.01;
            if (r.alpha <= 0) { this._breatheTouchRipples.splice(i, 1); continue; }

            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${r.hue}, 60%, 60%, ${r.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Floating ambient particles
        if (Math.random() < 0.08) {
            this._particles.push({
                x: Math.random() * w,
                y: h + 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -(0.3 + Math.random() * 0.5),
                r: 2 + Math.random() * 3,
                life: 1,
                decay: 0.002 + Math.random() * 0.003,
                gravity: 0,
                color: `hsla(${hue1 + Math.random() * 60}, 50%, 60%, 1)`
            });
        }
    },

    // ==========================================
    // AUDIO HELPERS
    // ==========================================
    _playTone(freq, vol = 0.1, type = 'sine') {
        try {
            const ctx = this.audioCtx;
            if (!ctx) return;
            const osc = ctx.createOscillator();
            osc.type = type;
            osc.frequency.value = freq;
            const g = ctx.createGain();
            g.gain.setValueAtTime(vol, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.connect(g).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {}
    },

    // ==========================================
    // 🎯 COLOR MATCH
    // ==========================================
    _cmTargetHue: 0,
    _cmCircles: [],
    _cmStreak: 0,
    _cmBestStreak: 0,
    _cmTimer: 0,
    _cmPhase: 0,

    _initColorMatch() {
        this._cmStreak = 0;
        this._cmBestStreak = 0;
        this._cmTimer = 0;
        this._spawnColorMatchRound();
    },

    _spawnColorMatchRound() {
        this._cmTargetHue = Math.floor(Math.random() * 6) * 60;
        this._cmCircles = [];
        this._cmPhase = 0;
        const w = this.canvas.width, h = this.canvas.height;
        const count = 6 + Math.min(this._cmStreak, 8);
        const correctCount = 1 + Math.floor(Math.random() * 2);

        for (let i = 0; i < count; i++) {
            const isCorrect = i < correctCount;
            let hue = isCorrect ? this._cmTargetHue : (this._cmTargetHue + 60 + Math.random() * 240) % 360;
            this._cmCircles.push({
                x: 60 + Math.random() * (w - 120),
                y: 80 + Math.random() * (h - 160),
                r: 22 + Math.random() * 12,
                hue, isCorrect,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                pulse: Math.random() * Math.PI * 2,
                alive: true
            });
        }
    },

    _colorMatchClick() {
        for (let i = this._cmCircles.length - 1; i >= 0; i--) {
            const c = this._cmCircles[i];
            const dx = this._mouseX - c.x, dy = this._mouseY - c.y;
            if (Math.sqrt(dx*dx + dy*dy) < c.r + 8) {
                if (c.isCorrect) {
                    this._spawnParticles(c.x, c.y, `hsla(${c.hue}, 80%, 60%, 1)`, 18);
                    this._playTone(500 + this._cmStreak * 30, 0.12, 'sine');
                    this._cmCircles.splice(i, 1);
                    this._cmStreak++;
                    this._cmBestStreak = Math.max(this._cmBestStreak, this._cmStreak);
                    this._score += 10 + this._cmStreak * 2;
                    // Check if all correct are gone
                    if (!this._cmCircles.some(c => c.isCorrect)) {
                        setTimeout(() => this._spawnColorMatchRound(), 400);
                    }
                } else {
                    // Wrong! Screen flash + streak reset
                    this._playTone(150, 0.15, 'square');
                    this._cmStreak = 0;
                    this.canvas.style.boxShadow = '0 0 30px rgba(255,50,50,0.4)';
                    setTimeout(() => { this.canvas.style.boxShadow = ''; }, 200);
                }
                break;
            }
        }
    },

    _colorMatchUpdate(ctx, w, h) {
        this._cmPhase += 0.02;

        // Target color display
        ctx.fillStyle = `hsla(${this._cmTargetHue}, 70%, 55%, 0.9)`;
        ctx.beginPath();
        ctx.roundRect(w / 2 - 70, 8, 140, 32, 12);
        ctx.fill();
        ctx.font = '700 13px system-ui';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('TAP THIS COLOR', w / 2, 30);

        // Draw circles
        for (const c of this._cmCircles) {
            c.pulse += 0.05;
            c.x += c.vx;
            c.y += c.vy;
            if (c.x < c.r || c.x > w - c.r) c.vx *= -1;
            if (c.y < 50 + c.r || c.y > h - c.r) c.vy *= -1;

            const pr = c.r + Math.sin(c.pulse) * 3;
            const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, pr);
            grad.addColorStop(0, `hsla(${c.hue}, 75%, 60%, 0.9)`);
            grad.addColorStop(0.7, `hsla(${c.hue}, 65%, 45%, 0.5)`);
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(c.x, c.y, pr, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(c.x, c.y, pr + 2, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${c.hue}, 70%, 60%, 0.25)`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Score + streak
        ctx.font = '700 12px system-ui';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(`Streak: ${this._cmStreak}  |  Best: ${this._cmBestStreak}`, 12, h - 12);
        document.getElementById('games-score').textContent = `Score: ${this._score}`;
    },

    // ==========================================
    // ⚡ NEON BOUNCE
    // ==========================================
    _neonBalls: [],

    _initNeonBounce() {
        this._neonBalls = [];
    },

    _neonBounceClick() {
        const hue = Math.random() * 360;
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 4;
        this._neonBalls.push({
            x: this._mouseX, y: this._mouseY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: 8 + Math.random() * 6,
            hue,
            trail: [],
            life: 1,
            bounces: 0
        });
        this._playTone(300 + hue, 0.08, 'sine');
        // Limit max balls
        if (this._neonBalls.length > 30) this._neonBalls.shift();
    },

    _neonBounceUpdate(ctx, w, h) {
        for (let i = this._neonBalls.length - 1; i >= 0; i--) {
            const b = this._neonBalls[i];

            // Physics
            b.vy += 0.08; // gravity
            b.x += b.vx;
            b.y += b.vy;

            // Bounce off walls
            if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.95; b.bounces++; this._playTone(200 + b.hue, 0.04, 'sine'); }
            if (b.x + b.r > w) { b.x = w - b.r; b.vx = -Math.abs(b.vx) * 0.95; b.bounces++; this._playTone(200 + b.hue, 0.04, 'sine'); }
            if (b.y + b.r > h) { b.y = h - b.r; b.vy = -Math.abs(b.vy) * 0.9; b.bounces++; this._playTone(250 + b.hue, 0.05, 'sine'); }
            if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy) * 0.95; b.bounces++; }

            // Trail
            b.trail.push({ x: b.x, y: b.y });
            if (b.trail.length > 30) b.trail.shift();

            // Fade old balls
            b.life -= 0.0005;
            if (b.life <= 0) { this._neonBalls.splice(i, 1); continue; }

            // Draw trail
            for (let t = 1; t < b.trail.length; t++) {
                const alpha = (t / b.trail.length) * b.life * 0.5;
                const tr = b.r * (t / b.trail.length) * 0.6;
                ctx.beginPath();
                ctx.arc(b.trail[t].x, b.trail[t].y, tr, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${b.hue + t * 3}, 80%, 60%, ${alpha})`;
                ctx.fill();
            }

            // Draw ball
            const ballGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            ballGrad.addColorStop(0, `hsla(${b.hue}, 90%, 75%, ${b.life})`);
            ballGrad.addColorStop(0.5, `hsla(${b.hue}, 80%, 55%, ${b.life * 0.7})`);
            ballGrad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = ballGrad;
            ctx.fill();

            // Glow
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r + 4, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${b.hue}, 80%, 65%, ${b.life * 0.3})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (this._neonBalls.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.font = '600 14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Click anywhere to spawn neon balls', w / 2, h / 2);
        }
    },

    // ==========================================
    // 🔮 ORBIT SPINNER
    // ==========================================
    _orbitPlanets: [],
    _orbitCenter: { x: 0, y: 0 },
    _orbitTime: 0,

    _initOrbit() {
        this._orbitPlanets = [];
        this._orbitTime = 0;
        this._orbitCenter = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
    },

    _orbitClick() {
        const hue = Math.random() * 360;
        const cx = this._orbitCenter.x;
        const cy = this._orbitCenter.y;
        const dx = this._mouseX - cx;
        const dy = this._mouseY - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const startAngle = Math.atan2(dy, dx);

        this._orbitPlanets.push({
            orbitR: Math.max(dist, 30),
            angle: startAngle,
            speed: 0.008 + Math.random() * 0.015,
            direction: Math.random() > 0.5 ? 1 : -1,
            r: 4 + Math.random() * 6,
            hue,
            trail: [],
            tilt: (Math.random() - 0.5) * 0.3
        });
        this._playTone(350 + hue, 0.06, 'sine');
        if (this._orbitPlanets.length > 20) this._orbitPlanets.shift();
    },

    _orbitUpdate(ctx, w, h) {
        this._orbitTime += 0.01;
        const cx = this._orbitCenter.x;
        const cy = this._orbitCenter.y;

        // Central star
        const starPulse = 0.8 + Math.sin(this._orbitTime * 3) * 0.2;
        const starGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * starPulse);
        starGrad.addColorStop(0, 'rgba(255, 220, 150, 0.6)');
        starGrad.addColorStop(0.5, 'rgba(255, 180, 100, 0.2)');
        starGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, 18 * starPulse, 0, Math.PI * 2);
        ctx.fillStyle = starGrad;
        ctx.fill();

        // Outer glow
        const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
        outerGrad.addColorStop(0, 'rgba(255, 200, 100, 0.06)');
        outerGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Update planets
        for (const p of this._orbitPlanets) {
            p.angle += p.speed * p.direction;
            const px = cx + Math.cos(p.angle) * p.orbitR;
            const py = cy + Math.sin(p.angle) * p.orbitR * (1 - Math.abs(p.tilt));

            // Trail
            p.trail.push({ x: px, y: py });
            if (p.trail.length > 50) p.trail.shift();

            // Draw orbit path (faint)
            ctx.beginPath();
            ctx.ellipse(cx, cy, p.orbitR, p.orbitR * (1 - Math.abs(p.tilt)), 0, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${p.hue}, 30%, 40%, 0.04)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Draw trail
            for (let t = 1; t < p.trail.length; t++) {
                const alpha = (t / p.trail.length) * 0.35;
                const tr = p.r * (t / p.trail.length) * 0.5;
                ctx.beginPath();
                ctx.arc(p.trail[t].x, p.trail[t].y, tr, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue + t * 2}, 60%, 55%, ${alpha})`;
                ctx.fill();
            }

            // Draw planet
            const pGrad = ctx.createRadialGradient(px, py, 0, px, py, p.r);
            pGrad.addColorStop(0, `hsla(${p.hue}, 80%, 70%, 0.9)`);
            pGrad.addColorStop(0.6, `hsla(${p.hue}, 70%, 50%, 0.5)`);
            pGrad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(px, py, p.r, 0, Math.PI * 2);
            ctx.fillStyle = pGrad;
            ctx.fill();

            // Planet glow
            ctx.beginPath();
            ctx.arc(px, py, p.r + 3, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${p.hue}, 70%, 60%, 0.2)`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        if (this._orbitPlanets.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.font = '600 14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Click to create orbiting planets', w / 2, h - 25);
        }
    },

    // ==========================================
    // ✨ GRAVITY WELLS
    // ==========================================
    _gravityWells: [],
    _gravityDots: [],

    _initGravity() {
        this._gravityWells = [];
        this._gravityDots = [];
        const w = this.canvas.width, h = this.canvas.height;
        // Seed floating particles
        for (let i = 0; i < 200; i++) {
            this._gravityDots.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                hue: Math.random() * 360,
                r: 1.5 + Math.random() * 2
            });
        }
    },

    _gravityClick() {
        const hue = Math.random() * 360;
        this._gravityWells.push({
            x: this._mouseX, y: this._mouseY,
            strength: 0.8 + Math.random() * 0.5,
            hue,
            life: 1,
            r: 0
        });
        this._playTone(150 + hue, 0.08, 'sine');

        // Add more particles around click
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 80;
            this._gravityDots.push({
                x: this._mouseX + Math.cos(angle) * dist,
                y: this._mouseY + Math.sin(angle) * dist,
                vx: 0, vy: 0,
                hue: hue + Math.random() * 30,
                r: 1.5 + Math.random() * 2
            });
        }
    },

    _gravityUpdate(ctx, w, h) {
        // Update wells
        for (let i = this._gravityWells.length - 1; i >= 0; i--) {
            const well = this._gravityWells[i];
            well.life -= 0.002;
            well.r += 0.3;
            if (well.life <= 0) { this._gravityWells.splice(i, 1); continue; }

            // Draw well aura
            const grad = ctx.createRadialGradient(well.x, well.y, 0, well.x, well.y, 40 + well.r);
            grad.addColorStop(0, `hsla(${well.hue}, 70%, 55%, ${well.life * 0.15})`);
            grad.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(well.x, well.y, 40 + well.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Pulsing ring
            ctx.beginPath();
            ctx.arc(well.x, well.y, 8 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${well.hue}, 70%, 60%, ${well.life * 0.5})`;
            ctx.fill();
        }

        // Update particles
        for (const dot of this._gravityDots) {
            // Apply gravity from wells
            for (const well of this._gravityWells) {
                const dx = well.x - dot.x;
                const dy = well.y - dot.y;
                const dist = Math.max(Math.sqrt(dx*dx + dy*dy), 10);
                const force = well.strength * well.life / (dist * 0.5);
                dot.vx += (dx / dist) * force * 0.3;
                dot.vy += (dy / dist) * force * 0.3;
            }

            // Dampening
            dot.vx *= 0.98;
            dot.vy *= 0.98;
            dot.x += dot.vx;
            dot.y += dot.vy;

            // Wrap edges
            if (dot.x < 0) dot.x = w;
            if (dot.x > w) dot.x = 0;
            if (dot.y < 0) dot.y = h;
            if (dot.y > h) dot.y = 0;

            // Draw
            const speed = Math.sqrt(dot.vx*dot.vx + dot.vy*dot.vy);
            const alpha = Math.min(0.3 + speed * 0.15, 0.9);
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${dot.hue + speed * 20}, 60%, 60%, ${alpha})`;
            ctx.fill();

            // Speed trail
            if (speed > 1.5) {
                ctx.beginPath();
                ctx.moveTo(dot.x, dot.y);
                ctx.lineTo(dot.x - dot.vx * 3, dot.y - dot.vy * 3);
                ctx.strokeStyle = `hsla(${dot.hue}, 50%, 55%, ${alpha * 0.3})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        // Instruction
        if (this._gravityWells.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.font = '600 14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Click anywhere to create gravity wells', w / 2, 30);
        }
    },

    // ==========================================
    // 🪩 KALEIDOSCOPE
    // ==========================================
    _kaleidoSegments: 8,
    _kaleidoHue: 0,
    _kaleidoBuffer: null,

    _initKaleidoscope() {
        this._kaleidoHue = 0;
        // Clear to black
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(15, 12, 20, 1)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    _kaleidoscopeUpdate(ctx, w, h) {
        this._kaleidoHue = (this._kaleidoHue + 0.5) % 360;
        const cx = w / 2, cy = h / 2;

        if (this._mouseDown) {
            const dx = this._mouseX - this._lastMouse.x;
            const dy = this._mouseY - this._lastMouse.y;
            const speed = Math.sqrt(dx*dx + dy*dy);
            if (speed < 0.5) return;

            // Convert mouse to polar relative to center
            const relX = this._mouseX - cx;
            const relY = this._mouseY - cy;
            const prevRelX = this._lastMouse.x - cx;
            const prevRelY = this._lastMouse.y - cy;

            const segments = this._kaleidoSegments;
            const angleStep = (Math.PI * 2) / segments;

            for (let seg = 0; seg < segments; seg++) {
                const angle = seg * angleStep;
                const mirror = seg % 2 === 0 ? 1 : -1;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle);
                ctx.scale(1, mirror);

                ctx.beginPath();
                ctx.moveTo(prevRelX, prevRelY * mirror);
                ctx.lineTo(relX, relY * mirror);
                ctx.strokeStyle = `hsla(${this._kaleidoHue + seg * 20}, 70%, 60%, 0.7)`;
                ctx.lineWidth = 2 + speed * 0.3;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Glow
                ctx.strokeStyle = `hsla(${this._kaleidoHue + seg * 20}, 80%, 70%, 0.15)`;
                ctx.lineWidth = 6 + speed * 0.5;
                ctx.stroke();

                ctx.restore();
            }
        }

        // Subtle center glow
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15);
        grad.addColorStop(0, `hsla(${this._kaleidoHue}, 50%, 50%, 0.08)`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        if (!this._mouseDown) {
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.font = '600 13px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Click and drag to draw symmetric patterns', cx, h - 20);
        }
    },

    // ==========================================
    // 🌊 RIPPLE POOL
    // ==========================================
    _ripples: [],
    _rippleDroplets: [],

    _initRipple() {
        this._ripples = [];
        this._rippleDroplets = [];
        // Seed ambient droplets
        const w = this.canvas.width, h = this.canvas.height;
        for (let i = 0; i < 50; i++) {
            this._rippleDroplets.push({
                x: Math.random() * w,
                y: Math.random() * h,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.02,
                baseY: Math.random() * h,
                baseX: Math.random() * w,
                r: 1 + Math.random() * 1.5
            });
        }
    },

    _rippleClick() {
        // Create multi-ring ripple
        for (let i = 0; i < 3; i++) {
            this._ripples.push({
                x: this._mouseX + (Math.random()-0.5) * 10,
                y: this._mouseY + (Math.random()-0.5) * 10,
                r: i * 5,
                maxR: 120 + Math.random() * 80 + i * 30,
                alpha: 0.5 - i * 0.1,
                speed: 2.5 - i * 0.3,
                hue: 200 + Math.random() * 40
            });
        }
        // Subtle water plop sound
        this._playTone(600 + Math.random() * 200, 0.05, 'sine');
        this._playTone(300 + Math.random() * 100, 0.03, 'triangle');
    },

    _rippleUpdate(ctx, w, h) {
        // Water base — subtle blue gradient
        const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
        baseGrad.addColorStop(0, 'rgba(10, 15, 30, 0.15)');
        baseGrad.addColorStop(1, 'rgba(15, 25, 50, 0.15)');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 0, w, h);

        // Ambient floating light droplets
        const time = Date.now() / 1000;
        for (const d of this._rippleDroplets) {
            d.phase += d.speed;
            // Gentle sway affected by ripples
            let offsetX = Math.sin(d.phase) * 3;
            let offsetY = Math.cos(d.phase * 0.7) * 2;

            // Ripple displacement
            for (const rip of this._ripples) {
                const dx = d.baseX - rip.x;
                const dy = d.baseY - rip.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (Math.abs(dist - rip.r) < 20) {
                    const wave = Math.sin((dist - rip.r) * 0.3) * rip.alpha * 8;
                    offsetX += (dx / dist) * wave;
                    offsetY += (dy / dist) * wave;
                }
            }

            d.x = d.baseX + offsetX;
            d.y = d.baseY + offsetY;

            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(210, 40%, 70%, ${0.15 + Math.sin(d.phase * 2) * 0.05})`;
            ctx.fill();
        }

        // Draw ripples
        for (let i = this._ripples.length - 1; i >= 0; i--) {
            const rip = this._ripples[i];
            rip.r += rip.speed;
            rip.alpha -= 0.004;

            if (rip.alpha <= 0 || rip.r > rip.maxR) {
                this._ripples.splice(i, 1);
                continue;
            }

            // Ripple ring
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${rip.hue}, 50%, 65%, ${rip.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Inner shimmer
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.r * 0.98, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${rip.hue + 20}, 60%, 75%, ${rip.alpha * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Light refraction caustics
            if (rip.r > 20 && rip.alpha > 0.15) {
                for (let c = 0; c < 4; c++) {
                    const cAngle = (time * 0.5 + c * Math.PI / 2) + rip.r * 0.02;
                    const cx = rip.x + Math.cos(cAngle) * rip.r * 0.6;
                    const cy = rip.y + Math.sin(cAngle) * rip.r * 0.6;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(200, 60%, 80%, ${rip.alpha * 0.4})`;
                    ctx.fill();
                }
            }
        }

        // Auto ambient drips
        if (Math.random() < 0.008) {
            this._ripples.push({
                x: Math.random() * w, y: Math.random() * h,
                r: 0, maxR: 40 + Math.random() * 30,
                alpha: 0.2, speed: 1, hue: 200 + Math.random() * 30
            });
        }

        // Instruction
        if (this._ripples.length < 3) {
            ctx.fillStyle = 'rgba(150, 200, 255, 0.08)';
            ctx.font = '600 14px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('Click to disturb the water surface', w / 2, 30);
        }
    }
};

window.ZenGames = ZenGames;
