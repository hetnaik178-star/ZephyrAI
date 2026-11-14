/**
 * Zephyr Ambient Music Player
 * Premium floating music widget with jazz/lounge vibes
 * Streams free royalty-free music — works on any device
 */

const ZephyrMusic = {
    // State
    isOpen: false,
    isPlaying: false,
    currentTrack: 0,
    audio: null,
    volume: 0.35,
    animFrame: null,
    shuffle: false,
    repeat: false,
    panelParticles: [],
    floatingNotes: [],

    // Playlist — curated jazz/lounge/ambient vibes
    // High-quality royalty-free Mixkit tracks, stored locally
    playlist: [
        {
            title: 'Smooth Like Jazz',
            artist: 'Ahjay Stelino',
            genre: 'Jazz Blues',
            url: 'smooth-like-jazz.mp3',
            color: '#8b5cf6'
        },
        {
            title: 'Chill Bro',
            artist: 'Diego Nava',
            genre: 'Jazz Fusion',
            url: 'chill-bro.mp3',
            color: '#ec4899'
        },
        {
            title: 'Lounging By Moonlight',
            artist: 'Ahjay Stelino',
            genre: 'Lounge Jazz',
            url: 'lounging-by-moonlight.mp3',
            color: '#06b6d4'
        },
        {
            title: 'You Got Jazz',
            artist: 'Diego Nava',
            genre: 'Jazz Funk',
            url: 'you-got-jazz.mp3',
            color: '#f59e0b'
        },
        {
            title: 'Latin Lovers',
            artist: 'Ahjay Stelino',
            genre: 'Bossa Nova',
            url: 'latin-lovers.mp3',
            color: '#10b981'
        },
        {
            title: 'Beautiful Dream',
            artist: 'Diego Nava',
            genre: 'Romantic Jazz',
            url: 'beautiful-dream.mp3',
            color: '#a78bfa'
        },
        {
            title: 'Soul Jazz',
            artist: 'Ahjay Stelino',
            genre: 'Soul Jazz',
            url: 'soul-jazz.mp3',
            color: '#f472b6'
        },
        {
            title: 'Winter Wind',
            artist: 'Diego Nava',
            genre: 'Ambient Jazz',
            url: 'winter-wind.mp3',
            color: '#6366f1'
        }
    ],

    init() {
        this.createWidget();
        this.createAudio();
        this.createPanelParticles();
        this.bindEvents();
        this.animatePanelEffects();
        console.log('🎵 ZephyrMusic player loaded');
    },

    createAudio() {
        this.audio = new Audio();
        this.audio.volume = this.volume;
        this.audio.preload = 'none';

        this.audio.addEventListener('ended', () => this.next());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadstart', () => this.setLoading(true));
        this.audio.addEventListener('canplay', () => this.setLoading(false));
        this.audio.addEventListener('error', (e) => {
            console.warn('Track failed, skipping:', e);
            this.setLoading(false);
            // Skip to next on error
            setTimeout(() => this.next(), 1000);
        });
    },

    createWidget() {
        // Floating toggle button (bottom-left)
        const toggle = document.createElement('div');
        toggle.id = 'music-toggle';
        toggle.innerHTML = `
            <div class="music-toggle-inner">
                <div class="music-vinyl">
                    <div class="vinyl-groove"></div>
                    <div class="vinyl-groove v2"></div>
                    <div class="vinyl-label">♪</div>
                </div>
                <div class="music-pulse-ring"></div>
                <div class="music-pulse-ring r2"></div>
            </div>
        `;
        document.body.appendChild(toggle);

        // Player panel
        const panel = document.createElement('div');
        panel.id = 'music-panel';
        panel.className = 'music-panel-closed';
        panel.innerHTML = `
            <div class="mp-header">
                <div class="mp-title-row">
                    <span class="mp-logo">🎶</span>
                    <span class="mp-title">Ambient Vibes</span>
                </div>
                <button class="mp-close" id="mp-close" title="Minimize">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
            </div>

            <canvas class="mp-particle-canvas" id="mp-particle-canvas"></canvas>
            <div class="mp-notes-container" id="mp-notes-container"></div>

            <div class="mp-visualizer" id="mp-visualizer">
                ${Array.from({ length: 32 }, (_, i) => `<div class="mp-bar" style="--i:${i}"></div>`).join('')}
            </div>

            <div class="mp-track-info">
                <div class="mp-track-name" id="mp-track-name">Smooth Like Jazz</div>
                <div class="mp-track-artist" id="mp-track-artist">Ahjay Stelino · Jazz Blues</div>
            </div>

            <div class="mp-progress-wrap" id="mp-progress-wrap">
                <div class="mp-progress-bar">
                    <div class="mp-progress-fill" id="mp-progress-fill"></div>
                    <div class="mp-progress-glow" id="mp-progress-glow"></div>
                </div>
                <div class="mp-progress-times">
                    <span id="mp-time-current">0:00</span>
                    <span id="mp-time-total">0:00</span>
                </div>
            </div>

            <div class="mp-controls">
                <button class="mp-btn mp-btn-mini" id="mp-shuffle" title="Shuffle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="16 3 21 3 21 8"/>
                        <line x1="4" y1="20" x2="21" y2="3"/>
                        <polyline points="21 16 21 21 16 21"/>
                        <line x1="15" y1="15" x2="21" y2="21"/>
                        <line x1="4" y1="4" x2="9" y2="9"/>
                    </svg>
                </button>
                <button class="mp-btn mp-btn-secondary" id="mp-prev" title="Previous">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                </button>
                <div class="mp-play-orbit" id="mp-play-orbit"></div>
                <button class="mp-btn mp-btn-play" id="mp-play" title="Play">
                    <svg class="mp-icon-play" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg class="mp-icon-pause hidden" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                </button>
                <button class="mp-btn mp-btn-secondary" id="mp-next" title="Next">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                </button>
                <button class="mp-btn mp-btn-mini" id="mp-repeat" title="Repeat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="17 1 21 5 17 9"/>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                        <polyline points="7 23 3 19 7 15"/>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    </svg>
                </button>
            </div>

            <div class="mp-volume-row">
                <svg class="mp-vol-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
                <input type="range" class="mp-volume-slider" id="mp-volume" min="0" max="100" value="35">
                <span class="mp-vol-pct" id="mp-vol-pct">35%</span>
            </div>

            <div class="mp-playlist-toggle" id="mp-playlist-toggle">
                <span>Playlist</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>

            <div class="mp-playlist hidden" id="mp-playlist">
                ${this.playlist.map((t, i) => `
                    <button class="mp-playlist-item ${i === 0 ? 'active' : ''}" data-index="${i}">
                        <span class="mp-pl-dot" style="background:${t.color}"></span>
                        <div class="mp-pl-info">
                            <span class="mp-pl-name">${t.title}</span>
                            <span class="mp-pl-artist">${t.artist}</span>
                        </div>
                        <span class="mp-pl-genre">${t.genre}</span>
                    </button>
                `).join('')}
            </div>
        `;
        document.body.appendChild(panel);
    },

    bindEvents() {
        // Toggle panel
        document.getElementById('music-toggle').addEventListener('click', () => this.togglePanel());
        document.getElementById('mp-close').addEventListener('click', () => this.togglePanel());

        // Controls
        document.getElementById('mp-play').addEventListener('click', (e) => { this.spawnRipple(e); this.togglePlay(); });
        document.getElementById('mp-prev').addEventListener('click', (e) => { this.spawnRipple(e); this.prev(); });
        document.getElementById('mp-next').addEventListener('click', (e) => { this.spawnRipple(e); this.next(); });

        // Shuffle & Repeat
        document.getElementById('mp-shuffle').addEventListener('click', (e) => {
            this.shuffle = !this.shuffle;
            e.currentTarget.classList.toggle('active', this.shuffle);
            this.spawnRipple(e);
        });
        document.getElementById('mp-repeat').addEventListener('click', (e) => {
            this.repeat = !this.repeat;
            e.currentTarget.classList.toggle('active', this.repeat);
            this.spawnRipple(e);
        });

        // Volume
        document.getElementById('mp-volume').addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
            this.audio.volume = this.volume;
            document.getElementById('mp-vol-pct').textContent = e.target.value + '%';
        });

        // Progress seek
        document.getElementById('mp-progress-wrap').addEventListener('click', (e) => {
            if (!this.audio.duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = pct * this.audio.duration;
        });

        // Playlist
        document.getElementById('mp-playlist-toggle').addEventListener('click', () => {
            document.getElementById('mp-playlist').classList.toggle('hidden');
            document.getElementById('mp-playlist-toggle').classList.toggle('open');
        });

        document.querySelectorAll('.mp-playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.index);
                this.loadTrack(idx);
                this.play();
            });
        });
    },

    togglePanel() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('music-panel');
        const toggle = document.getElementById('music-toggle');

        if (this.isOpen) {
            panel.classList.remove('music-panel-closed');
            panel.classList.add('music-panel-open');
            toggle.classList.add('active');
        } else {
            panel.classList.remove('music-panel-open');
            panel.classList.add('music-panel-closed');
            toggle.classList.remove('active');
        }
    },

    loadTrack(index) {
        this.currentTrack = index;
        const track = this.playlist[index];

        this.audio.src = track.url;
        this.audio.load();

        // Update UI
        document.getElementById('mp-track-name').textContent = track.title;
        document.getElementById('mp-track-artist').textContent = `${track.artist} · ${track.genre}`;
        document.getElementById('mp-progress-fill').style.width = '0%';
        document.getElementById('mp-progress-glow').style.left = '0%';
        document.getElementById('mp-time-current').textContent = '0:00';
        document.getElementById('mp-time-total').textContent = '0:00';

        // Update playlist active state
        document.querySelectorAll('.mp-playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        // Update accent color
        document.getElementById('music-panel').style.setProperty('--mp-accent', track.color);
    },

    async play() {
        if (!this.audio.src || this.audio.src === window.location.href) {
            this.loadTrack(this.currentTrack);
        }

        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton();
            this.startVisualizer();

            // Spin the vinyl & orbit
            document.getElementById('music-toggle').classList.add('playing');
            document.getElementById('mp-play-orbit').classList.add('active');
        } catch (e) {
            console.warn('Playback failed:', e.message);
        }
    },

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
        document.getElementById('music-toggle').classList.remove('playing');
        document.getElementById('mp-play-orbit').classList.remove('active');
    },

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    next() {
        if (this.repeat) {
            this.audio.currentTime = 0;
            this.play();
            return;
        }
        if (this.shuffle) {
            let r;
            do { r = Math.floor(Math.random() * this.playlist.length); } while (r === this.currentTrack && this.playlist.length > 1);
            this.currentTrack = r;
        } else {
            this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        }
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) this.play();
    },

    prev() {
        // If > 3s into track, restart. Otherwise go to previous.
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }
        this.currentTrack = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(this.currentTrack);
        if (this.isPlaying) this.play();
    },

    updatePlayButton() {
        const playIcon = document.querySelector('.mp-icon-play');
        const pauseIcon = document.querySelector('.mp-icon-pause');
        const playBtn = document.getElementById('mp-play');

        if (this.isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            playBtn.classList.add('playing');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            playBtn.classList.remove('playing');
        }
    },

    updateProgress() {
        if (!this.audio.duration) return;
        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        document.getElementById('mp-progress-fill').style.width = pct + '%';
        document.getElementById('mp-progress-glow').style.left = pct + '%';

        document.getElementById('mp-time-current').textContent = this.formatTime(this.audio.currentTime);
        document.getElementById('mp-time-total').textContent = this.formatTime(this.audio.duration);
    },

    formatTime(secs) {
        if (!secs || isNaN(secs)) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    },

    setLoading(loading) {
        const panel = document.getElementById('music-panel');
        if (loading) {
            panel.classList.add('loading');
        } else {
            panel.classList.remove('loading');
        }
    },

    startVisualizer() {
        const bars = document.querySelectorAll('.mp-bar');
        const draw = () => {
            if (!this.isPlaying) {
                bars.forEach(b => b.style.height = '3px');
                return;
            }
            const t = this.audio.currentTime || Date.now() / 1000;
            bars.forEach((bar, i) => {
                const wave1 = Math.sin(t * 3.2 + i * 0.35) * 0.5 + 0.5;
                const wave2 = Math.sin(t * 2.1 + i * 0.6) * 0.3 + 0.5;
                const wave3 = Math.sin(t * 5.5 + i * 0.2) * 0.2 + 0.5;
                const combined = (wave1 + wave2 + wave3) / 3;
                const height = Math.max(3, combined * 45 + Math.random() * 5);
                bar.style.height = height + 'px';
            });
            this.animFrame = requestAnimationFrame(draw);
        };
        draw();
    },

    // === STIMULATING EFFECTS ===

    createPanelParticles() {
        this.panelParticles = [];
        for (let i = 0; i < 30; i++) {
            this.panelParticles.push({
                x: Math.random() * 280,
                y: Math.random() * 500,
                size: 1 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: -0.15 - Math.random() * 0.3,
                alpha: 0.1 + Math.random() * 0.4,
                hue: Math.random() * 360,
                pulse: Math.random() * Math.PI * 2,
            });
        }
    },

    animatePanelEffects() {
        const canvas = document.getElementById('mp-particle-canvas');
        if (!canvas) { requestAnimationFrame(() => this.animatePanelEffects()); return; }
        const ctx = canvas.getContext('2d');

        const draw = () => {
            const panel = document.getElementById('music-panel');
            if (!panel) { requestAnimationFrame(draw); return; }
            const rect = panel.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (this.isOpen) {
                const intensity = this.isPlaying ? 1 : 0.3;
                this.panelParticles.forEach(p => {
                    p.pulse += 0.03;
                    p.x += p.speedX * intensity;
                    p.y += p.speedY * intensity;

                    // Wrap around
                    if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
                    if (p.x < -10) p.x = canvas.width + 10;
                    if (p.x > canvas.width + 10) p.x = -10;

                    const a = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse)) * intensity;
                    const track = this.playlist[this.currentTrack];
                    const color = track ? track.color : '#8b5cf6';

                    // Glow halo
                    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
                    grad.addColorStop(0, `${color}${Math.round(a * 180).toString(16).padStart(2, '0')}`);
                    grad.addColorStop(1, `${color}00`);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();

                    // Core
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255,255,255,${a * 0.8})`;
                    ctx.fill();
                });
            }

            // Floating notes
            if (this.isPlaying && this.isOpen && Math.random() < 0.04) {
                this.spawnFloatingNote();
            }

            requestAnimationFrame(draw);
        };
        draw();
    },

    spawnFloatingNote() {
        const container = document.getElementById('mp-notes-container');
        if (!container) return;
        const notes = ['♪', '♫', '♬', '🎵', '🎶', '🎷', '🎺', '✨'];
        const note = document.createElement('span');
        note.className = 'mp-floating-note';
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        note.style.left = (10 + Math.random() * 80) + '%';
        note.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        note.style.fontSize = (10 + Math.random() * 14) + 'px';
        container.appendChild(note);
        setTimeout(() => note.remove(), 4500);
    },

    spawnRipple(e) {
        const btn = e.currentTarget;
        const ripple = document.createElement('span');
        ripple.className = 'mp-ripple';
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
};

// Boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ZephyrMusic.init());
} else {
    ZephyrMusic.init();
}

window.ZephyrMusic = ZephyrMusic;
