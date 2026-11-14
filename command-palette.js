// ============================================
// Zephyr AI — Command Palette (Ctrl+K)
// Power-user quick-action overlay
// ============================================

const CommandPalette = {
    isOpen: false,
    _selectedIndex: 0,
    _filteredCommands: [],
    _el: null,

    COMMANDS: [
        // Navigation
        { id: 'chat',        icon: '💬', label: 'Go to Chat',                category: 'Navigate', action: () => window.ZephyrApp?.switchView('chat') },
        { id: 'upload',      icon: '📸', label: 'Analyze Outfit',            category: 'Navigate', action: () => window.ZephyrApp?.switchView('upload') },
        { id: 'trends',      icon: '🔥', label: 'Explore Trends',            category: 'Navigate', action: () => window.ZephyrApp?.switchView('trends') },
        { id: 'profile',     icon: '👤', label: 'My Profile',                category: 'Navigate', action: () => window.ZephyrApp?.switchView('profile') },
        { id: 'dna',         icon: '🧬', label: 'Style DNA',                 category: 'Navigate', action: () => window.ZephyrApp?.switchView('dna') },
        { id: 'fun',         icon: '🎮', label: 'Fun Zone / Zen Games',      category: 'Navigate', action: () => window.ZephyrApp?.switchView('fun') },
        { id: 'levelup',     icon: '📚', label: 'Level Up Guides',           category: 'Navigate', action: () => window.ZephyrApp?.switchView('levelup') },
        { id: 'avatar',      icon: '🗣️', label: 'Speaking Avatar',           category: 'Navigate', action: () => window.ZephyrApp?.switchView('avatar') },

        // Actions
        { id: 'new-chat',    icon: '✨', label: 'Start New Chat',            category: 'Actions',  action: () => window.ZephyrApp?.newChat() },
        { id: 'settings',    icon: '⚙️', label: 'Open Settings',             category: 'Actions',  action: () => document.getElementById('settings-btn')?.click() },
        { id: 'theme',       icon: '🎨', label: 'Change Theme',              category: 'Actions',  action: () => document.getElementById('theme-toggle')?.click() },

        // Chat Modes
        { id: 'mode-consult',icon: '💡', label: 'Mode: Style Consultant',    category: 'Modes',    action: () => { window.ZephyrApp?.switchView('chat'); if(window.ZephyrApp) window.ZephyrApp.state.chatMode = 'consultancy'; } },
        { id: 'mode-shop',   icon: '🛍️', label: 'Mode: Shopping Assistant',  category: 'Modes',    action: () => { window.ZephyrApp?.switchView('chat'); if(window.ZephyrApp) window.ZephyrApp.state.chatMode = 'shopping'; } },
        { id: 'mode-trend',  icon: '🔥', label: 'Mode: Trendsetter',         category: 'Modes',    action: () => { window.ZephyrApp?.switchView('chat'); if(window.ZephyrApp) window.ZephyrApp.state.chatMode = 'trendsetter'; } },

        // Zen Games — Direct Launch
        { id: 'game-smash',  icon: '🔨', label: 'Play Stress Smash',         category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('smash'), 400); } },
        { id: 'game-piano',  icon: '🎹', label: 'Play Zen Piano',            category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('piano'), 400); } },
        { id: 'game-smoke',  icon: '💨', label: 'Play Smoke Art',            category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('smoke'), 400); } },
        { id: 'game-bubbles',icon: '🫧', label: 'Play Bubble Pop',           category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('bubbles'), 400); } },
        { id: 'game-breathe',icon: '🎨', label: 'Play Color Breathe',        category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('breathe'), 400); } },
        { id: 'game-match',  icon: '🎯', label: 'Play Color Match',          category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('colormatch'), 400); } },
        { id: 'game-neon',   icon: '⚡', label: 'Play Neon Bounce',          category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('neonbounce'), 400); } },
        { id: 'game-orbit',  icon: '🔮', label: 'Play Orbit Spinner',        category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('orbit'), 400); } },
        { id: 'game-gravity',icon: '✨', label: 'Play Gravity Wells',        category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('gravity'), 400); } },
        { id: 'game-kaleido',icon: '🪩', label: 'Play Kaleidoscope',         category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('kaleidoscope'), 400); } },
        { id: 'game-ripple', icon: '🌊', label: 'Play Ripple Pool',          category: 'Games',    action: () => { window.ZephyrApp?.switchView('fun'); setTimeout(() => window.ZenGames?.launch('ripple'), 400); } },

        // Tools
        { id: 'voice-tog',   icon: '🔊', label: 'Toggle Voice Readout',      category: 'Tools',    action: () => { const t = document.getElementById('voice-toggle'); if(t) t.click(); } },
        { id: 'lang-switch', icon: '🌐', label: 'Switch Language (EN/HI)',    category: 'Tools',    action: () => { const l = localStorage.getItem('zephyr-lang') === 'hi' ? 'en' : 'hi'; localStorage.setItem('zephyr-lang', l); } },
        { id: 'export',      icon: '📦', label: 'Export My Data',             category: 'Tools',    action: () => CommandPalette._exportData() },

        // Danger
        { id: 'clear',       icon: '🗑️', label: 'Clear Chat History',        category: 'Danger',   action: () => { if(confirm('Clear all chats?')) { localStorage.removeItem('zephyr_conversations'); window.ZephyrApp?.newChat(); } } },
    ],

    init() {
        this._injectDOM();
        this._bindKeys();
    },

    _injectDOM() {
        const overlay = document.createElement('div');
        overlay.id = 'cmd-palette-overlay';
        overlay.className = 'cmd-overlay';
        overlay.innerHTML = `
            <div class="cmd-dialog" id="cmd-dialog">
                <div class="cmd-search-wrap">
                    <span class="cmd-search-icon">⌘</span>
                    <input type="text" class="cmd-search" id="cmd-search" 
                        placeholder="Type a command..." autocomplete="off" spellcheck="false">
                    <kbd class="cmd-esc">ESC</kbd>
                </div>
                <div class="cmd-results" id="cmd-results"></div>
                <div class="cmd-footer">
                    <span><kbd>↑↓</kbd> navigate</span>
                    <span><kbd>↵</kbd> select</span>
                    <span><kbd>esc</kbd> close</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this._el = overlay;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        const input = document.getElementById('cmd-search');
        input.addEventListener('input', () => this._onSearch(input.value));
        input.addEventListener('keydown', (e) => this._onKeydown(e));
    },

    _bindKeys() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    open() {
        this.isOpen = true;
        this._el.classList.add('active');
        const input = document.getElementById('cmd-search');
        input.value = '';
        input.focus();
        this._selectedIndex = 0;
        this._onSearch('');
    },

    close() {
        this.isOpen = false;
        this._el.classList.remove('active');
    },

    _onSearch(query) {
        const lower = query.toLowerCase().trim();
        this._filteredCommands = lower
            ? this.COMMANDS.filter(c =>
                c.label.toLowerCase().includes(lower) ||
                c.category.toLowerCase().includes(lower) ||
                c.id.includes(lower)
            )
            : [...this.COMMANDS];

        this._selectedIndex = 0;
        this._renderResults();
    },

    _renderResults() {
        const container = document.getElementById('cmd-results');
        if (this._filteredCommands.length === 0) {
            container.innerHTML = `<div class="cmd-empty">No commands found</div>`;
            return;
        }

        const groups = {};
        this._filteredCommands.forEach((cmd, idx) => {
            if (!groups[cmd.category]) groups[cmd.category] = [];
            groups[cmd.category].push({ ...cmd, _idx: idx });
        });

        let html = '';
        for (const [category, cmds] of Object.entries(groups)) {
            html += `<div class="cmd-group-label">${category}</div>`;
            cmds.forEach(cmd => {
                const active = cmd._idx === this._selectedIndex ? 'active' : '';
                html += `<div class="cmd-item ${active}" data-idx="${cmd._idx}">
                    <span class="cmd-item-icon">${cmd.icon}</span>
                    <span class="cmd-item-label">${cmd.label}</span>
                    <span class="cmd-item-category">${cmd.category}</span>
                </div>`;
            });
        }
        container.innerHTML = html;

        container.querySelectorAll('.cmd-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.idx);
                this._executeCommand(idx);
            });
            el.addEventListener('mouseenter', () => {
                this._selectedIndex = parseInt(el.dataset.idx);
                this._highlightActive();
            });
        });
    },

    _highlightActive() {
        document.querySelectorAll('.cmd-item').forEach(el => {
            const idx = parseInt(el.dataset.idx);
            el.classList.toggle('active', idx === this._selectedIndex);
        });
    },

    _onKeydown(e) {
        const count = this._filteredCommands.length;
        if (count === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this._selectedIndex = (this._selectedIndex + 1) % count;
            this._highlightActive();
            this._scrollToActive();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this._selectedIndex = (this._selectedIndex - 1 + count) % count;
            this._highlightActive();
            this._scrollToActive();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this._executeCommand(this._selectedIndex);
        }
    },

    _scrollToActive() {
        const active = document.querySelector('.cmd-item.active');
        if (active) active.scrollIntoView({ block: 'nearest' });
    },

    _executeCommand(idx) {
        const cmd = this._filteredCommands[idx];
        if (cmd) {
            this.close();
            requestAnimationFrame(() => cmd.action());
        }
    },

    _exportData() {
        try {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('zephyr')) {
                    try {
                        data[key] = JSON.parse(localStorage.getItem(key));
                    } catch { data[key] = localStorage.getItem(key); }
                }
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zephyr-data-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('[CommandPalette] Export failed:', e);
        }
    }
};

window.CommandPalette = CommandPalette;
