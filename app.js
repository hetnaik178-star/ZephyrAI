/**
 * Zephyr AI - Main Application
 * Orchestrates all modules and handles UI interactions
 */

const ZephyrApp = {
    // Application state
    state: {
        currentView: 'chat',
        isTyping: false,
        pendingImage: null,
        currentSessionId: null,
        chatMode: 'consultancy'
    },

    modeIcons: { consultancy: '💡', shopping: '🛍️', trendsetter: '🔥' },

    /**
     * Initialize the application
     */
    init() {
        console.log('⚡ Initializing Zephyr AI...');

        // Initialize all modules
        const isConfigured = ZephyrAI.init();
        ZephyrProfile.initForm();
        ZephyrImageAnalyzer.init();
        ZephyrTrendExplorer.init();

        // Setup UI event listeners
        this.setupEventListeners();
        this.setupKeyboardShortcuts();

        // Command Palette (Ctrl+K)
        if (typeof CommandPalette !== 'undefined') CommandPalette.init();

        // Outro video handler
        this.setupOutro();

        // Update API status with region info
        this.updateApiStatus(isConfigured, ZephyrAI.config.provider);
        this.updateRegionDisplay();

        // Load recent chats
        this.renderRecentChats();
        this.updateMemoryWelcome();
        this.renderMemoryEditor();
        this.renderWardrobeVault();
        this.renderStyleDNA();

        // Initialize particles
        this.initParticles();

        // Initialize daily tip
        this.initDailyTip();

        // Check if first time user
        if (!ZephyrProfile.hasBasicInfo() && !isConfigured) {
            this.showWelcomeHint();
        } else if (isConfigured) {
            this.showRegionHint();
        }

        // Auto-resize textarea
        this.setupTextareaAutoResize();

        // Intro video splash → then loading screen
        this.runIntroSplash();

        console.log('✅ Zephyr AI ready!');
    },

    /**
     * Handle intro video splash
     */
    runIntroSplash() {
        const splash = document.getElementById('intro-splash');
        const video = document.getElementById('intro-video');
        const skipBtn = document.getElementById('intro-skip');

        const dismissSplash = () => {
            if (!splash || splash.classList.contains('fade-out')) return;
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.classList.add('hidden');
                splash.style.display = 'none';
                this.runBootSequence();
            }, 800);
        };

        // If no video source loads, skip immediately
        if (!splash || !video) {
            if (splash) { splash.style.display = 'none'; }
            this.runBootSequence();
            return;
        }

        // Video error (file not found) → skip splash
        video.addEventListener('error', () => dismissSplash(), { once: true });
        // Also check source errors
        video.querySelectorAll('source').forEach(src => {
            src.addEventListener('error', () => {
                if (video.networkState === 3) dismissSplash();
            });
        });

        // Video ended naturally → fade out
        video.addEventListener('ended', () => dismissSplash(), { once: true });

        // Play intro sound with video
        const introAudio = document.getElementById('intro-audio');
        if (introAudio) {
            video.addEventListener('play', () => {
                introAudio.currentTime = 0;
                introAudio.volume = 0.6;
                introAudio.play().catch(() => {});
            }, { once: true });
        }

        // Skip button
        if (skipBtn) skipBtn.addEventListener('click', () => dismissSplash());

        // Safety timeout: if video stalls, dismiss after 10s
        setTimeout(() => dismissSplash(), 10000);
    },

    /**
     * Outro video handler
     */
    setupOutro() {
        const btn = document.getElementById('btn-outro');
        const splash = document.getElementById('outro-splash');
        const video = document.getElementById('outro-video');
        const audio = document.getElementById('outro-audio');
        const closeBtn = document.getElementById('outro-close');

        if (!btn || !splash) return;

        const dismissOutro = () => {
            splash.classList.add('fade-out');
            if (audio) { audio.pause(); audio.currentTime = 0; }
            if (video) { video.pause(); video.currentTime = 0; }
            setTimeout(() => {
                splash.classList.add('hidden');
                splash.classList.remove('fade-out');
                // Reset text animations
                const overlay = splash.querySelector('.outro-text-overlay');
                if (overlay) {
                    overlay.style.animation = 'none';
                    overlay.offsetHeight;
                    overlay.style.animation = '';
                }
                splash.querySelectorAll('.outro-tagline,.outro-brand,.outro-sub').forEach(el => {
                    el.style.animation = 'none';
                    el.offsetHeight;
                    el.style.animation = '';
                });
            }, 800);
        };

        btn.addEventListener('click', () => {
            splash.classList.remove('hidden', 'fade-out');
            if (video) {
                video.currentTime = 0;
                video.play().catch(() => {});
            }
            if (audio) {
                audio.currentTime = 0;
                audio.volume = 0.7;
                audio.play().catch(() => {});
            }
            // Auto-dismiss when video ends
            if (video) {
                video.addEventListener('ended', () => dismissOutro(), { once: true });
            }
            // Safety timeout
            setTimeout(() => dismissOutro(), 12000);
        });

        if (closeBtn) closeBtn.addEventListener('click', () => dismissOutro());
    },

    /**
     * Multi-phase boot sequence with animated loading
     */
    runBootSequence() {
        const status = document.getElementById('loader-status');
        const phases = [
            { text: 'Initializing neural engine...', delay: 0 },
            { text: 'Loading style models...', delay: 800 },
            { text: 'Calibrating fashion sense...', delay: 1600 },
            { text: 'Preparing your experience...', delay: 2400 },
            { text: 'Almost ready...', delay: 3000 },
        ];

        // Spawn loader particles
        const loaderParticles = document.getElementById('loader-particles');
        if (loaderParticles) {
            for (let i = 0; i < 30; i++) {
                const p = document.createElement('div');
                p.className = 'loader-particle';
                const size = 2 + Math.random() * 4;
                const x = Math.random() * 100;
                const duration = 3 + Math.random() * 4;
                const delay = Math.random() * 3;
                p.style.cssText = `
                    left: ${x}%; bottom: -10px;
                    width: ${size}px; height: ${size}px;
                    animation: loader-particle-rise ${duration}s ease-in-out ${delay}s infinite;
                    opacity: ${0.2 + Math.random() * 0.5};
                    background: ${['#8b5cf6', '#a78bfa', '#c4b5fd', '#fcd34d', '#06b6d4', '#fff'][Math.floor(Math.random() * 6)]};
                `;
                loaderParticles.appendChild(p);
            }
        }

        // Animate through phases
        phases.forEach(phase => {
            setTimeout(() => {
                if (status) {
                    status.style.opacity = '0';
                    status.style.transform = 'translateY(-5px)';
                    setTimeout(() => {
                        status.textContent = phase.text;
                        status.style.opacity = '1';
                        status.style.transform = 'translateY(0)';
                    }, 200);
                }
            }, phase.delay);
        });

        // Smooth exit
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transform = 'scale(1.05)';
                loadingScreen.style.filter = 'blur(10px)';
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    loadingScreen.style.display = 'none';
                }, 600);
            }
        }, 3500);
    },

    /**
     * Initialize floating particles effect
     */
    initParticles() {
        const container = document.getElementById('welcome-particles');
        if (!container) return;

        const colors = ['var(--primary-400)', 'var(--accent-400)', 'var(--primary-300)', '#fff'];

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${2 + Math.random() * 4}px;
                height: ${2 + Math.random() * 4}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                animation-delay: ${Math.random() * 4}s;
                animation-duration: ${3 + Math.random() * 3}s;
            `;
            container.appendChild(particle);
        }
    },

    /**
     * Style tips collection
     */
    styleTips: [
        "Layer neutral tones with one bold accent piece for effortless elegance.",
        "Invest in quality basics - they're the foundation of every great outfit.",
        "When in doubt, monochromatic looks always appear more polished.",
        "The rule of thirds: divide your outfit into proportional sections.",
        "Match your metals - keep jewelry consistent for a cohesive look.",
        "Cuff your sleeves or pants for an instant casual-chic upgrade.",
        "A structured bag can elevate even the most casual outfit.",
        "When mixing prints, vary the scale for visual harmony.",
        "Roll your shirt sleeves twice for the perfect relaxed look.",
        "Tuck in the front of your shirt for a more intentional silhouette.",
        "Darker colors recede, lighter colors advance - use this for flattering fits.",
        "One statement piece per outfit - let it be the star.",
        "Texture adds interest - try mixing matte and shiny fabrics.",
        "The 3-color rule: limit your outfit palette for cohesion.",
        "Tailoring is the secret weapon of the well-dressed.",
        "Match your bag to your shoes for classic coordination.",
        "Vertical stripes elongate, horizontal stripes widen.",
        "A belt can transform an outfit from casual to polished.",
        "Steam your clothes - wrinkles are the enemy of style.",
        "When layering, keep base layers fitted and outer layers loose."
    ],

    /**
     * Initialize daily tip feature
     */
    initDailyTip() {
        const { $ } = ZephyrUtils.dom;

        // Show a random tip on load
        this.showRandomTip();

        // Setup new tip button
        $('#btn-new-tip')?.addEventListener('click', () => {
            this.showRandomTip(true);
        });
    },

    /**
     * Show a random style tip
     */
    showRandomTip(animate = false) {
        const { $ } = ZephyrUtils.dom;
        const tipContent = $('#tip-content');
        if (!tipContent) return;

        const randomTip = this.styleTips[Math.floor(Math.random() * this.styleTips.length)];

        if (animate) {
            tipContent.style.opacity = '0';
            tipContent.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                tipContent.textContent = randomTip;
                tipContent.style.opacity = '1';
                tipContent.style.transform = 'translateY(0)';
            }, 200);
        } else {
            tipContent.textContent = randomTip;
        }
    },

    /**
     * Make the welcome screen reflect Zephyr's learned style memory.
     */
    updateMemoryWelcome() {
        if (!ZephyrAI.getStyleMemory) return;

        const memory = ZephyrAI.getStyleMemory();
        const signal = memory.styleSignals?.[0];
        const lastSeen = ZephyrAI.formatMemoryDate ? ZephyrAI.formatMemoryDate(memory.lastInteractionAt) : '';

        const subtitle = document.querySelector('#welcome-screen .welcome-subtitle');
        if (!signal) {
            if (subtitle) {
                subtitle.textContent = 'Your AI-powered fashion companion. I can help you discover your style, analyze outfits, and stay on top of the latest trends - all tailored to your preferences and budget.';
            }
            return;
        }

        if (subtitle) {
            const timeNote = lastSeen ? ` Since you were here ${lastSeen},` : ' From what I remember,';
            subtitle.textContent = `${timeNote} you seem to prefer ${signal.replace(/^prefers\s+/i, '')}. I will keep recommendations personal, practical, and presentation-ready.`;
        }
    },

    /**
     * Setup main event listeners
     */
    setupEventListeners() {
        const { $, $$ } = ZephyrUtils.dom;

        // Navigation
        $$('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                if (view) this.switchView(view);
            });
        });

        // New chat button
        $('#btn-new-chat')?.addEventListener('click', () => this.newChat());
        $('#btn-presentation-demo')?.addEventListener('click', () => this.loadPresentationDemo());

        // Chat input
        const chatInput = $('#chat-input');
        const sendBtn = $('#btn-send');

        chatInput?.addEventListener('input', () => {
            sendBtn.disabled = !chatInput.value.trim();
        });

        chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (chatInput.value.trim()) {
                    this.sendMessage();
                }
            }
        });

        // Character counter
        chatInput?.addEventListener('input', () => {
            this.updateCharCounter(chatInput.value.length);
        });

        sendBtn?.addEventListener('click', () => this.sendMessage());

        // Mode picker
        $('#btn-mode')?.addEventListener('click', (e) => {
            e.stopPropagation();
            $('#mode-picker')?.classList.toggle('active');
        });
        $$('.mode-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const mode = opt.dataset.mode;
                this.state.chatMode = mode;
                $$('.mode-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                $('#mode-icon').textContent = this.modeIcons[mode] || '💡';
                $('#mode-picker')?.classList.remove('active');
                const placeholders = {
                    consultancy: 'Ask for style tips, outfit advice...',
                    shopping: 'Find products, deals & shopping links...',
                    trendsetter: 'What\'s trending in fashion right now...'
                };
                $('#chat-input').placeholder = placeholders[mode] || '';
                ZephyrUtils.toast.success(`Switched to ${opt.querySelector('.mode-opt-name').textContent}`);
            });
        });
        document.addEventListener('click', () => $('#mode-picker')?.classList.remove('active'));

        // Quick action cards
        $$('.quick-action-card').forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.dataset.prompt;
                if (prompt) {
                    $('#chat-input').value = prompt;
                    $('#btn-send').disabled = false;
                    $('#chat-input').focus();
                }
            });
        });

        // Mood chips for quick outfit suggestions
        $$('.mood-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const mood = chip.dataset.mood;
                if (!mood) return;

                // Toggle selection
                chip.classList.toggle('selected');

                // Build prompt based on selected moods
                const selectedMoods = Array.from($$('.mood-chip.selected')).map(c => c.textContent.trim());

                if (selectedMoods.length > 0) {
                    const prompt = `Suggest me a stylish outfit for ${selectedMoods.join(' and ')} vibe. Include specific items, colors, and accessories.`;
                    $('#chat-input').value = prompt;
                    $('#btn-send').disabled = false;
                    $('#chat-input').focus();
                } else {
                    $('#chat-input').value = '';
                    $('#btn-send').disabled = true;
                }
            });
        });

        // Outfit intent chips for image analysis
        $$('.intent-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                $$('.intent-chip').forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
            });
        });

        // Emoji picker
        $('#btn-emoji')?.addEventListener('click', (e) => {
            e.stopPropagation();
            $('#emoji-picker')?.classList.toggle('active');
        });

        // Emoji selection
        $$('#emoji-picker button').forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji;
                const input = $('#chat-input');
                input.value += emoji;
                input.focus();
                $('#emoji-picker')?.classList.remove('active');
                $('#btn-send').disabled = !input.value.trim();
            });
        });

        // Close emoji picker on outside click
        document.addEventListener('click', () => {
            $('#emoji-picker')?.classList.remove('active');
        });

        // Settings modal
        $('#btn-settings')?.addEventListener('click', () => this.openSettings());
        $('#link-setup-api')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openSettings();
        });

        $('#modal-close')?.addEventListener('click', () => this.closeSettings());
        $('#btn-cancel-settings')?.addEventListener('click', () => this.closeSettings());
        $('#btn-save-settings')?.addEventListener('click', () => this.saveSettings());
        $('#modal-backdrop')?.addEventListener('click', () => this.closeSettings());

        // Settings tabs
        $$('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                $$('.settings-tab').forEach(t => t.classList.remove('active'));
                $$('.settings-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const panel = $(`#tab-${tab.dataset.tab}`);
                if (panel) panel.classList.add('active');
            });
        });

        // Voice toggle
        $('#setting-voice')?.addEventListener('change', (e) => {
            this.voiceEnabled = e.target.checked;
            localStorage.setItem('zephyr-voice', e.target.checked ? '1' : '0');
            ZephyrUtils.toast.success(e.target.checked ? '🔊 Voice responses enabled' : '🔇 Voice responses disabled');
        });
        // Restore voice setting
        this.voiceEnabled = localStorage.getItem('zephyr-voice') === '1';
        if ($('#setting-voice')) $('#setting-voice').checked = this.voiceEnabled;

        // Language switch
        $('#setting-language')?.addEventListener('change', (e) => {
            const lang = e.target.value;
            localStorage.setItem('zephyr-lang', lang);
            ZephyrAI.userContext.language = lang;
            ZephyrUtils.toast.success(lang === 'hi' ? '🌐 भाषा हिंदी में बदली गई' : '🌐 Language set to English');
        });
        const savedLang = localStorage.getItem('zephyr-lang') || 'en';
        if ($('#setting-language')) $('#setting-language').value = savedLang;
        if (typeof ZephyrAI !== 'undefined') ZephyrAI.userContext.language = savedLang;

        // Clear all chat history
        $('#btn-clear-all')?.addEventListener('click', () => {
            if (confirm('Clear all chat history?')) {
                ZephyrAI.conversationHistory = [];
                ZephyrUtils.storage.set('conversation', []);
                this.newChat();
                ZephyrUtils.toast.success('🗑️ Chat history cleared');
            }
        });

        // Update theme name in settings
        const tn = $('#setting-theme-name');
        if (tn && typeof ZephyrThemes !== 'undefined') {
            tn.textContent = ZephyrThemes.themes[ZephyrThemes.current]?.name || 'Cosmic Purple';
        }

        // Profile tabs
        $$('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                if (tabId) this.switchTab(tabId);
            });
        });

        // Profile form checkboxes
        $$('.form-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const input = checkbox.querySelector('input');
                if (input && e.target !== input) {
                    input.checked = !input.checked;
                    checkbox.classList.toggle('selected', input.checked);
                }
            });
        });

        // Save profile
        $('#btn-save-profile')?.addEventListener('click', () => this.saveProfile());
        $('#btn-export-profile')?.addEventListener('click', () => this.exportProfileBundle());
        $('#btn-clear-memory')?.addEventListener('click', () => this.clearStyleMemory());
        $('#btn-add-wardrobe')?.addEventListener('click', () => this.addWardrobeItemFromForm());
        $('#btn-dna-decision')?.addEventListener('click', () => this.askStyleDNADecision());

        // Fun Zone
        this.setupFunZone();

        // Mobile menu toggle
        $('#menu-toggle')?.addEventListener('click', () => {
            $('#sidebar')?.classList.toggle('open');
        });

        // Close sidebar on view switch (mobile)
        if (window.innerWidth <= 768) {
            $$('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    $('#sidebar')?.classList.remove('open');
                });
            });
        }
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+N: New chat
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.newChat();
            }

            // Ctrl+U: Upload image
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                this.switchView('upload');
            }

            // Ctrl+,: Settings
            if (e.ctrlKey && e.key === ',') {
                e.preventDefault();
                this.openSettings();
            }

            // Escape: Close modal
            if (e.key === 'Escape') {
                this.closeSettings();
            }
        });
    },

    /**
     * Setup textarea auto-resize
     */
    setupTextareaAutoResize() {
        const textarea = document.getElementById('chat-input');
        if (!textarea) return;

        const resize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
        };

        textarea.addEventListener('input', resize);
    },

    /**
     * Switch between views
     */
    switchView(viewName) {
        const { $, $$, show, hide } = ZephyrUtils.dom;

        // Update nav items
        $$('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Animate view transition
        ['chat', 'upload', 'trends', 'profile', 'dna', 'fun', 'levelup', 'avatar'].forEach(view => {
            const el = $(`#view-${view}`);
            if (el) {
                if (view === viewName) {
                    el.classList.remove('hidden');
                    el.style.animation = 'viewSlideIn 0.4s ease forwards';
                } else {
                    el.classList.add('hidden');
                }
            }
        });

        // Update header title with animation
        const titles = {
            chat: 'Chat with Zephyr',
            upload: 'Analyze Outfit',
            trends: 'Explore Trends',
            profile: 'My Profile',
            dna: 'Style DNA',
            fun: 'Fun Zone',
            levelup: 'Level Up',
            avatar: 'Avatar'
        };

        const headerTitle = $('#header-title');
        headerTitle.style.animation = 'none';
        headerTitle.offsetHeight; // Trigger reflow
        headerTitle.textContent = titles[viewName] || 'Zephyr AI';
        headerTitle.style.animation = 'fadeInUp 0.3s ease';

        this.state.currentView = viewName;

        // Initialize profile form when switching to profile
        if (viewName === 'profile') {
            ZephyrProfile.initForm();
            this.renderMemoryEditor();
            this.renderWardrobeVault();
        }

        if (viewName === 'dna') {
            this.renderStyleDNA();
        }

        // Hide global particles on avatar view
        const fxCanvas = document.getElementById('fx-canvas');
        if (fxCanvas) fxCanvas.style.display = viewName === 'avatar' ? 'none' : '';

        if (viewName === 'avatar' && typeof AvatarEngine !== 'undefined') {
            AvatarEngine.init();
            AvatarEngine.start();
        }

        if (viewName === 'fun' && typeof ZenGames !== 'undefined') {
            ZenGames.init();
        }

        // Clear mood chip selections when leaving chat
        if (viewName !== 'chat') {
            $$('.mood-chip').forEach(chip => chip.classList.remove('selected'));
        }
    },

    /**
     * Switch profile tabs
     */
    switchTab(tabId) {
        const { $$, show, hide } = ZephyrUtils.dom;

        $$('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        $$('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });

        if (tabId === 'memory') this.renderMemoryEditor();
        if (tabId === 'wardrobe') this.renderWardrobeVault();
    },

    /**
     * Send message
     */
    async sendMessage() {
        const { $, $$ } = ZephyrUtils.dom;

        const input = $('#chat-input');
        const message = input.value.trim();

        if (!message && !this.state.pendingImage) return;

        if (!ZephyrAI.isConfigured()) {
            ZephyrUtils.toast.warning('Please configure your API key first');
            this.openSettings();
            return;
        }

        // Clear input and mood chips
        input.value = '';
        input.style.height = 'auto';
        $('#btn-send').disabled = true;
        $$('.mood-chip').forEach(chip => chip.classList.remove('selected'));

        // Hide welcome screen
        const welcome = $('#welcome-screen');
        if (welcome) welcome.style.display = 'none';

        // Add user message
        const displayMessage = this.state.pendingImage
            ? `📸 [Image attached]\n\n${message || 'Please analyze this image.'}`
            : message;
        this.addMessage('user', displayMessage);

        // Show typing indicator and update status
        this.showTypingIndicator();
        this.updateAIStatus('thinking', 'Thinking...');

        try {
            let response;

            if (this.state.pendingImage) {
                // Send with image
                response = await ZephyrAI.chat(message || 'Please analyze this outfit and give me your thoughts.', {
                    imageData: this.state.pendingImage,
                    onStream: (chunk, full) => this.updateStreamingMessage(full)
                });
                this.state.pendingImage = null;
            } else {
                // Regular chat
                response = await ZephyrAI.chat(message, {
                    useGrounding: message.toLowerCase().includes('trend') ||
                        message.toLowerCase().includes('trending') ||
                        message.toLowerCase().includes('popular'),
                    onStream: (chunk, full) => this.updateStreamingMessage(full)
                });
            }

            // Finalize streaming message with smart suggestions
            this.finalizeStreamingMessage(response, message);
            this.updateAIStatus('ready');

            // Voice readout
            if (this.voiceEnabled && response) this.speakResponse(response);

        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.updateAIStatus('error', 'Error');
            this.addMessage('assistant', `I'm sorry, I encountered an error: ${error.message}\n\nPlease check your API key and try again.`);
            ZephyrUtils.toast.error(error.message);

            // Reset status after delay
            setTimeout(() => this.updateAIStatus('ready'), 3000);
        }
    },

    /**
     * Speak AI response aloud using Web Speech API
     */
    speakResponse(text, btn) {
        if (!('speechSynthesis' in window)) return;
        // If already speaking, stop
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            document.querySelectorAll('.voice-btn.speaking').forEach(b => b.classList.remove('speaking'));
            return;
        }
        const clean = text.replace(/[#*_`\[\]()>|~\-]/g, '').replace(/\n+/g, '. ').replace(/https?:\/\/\S+/g, '').substring(0, 800);
        const utterance = new SpeechSynthesisUtterance(clean);
        const lang = localStorage.getItem('zephyr-lang') || 'en';
        utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const pref = voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'))
            || voices.find(v => v.lang.includes(lang === 'hi' ? 'hi' : 'en'));
        if (pref) utterance.voice = pref;
        if (btn) {
            btn.classList.add('speaking');
            utterance.onend = () => btn.classList.remove('speaking');
            utterance.onerror = () => btn.classList.remove('speaking');
        }
        window.speechSynthesis.speak(utterance);
    },

    /**
     * Attach image for analysis
     */
    async attachImage(file) {
        const validation = ZephyrUtils.validateImageFile(file);
        if (!validation.valid) {
            ZephyrUtils.toast.error(validation.error);
            return;
        }

        try {
            const base64 = await ZephyrUtils.fileToBase64(file);
            this.state.pendingImage = base64;

            ZephyrUtils.toast.success('Image attached! Type a message or send to analyze.');

            const input = document.getElementById('chat-input');
            input.placeholder = '📸 Image attached. Ask about this outfit...';
            input.focus();
            document.getElementById('btn-send').disabled = false;

        } catch (error) {
            ZephyrUtils.toast.error('Failed to attach image');
        }
    },

    /**
     * Add message to chat
     */
    addMessage(role, content) {
        const { $, create } = ZephyrUtils.dom;
        const container = $('#messages-inner');

        if (!container) return;

        const isUser = role === 'user';
        const time = ZephyrUtils.format.time(new Date());

        const message = create('div', { class: `message ${role}` }, [
            create('div', { class: 'message-avatar' }, [isUser ? '👤' : '⚡']),
            create('div', { class: 'message-content' }, [
                create('div', { class: 'message-header' }, [
                    create('span', { class: 'message-author' }, [isUser ? 'You' : 'Zephyr']),
                    create('span', { class: 'message-time' }, [time])
                ]),
                create('div', { class: 'message-body' })
            ])
        ]);

        const body = message.querySelector('.message-body');
        if (isUser) {
            body.innerHTML = content.replace(/\n/g, '<br>');
        } else {
            body.innerHTML = ZephyrUtils.markdown.toHtml(content);
            const voiceBtn = document.createElement('button');
            voiceBtn.className = 'voice-btn';
            voiceBtn.title = 'Read aloud';
            voiceBtn.textContent = '🔊';
            voiceBtn.addEventListener('click', () => this.speakResponse(content, voiceBtn));
            body.appendChild(voiceBtn);
        }

        container.appendChild(message);
        this.scrollToBottom();
    },

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const { $, create } = ZephyrUtils.dom;
        const container = $('#messages-inner');

        this.hideTypingIndicator();

        const typing = create('div', { class: 'message assistant', id: 'typing-message' }, [
            create('div', { class: 'message-avatar' }, ['⚡']),
            create('div', { class: 'message-content' }, [
                create('div', { class: 'message-header' }, [
                    create('span', { class: 'message-author' }, ['Zephyr']),
                    create('span', { class: 'message-time' }, ['typing...'])
                ]),
                create('div', { class: 'message-body' }, [
                    create('div', { class: 'typing-indicator' }, [
                        create('span', { class: 'typing-dot' }),
                        create('span', { class: 'typing-dot' }),
                        create('span', { class: 'typing-dot' })
                    ])
                ])
            ])
        ]);

        container.appendChild(typing);
        this.scrollToBottom();
        this.state.isTyping = true;
    },

    /**
     * Update streaming message
     */
    updateStreamingMessage(content) {
        const typingMessage = document.getElementById('typing-message');
        if (!typingMessage) {
            this.showTypingIndicator();
            return;
        }

        const body = typingMessage.querySelector('.message-body');
        body.innerHTML = ZephyrUtils.markdown.toHtml(content);

        // Update time
        const timeEl = typingMessage.querySelector('.message-time');
        if (timeEl) timeEl.textContent = 'writing...';

        this.scrollToBottom();
    },

    /**
     * Finalize streaming message
     */
    finalizeStreamingMessage(content, userMessage = '') {
        const typingMessage = document.getElementById('typing-message');
        if (typingMessage) {
            typingMessage.removeAttribute('id');

            const body = typingMessage.querySelector('.message-body');
            body.innerHTML = ZephyrUtils.markdown.toHtml(content);

            const timeEl = typingMessage.querySelector('.message-time');
            if (timeEl) timeEl.textContent = ZephyrUtils.format.time(new Date());

            // Fetch and display associative fashion images
            if (typeof ZephyrImages !== 'undefined') {
                this.appendFashionImages(body, content, userMessage);
            }
        }

        this.state.isTyping = false;
        this.scrollToBottom();
    },

    /**
     * Fetch and append fashion images to a message
     */
    async appendFashionImages(messageBody, responseText, userMessage) {
        try {
            const images = await ZephyrImages.fetchForResponse(responseText, userMessage);
            if (images.length > 0) {
                const gallery = ZephyrImages.createGallery(images);
                if (gallery) {
                    messageBody.appendChild(gallery);
                    this.scrollToBottom();
                }
            }
        } catch (err) {
            console.warn('Fashion images fetch failed (non-critical):', err);
        }
    },

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const typing = document.getElementById('typing-message');
        if (typing) typing.remove();
        this.state.isTyping = false;
    },

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        const messages = document.getElementById('chat-messages');
        if (messages) {
            messages.scrollTop = messages.scrollHeight;
        }
    },

    /**
     * Save current chat session
     */
    saveCurrentSession() {
        const history = ZephyrAI.conversationHistory;
        if (!history || history.length === 0) return;

        let sessions = ZephyrUtils.storage.get('saved_chats', []);

        // If we have an active session ID, update it
        if (this.state.currentSessionId) {
            const index = sessions.findIndex(s => s.id === this.state.currentSessionId);
            if (index !== -1) {
                sessions[index].messages = history;
                sessions[index].timestamp = new Date().toISOString();
                // Move to top
                const updatedSession = sessions.splice(index, 1)[0];
                sessions.unshift(updatedSession);

                ZephyrUtils.storage.set('saved_chats', sessions);
                this.renderRecentChats();
                return;
            }
        }

        // Create new session
        const firstUserMsg = history.find(m => m.role === 'user');
        const title = firstUserMsg ?
            (firstUserMsg.content.length > 30 ? firstUserMsg.content.substring(0, 30) + '...' : firstUserMsg.content) :
            'New Conversation';

        const newId = Date.now().toString();
        const session = {
            id: newId,
            title: title,
            timestamp: new Date().toISOString(),
            messages: history
        };

        this.state.currentSessionId = newId;
        sessions.unshift(session);

        // Limit to 20 recent chats
        if (sessions.length > 20) {
            sessions = sessions.slice(0, 20);
        }

        ZephyrUtils.storage.set('saved_chats', sessions);
        this.renderRecentChats();
    },

    /**
     * Render recent chats sidebar
     */
    renderRecentChats() {
        const { $, create } = ZephyrUtils.dom;
        const container = $('#chat-history');
        if (!container) return;

        const sessions = ZephyrUtils.storage.get('saved_chats', []);
        container.innerHTML = '';

        if (sessions.length === 0) {
            container.innerHTML = `
                <p style="padding: var(--space-3); color: var(--text-tertiary); font-size: var(--text-sm);">
                    No recent chats yet
                </p>`;
            return;
        }

        sessions.forEach(session => {
            const item = create('div', { class: `history-item ${session.id === this.state.currentSessionId ? 'active' : ''}` });

            const content = create('div', { class: 'history-item-content' }, [
                create('div', { class: 'history-title' }, [session.title]),
                create('div', { class: 'history-date' }, [ZephyrUtils.format.date(session.timestamp)])
            ]);

            const deleteBtn = create('button', {
                class: 'history-delete-btn',
                title: 'Delete chat'
            });
            deleteBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>`;

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSession(session.id);
            });

            item.appendChild(content);
            item.appendChild(deleteBtn);
            item.addEventListener('click', () => this.loadSession(session));
            container.appendChild(item);
        });
    },

    /**
     * Delete a chat session
     */
    deleteSession(sessionId) {
        let sessions = ZephyrUtils.storage.get('saved_chats', []);
        sessions = sessions.filter(s => s.id !== sessionId);
        ZephyrUtils.storage.set('saved_chats', sessions);

        // If deleting current session, start fresh
        if (this.state.currentSessionId === sessionId) {
            this.state.currentSessionId = null;
            this.newChat();
        }

        this.renderRecentChats();
        ZephyrUtils.toast.success('Chat deleted');
    },

    /**
     * Load a saved session
     */
    loadSession(session) {
        const { $ } = ZephyrUtils.dom;

        // Save current if needed (and different from the one we are loading)
        if (ZephyrAI.conversationHistory.length > 0 && this.state.currentSessionId !== session.id) {
            this.saveCurrentSession();
        }

        // Set current session ID
        this.state.currentSessionId = session.id;

        // Set history in AI engine
        ZephyrAI.setHistory(session.messages);

        // Clear UI
        const container = $('#messages-inner');
        if (container) container.innerHTML = '';

        // Re-render messages
        session.messages.forEach(msg => {
            if (msg.role !== 'system') {
                this.addMessage(msg.role === 'model' ? 'assistant' : msg.role, msg.content);
            }
        });

        // Hide welcome screen if visible
        const welcome = $('#welcome-screen');
        if (welcome) welcome.style.display = 'none';

        this.switchView('chat');
        ZephyrUtils.toast.info('Chat loaded');

        // Update sidebar active state
        this.renderRecentChats();
    },

    /**
     * Start new chat
     */
    newChat() {
        const { $ } = ZephyrUtils.dom;

        // Save current session before clearing
        this.saveCurrentSession();

        // Reset session ID
        this.state.currentSessionId = null;

        // Clear AI history
        ZephyrAI.clearHistory();

        // Clear messages
        const container = $('#messages-inner');
        if (container) {
            container.innerHTML = '';
        }

        // Show welcome screen
        container.innerHTML = `
      <div class="welcome-screen" id="welcome-screen">
        <div class="welcome-icon">⚡</div>
        <h2 class="welcome-title">Hello, I'm Zephyr</h2>
        <p class="welcome-subtitle">
          Your AI-powered fashion companion. I can help you discover your style, analyze outfits, 
          and stay on top of the latest trends — all tailored to your preferences and budget.
        </p>
        <div class="quick-actions">
          <button class="quick-action-card" data-prompt="Help me build a capsule wardrobe for spring">
            <div class="quick-action-icon">👔</div>
            <div class="quick-action-title">Build a Capsule Wardrobe</div>
            <div class="quick-action-desc">Create a versatile, minimal wardrobe</div>
          </button>
          <button class="quick-action-card" data-prompt="What colors suit my skin tone?">
            <div class="quick-action-icon">🎨</div>
            <div class="quick-action-title">Find My Colors</div>
            <div class="quick-action-desc">Discover your perfect color palette</div>
          </button>
          <button class="quick-action-card" data-prompt="What's trending in streetwear right now?">
            <div class="quick-action-icon">🔥</div>
            <div class="quick-action-title">Trending Now</div>
            <div class="quick-action-desc">Explore current fashion trends</div>
          </button>
          <button class="quick-action-card" data-prompt="Help me style an outfit for a job interview">
            <div class="quick-action-icon">💼</div>
            <div class="quick-action-title">Style for Occasion</div>
            <div class="quick-action-desc">Get outfit ideas for any event</div>
          </button>
        </div>
      </div>
    `;

        this.updateMemoryWelcome();

        // Re-attach quick action listeners
        document.querySelectorAll('.quick-action-card').forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.dataset.prompt;
                if (prompt) {
                    $('#chat-input').value = prompt;
                    $('#btn-send').disabled = false;
                    $('#chat-input').focus();
                }
            });
        });

        // Clear conversation history
        ZephyrAI.clearHistory();

        // Switch to chat view
        this.switchView('chat');

        // Reset input
        $('#chat-input').value = '';
        $('#chat-input').placeholder = 'Ask Zephyr about fashion, style, or trends...';
        $('#btn-send').disabled = true;
        this.state.pendingImage = null;

        ZephyrUtils.toast.info('Started new conversation');
    },

    /**
     * Open settings modal
     */
    openSettings() {
        const { $ } = ZephyrUtils.dom;

        // Provider info for API key hints
        this.providerLinks = {
            groq: { name: 'Groq Console', url: 'https://console.groq.com/keys' },
            openrouter: { name: 'OpenRouter', url: 'https://openrouter.ai/keys' },
            cerebras: { name: 'Cerebras', url: 'https://cloud.cerebras.ai/' },
            huggingface: { name: 'HuggingFace', url: 'https://huggingface.co/settings/tokens' }
        };

        // Load current settings
        const provider = ZephyrAI.config.provider || 'groq';
        const model = ZephyrAI.config.model;
        const apiKey = ZephyrAI.config.apiKeys?.[provider] || '';

        // Set provider dropdown
        $('#setting-provider').value = provider;

        // Populate models for current provider
        this.updateModelDropdown(provider);

        // Set current model
        $('#setting-model').value = model;

        // Set API key
        $('#setting-api-key').value = apiKey;

        // Update API key hint
        this.updateApiKeyHint(provider);

        // Add provider change listener
        $('#setting-provider').onchange = (e) => {
            const newProvider = e.target.value;
            this.updateModelDropdown(newProvider);
            this.updateApiKeyHint(newProvider);
            // Load API key for this provider if exists
            $('#setting-api-key').value = ZephyrAI.config.apiKeys?.[newProvider] || '';
        };

        // Show modal
        $('#modal-backdrop').classList.add('active');
        $('#modal-settings').classList.add('active');
    },

    /**
     * Update model dropdown based on provider
     */
    updateModelDropdown(provider) {
        const { $ } = ZephyrUtils.dom;
        const modelSelect = $('#setting-model');
        const providerConfig = ZephyrAI.providers[provider];

        if (!providerConfig) return;

        modelSelect.innerHTML = '';
        providerConfig.models.forEach((model, index) => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model + (index === 0 ? ' (Recommended)' : '');
            modelSelect.appendChild(option);
        });
    },

    /**
     * Update API key hint link based on provider
     */
    updateApiKeyHint(provider) {
        const { $ } = ZephyrUtils.dom;
        const hint = $('#api-key-hint');
        const info = this.providerLinks[provider];

        if (info) {
            hint.innerHTML = `Get your free key from <a href="${info.url}" target="_blank">${info.name}</a>`;
        }
    },

    /**
     * Close settings modal
     */
    closeSettings() {
        const { $ } = ZephyrUtils.dom;
        $('#modal-backdrop').classList.remove('active');
        $('#modal-settings').classList.remove('active');
    },

    /**
     * Save settings
     */
    saveSettings() {
        const { $ } = ZephyrUtils.dom;

        const provider = $('#setting-provider').value;
        const model = $('#setting-model').value;
        const apiKey = $('#setting-api-key').value.trim();

        if (!apiKey) {
            ZephyrUtils.toast.warning('Please enter your API key');
            return;
        }

        // Save settings to AI engine
        ZephyrAI.saveSettings({
            provider,
            model,
            apiKey  // This will be stored under the current provider's key
        });

        this.updateApiStatus(true, provider);
        this.closeSettings();

        ZephyrUtils.toast.success(`Connected to ${ZephyrAI.providers[provider]?.name || provider}! 🎉`);
    },

    /**
     * Update API status indicator
     */
    updateApiStatus(isConfigured, provider = null) {
        const { $ } = ZephyrUtils.dom;
        const status = $('#api-status');
        const statusText = $('#api-status-text');

        if (isConfigured) {
            status.classList.add('connected');
            status.classList.remove('disconnected');
            const providerName = provider ? ZephyrAI.providers[provider]?.name : 'AI';
            statusText.textContent = providerName || 'Connected';
        } else {
            status.classList.remove('connected');
            status.classList.add('disconnected');
            statusText.textContent = 'Not configured';
        }
    },

    /**
     * Current camera/outfit communication intent.
     */
    getSelectedOutfitIntent() {
        return document.querySelector('.intent-chip.selected')?.dataset.intent || 'confident';
    },

    /**
     * Wardrobe Vault storage helpers.
     */
    getWardrobeVault() {
        return ZephyrUtils.storage.get('wardrobe', []);
    },

    saveWardrobeVault(items) {
        ZephyrUtils.storage.set('wardrobe', items);
        this.renderWardrobeVault();
        this.renderStyleDNA();
    },

    addWardrobeItemFromForm() {
        const { $ } = ZephyrUtils.dom;
        const name = $('#wardrobe-item-name')?.value.trim();
        const meta = $('#wardrobe-item-meta')?.value.trim();
        const type = $('#wardrobe-item-type')?.value || 'top';

        if (!name) {
            ZephyrUtils.toast.warning('Add an item name first');
            return;
        }

        const items = this.getWardrobeVault();
        items.unshift({
            id: Date.now().toString(),
            name,
            meta,
            type,
            createdAt: new Date().toISOString()
        });

        this.saveWardrobeVault(items.slice(0, 40));
        if ($('#wardrobe-item-name')) $('#wardrobe-item-name').value = '';
        if ($('#wardrobe-item-meta')) $('#wardrobe-item-meta').value = '';
        ZephyrUtils.toast.success('Wardrobe item saved');
    },

    deleteWardrobeItem(id) {
        this.saveWardrobeVault(this.getWardrobeVault().filter(item => item.id !== id));
        ZephyrUtils.toast.success('Wardrobe item removed');
    },

    renderWardrobeVault() {
        const list = document.getElementById('wardrobe-list');
        const count = document.getElementById('wardrobe-count');
        if (!list) return;

        const items = this.getWardrobeVault();
        if (count) count.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;

        if (!items.length) {
            list.innerHTML = `
                <div class="wardrobe-empty">
                    Add owned pieces like "black shirt", "blue jeans", or "white sneakers".
                </div>
            `;
            return;
        }

        list.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'wardrobe-item';
            const content = document.createElement('div');
            const type = document.createElement('span');
            type.className = 'wardrobe-type';
            type.textContent = item.type || 'item';
            const name = document.createElement('strong');
            name.textContent = item.name || 'Unnamed item';
            const meta = document.createElement('p');
            meta.textContent = item.meta || 'No extra notes';
            const remove = document.createElement('button');
            remove.className = 'wardrobe-delete';
            remove.type = 'button';
            remove.title = 'Remove item';
            remove.textContent = 'Remove';
            remove.addEventListener('click', () => this.deleteWardrobeItem(item.id));
            content.appendChild(type);
            content.appendChild(name);
            content.appendChild(meta);
            row.appendChild(content);
            row.appendChild(remove);
            list.appendChild(row);
        });
    },

    /**
     * Build a visible Style DNA from profile, memory, and wardrobe.
     */
    getStyleDNA() {
        const profile = ZephyrProfile.get();
        const memory = ZephyrAI.getStyleMemory ? ZephyrAI.getStyleMemory() : {};
        const wardrobe = this.getWardrobeVault();

        const signals = memory.styleSignals || [];
        const colors = [...new Set([...(memory.colors || []), ...(profile.favoriteColors || [])])].slice(0, 6);
        const occasions = [...new Set([...(memory.occasions || []), profile.occupation].filter(Boolean))].slice(0, 5);
        const dislikes = (memory.dislikes || []).slice(0, 4);
        const styles = profile.stylePreferences || [];

        let coreVibe = 'Learning your style';
        if (signals.some(s => /understated|clean|quiet/i.test(s)) || styles.includes('minimalist')) {
            coreVibe = 'Understated, sharp, clean';
        } else if (styles.includes('streetwear')) {
            coreVibe = 'Relaxed streetwear energy';
        } else if (styles.includes('formal')) {
            coreVibe = 'Polished and occasion-ready';
        } else if (signals[0]) {
            coreVibe = signals[0].replace(/^prefers\s+/i, '');
        }

        const confidence = /show off|flashy|loud/i.test(dislikes.join(' ')) || /understated|quiet/i.test(signals.join(' '))
            ? 'Quiet confidence'
            : 'Expressive confidence';

        const signature = colors.length
            ? `${colors.slice(0, 2).join(' + ')} base, clean fit, one intentional detail`
            : 'Clean base, balanced proportions, one intentional detail';

        return {
            coreVibe,
            confidence,
            colors: colors.length ? colors : ['black', 'white', 'navy'],
            occasions: occasions.length ? occasions : ['college/campus', 'presentation'],
            avoids: dislikes.length ? dislikes : ['overly loud pieces', 'unclear occasion fit'],
            signature,
            wardrobeCount: wardrobe.length,
            wardrobe
        };
    },

    renderStyleDNA() {
        const dna = this.getStyleDNA();
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        const setTags = (id, values) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = '';
            values.forEach(value => {
                const tag = document.createElement('span');
                tag.className = 'dna-tag';
                tag.textContent = value;
                el.appendChild(tag);
            });
        };

        setText('dna-core-vibe', dna.coreVibe);
        setText('dna-confidence', dna.confidence);
        setText('dna-signature', dna.signature);
        setText('dna-wardrobe-score', `${dna.wardrobeCount} item${dna.wardrobeCount === 1 ? '' : 's'}`);
        setText('dna-wardrobe-note', dna.wardrobeCount ? 'Zephyr can now build outfits from pieces you own.' : 'Add owned pieces in Wardrobe Vault for realistic outfit decisions.');
        setText('decision-best', dna.wardrobeCount ? `Use your strongest owned pieces around: ${dna.wardrobe.slice(0, 3).map(i => i.name).join(', ')}.` : dna.signature);
        setText('decision-safe', `Stay close to ${dna.colors.slice(0, 2).join(' and ')} with simple proportions.`);
        setText('decision-avoid', dna.avoids[0]);
        setTags('dna-colors', dna.colors);
        setTags('dna-avoids', dna.avoids);
        setTags('dna-occasions', dna.occasions);
    },

    askStyleDNADecision() {
        const dna = this.getStyleDNA();
        this.switchView('chat');
        const input = document.getElementById('chat-input');
        const prompt = `Use my Style DNA to choose the best outfit for tomorrow. Rank 3 options, include a score card, explain why each works, and tell me what to avoid. My Style DNA: ${dna.coreVibe}; signature formula: ${dna.signature}; wardrobe: ${dna.wardrobe.map(i => `${i.name} (${i.type}${i.meta ? ', ' + i.meta : ''})`).join('; ') || 'not added yet'}.`;
        if (input) {
            input.value = prompt;
            document.getElementById('btn-send').disabled = false;
            input.focus();
        }
    },

    /**
     * One-click professor-safe demo state.
     */
    loadPresentationDemo() {
        const demoProfile = {
            ...ZephyrProfile.defaultProfile,
            name: 'Demo User',
            gender: 'male',
            ageRange: '18-24',
            climate: 'tropical',
            stylePreferences: ['minimalist', 'formal', 'casual'],
            favoriteColors: ['black', 'white', 'navy'],
            occupation: 'student',
            currency: 'INR',
            budgetMin: '1000',
            budgetMax: '4000',
            shoppingPreferences: ['mid-range']
        };

        ZephyrProfile.save(demoProfile);
        ZephyrAI.saveStyleMemory({
            firstSeenAt: new Date(Date.now() - 86400000).toISOString(),
            lastInteractionAt: new Date(Date.now() - 86400000).toISOString(),
            interactionCount: 5,
            styleSignals: [
                'prefers understated, clean styling with quiet confidence over flashy looks',
                'needs outfits that balance confidence, neatness, and credibility'
            ],
            likes: ['I like clean black outfits that are not too much show off'],
            dislikes: ['Avoid loud, flashy pieces for professor-facing moments'],
            colors: ['black', 'white', 'navy'],
            occasions: ['academic presentation', 'college/campus'],
            budgetNotes: ['Budget around INR 1000-4000 per item'],
            recentTopics: ['Professor presentation outfit']
        });

        this.saveWardrobeVault([
            { id: 'demo-1', name: 'black Oxford shirt', meta: 'clean, slim fit', type: 'top', createdAt: new Date().toISOString() },
            { id: 'demo-2', name: 'dark blue jeans', meta: 'straight fit, no distressing', type: 'bottom', createdAt: new Date().toISOString() },
            { id: 'demo-3', name: 'white sneakers', meta: 'minimal and clean', type: 'shoes', createdAt: new Date().toISOString() },
            { id: 'demo-4', name: 'silver watch', meta: 'simple metal strap', type: 'accessory', createdAt: new Date().toISOString() }
        ]);

        ZephyrProfile.initForm();
        this.renderMemoryEditor();
        this.renderWardrobeVault();
        this.updateMemoryWelcome();
        this.switchView('dna');
        ZephyrUtils.toast.success('Presentation demo loaded');
    },

    /**
     * Save profile
     */
    saveProfile() {
        ZephyrProfile.saveForm();
        this.saveMemoryFromEditor(false);
        ZephyrUtils.toast.success('Profile saved! Zephyr will now personalize recommendations for you.');
    },

    /**
     * Fill the editable memory fields from Zephyr's long-term memory.
     */
    renderMemoryEditor() {
        if (!ZephyrAI.getStyleMemory) return;
        const { $ } = ZephyrUtils.dom;
        const memory = ZephyrAI.getStyleMemory();

        const setLines = (id, values = []) => {
            const el = $(id);
            if (el) el.value = values.join('\n');
        };
        const setCSV = (id, values = []) => {
            const el = $(id);
            if (el) el.value = values.join(', ');
        };

        setLines('#memory-styleSignals', memory.styleSignals || []);
        setLines('#memory-likes', memory.likes || []);
        setLines('#memory-dislikes', memory.dislikes || []);
        setCSV('#memory-colors', memory.colors || []);
        setCSV('#memory-occasions', memory.occasions || []);

        const count = [
            memory.styleSignals,
            memory.likes,
            memory.dislikes,
            memory.colors,
            memory.occasions
        ].reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);

        const countEl = $('#memory-count');
        if (countEl) countEl.textContent = `${count} signal${count === 1 ? '' : 's'}`;
    },

    /**
     * Save edited memory fields back to localStorage.
     */
    saveMemoryFromEditor(showToast = true) {
        if (!ZephyrAI.getStyleMemory) return;
        const { $ } = ZephyrUtils.dom;
        const existing = ZephyrAI.getStyleMemory();

        const lines = (id) => {
            const value = $(id)?.value || '';
            return value.split('\n').map(v => v.trim()).filter(Boolean).slice(0, 12);
        };
        const csv = (id) => {
            const value = $(id)?.value || '';
            return value.split(',').map(v => v.trim()).filter(Boolean).slice(0, 12);
        };

        const updated = {
            ...existing,
            styleSignals: lines('#memory-styleSignals'),
            likes: lines('#memory-likes'),
            dislikes: lines('#memory-dislikes'),
            colors: csv('#memory-colors'),
            occasions: csv('#memory-occasions'),
            lastInteractionAt: existing.lastInteractionAt || new Date().toISOString()
        };

        ZephyrAI.saveStyleMemory(updated);
        this.renderMemoryEditor();
        this.updateMemoryWelcome();
        if (showToast) ZephyrUtils.toast.success('Style memory updated');
    },

    /**
     * Export profile, remembered style, and region context as one transparent bundle.
     */
    exportProfileBundle() {
        this.saveMemoryFromEditor(false);
        const payload = {
            exportedAt: new Date().toISOString(),
            profile: ZephyrProfile.get(),
            styleMemory: ZephyrAI.getStyleMemory ? ZephyrAI.getStyleMemory() : {},
            wardrobe: this.getWardrobeVault(),
            styleDNA: this.getStyleDNA(),
            regionContext: ZephyrAI.getRegionInfo ? ZephyrAI.getRegionInfo() : {}
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zephyr-profile-memory-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        ZephyrUtils.toast.success('Profile exported with memory');
    },

    /**
     * Clear only learned style memory, not the profile form.
     */
    clearStyleMemory() {
        if (!confirm('Clear remembered style memory? Your profile form will stay saved.')) return;
        ZephyrUtils.storage.remove('style_memory');
        this.renderMemoryEditor();
        this.updateMemoryWelcome();
        ZephyrUtils.toast.success('Style memory cleared');
    },

    /**
     * Setup Fun Zone interactions.
     */
    setupFunZone() {
        const { $ } = ZephyrUtils.dom;
        this.funScore = this.funScore || 0;
        this.funTrivia = [
            'Black can feel authoritative because it creates strong visual boundaries and high contrast.',
            'White sneakers reduce formality, making structured outfits feel more approachable.',
            'Vertical lines and open jackets visually lengthen the body.',
            'One accent color is usually stronger than three competing statement pieces.',
            'Texture contrast, like denim with knitwear, adds depth without looking loud.',
            'A watch or clean belt can make a simple outfit look intentional.'
        ];
        this.styleSparks = [
            'Build one outfit using only two colors and one texture contrast.',
            'Upgrade a basic tee look with one structured layer.',
            'Try quiet confidence: dark base, clean shoes, one polished accessory.',
            'Make a presentation outfit that looks sharp but still comfortable.',
            'Pick one item you rarely wear and style everything else around it.',
            'Create a no-show-off fit: perfect fit, calm colors, strong shoes.'
        ];

        $('#breath-orb')?.addEventListener('click', () => this.toggleBreathing());
        $('#btn-next-trivia')?.addEventListener('click', () => this.showNextTrivia());
        $('#btn-style-spark')?.addEventListener('click', () => this.showStyleSpark());
        $('#mood-range')?.addEventListener('input', (e) => this.updateMoodMixer(Number(e.target.value)));
        this.buildPopGrid();
        this.updateMoodMixer(Number($('#mood-range')?.value || 45));
    },

    addFunScore(points = 1) {
        this.funScore = (this.funScore || 0) + points;
        const el = document.getElementById('fun-score');
        if (el) el.textContent = this.funScore;
    },

    toggleBreathing() {
        const orb = document.getElementById('breath-orb');
        const phase = document.getElementById('breath-phase');
        const copy = document.getElementById('breath-copy');
        if (!orb || !phase) return;

        if (this.breathTimer) {
            clearInterval(this.breathTimer);
            this.breathTimer = null;
            orb.classList.remove('breathing');
            phase.textContent = 'Start';
            if (copy) copy.textContent = 'Paused. Tap again whenever you want a reset.';
            return;
        }

        const phases = [
            { label: 'Inhale', copy: 'Breathe in slowly. Let your shoulders drop.' },
            { label: 'Hold', copy: 'Hold gently. Keep the face relaxed.' },
            { label: 'Exhale', copy: 'Exhale longer than you inhaled. Clear the noise.' }
        ];
        let index = 0;
        orb.classList.add('breathing');
        const update = () => {
            const current = phases[index % phases.length];
            phase.textContent = current.label;
            if (copy) copy.textContent = current.copy;
            index += 1;
        };
        update();
        this.addFunScore(2);
        this.breathTimer = setInterval(update, 3600);
    },

    buildPopGrid() {
        const grid = document.getElementById('pop-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const colors = ['violet', 'cyan', 'gold', 'rose', 'mint'];
        for (let i = 0; i < 36; i++) {
            const tile = document.createElement('button');
            tile.className = `pop-tile ${colors[i % colors.length]}`;
            tile.type = 'button';
            tile.setAttribute('aria-label', 'Pop color tile');
            tile.addEventListener('click', () => {
                tile.classList.add('popped');
                this.addFunScore(1);
                if (!grid.querySelector('.pop-tile:not(.popped)')) {
                    setTimeout(() => this.buildPopGrid(), 500);
                }
            });
            grid.appendChild(tile);
        }
    },

    showNextTrivia() {
        const el = document.getElementById('trivia-text');
        if (!el) return;
        const fact = this.funTrivia[Math.floor(Math.random() * this.funTrivia.length)];
        el.textContent = fact;
        this.addFunScore(3);
    },

    showStyleSpark() {
        const el = document.getElementById('style-spark-text');
        if (!el) return;
        const spark = this.styleSparks[Math.floor(Math.random() * this.styleSparks.length)];
        el.textContent = spark;
        this.addFunScore(3);
    },

    updateMoodMixer(value) {
        const el = document.getElementById('mood-result');
        if (!el) return;
        if (value < 25) {
            el.textContent = 'Low energy: soft tee, relaxed denim, muted colors, easy sneakers.';
        } else if (value < 55) {
            el.textContent = 'Balanced: clean layers, calm colors, one confident detail.';
        } else if (value < 80) {
            el.textContent = 'Social mode: sharper shoes, open overshirt, brighter accent.';
        } else {
            el.textContent = 'Main-character mode: monochrome base, statement jacket, polished accessory.';
        }
    },

    /**
     * Show welcome hint for first-time users
     */
    showWelcomeHint() {
        setTimeout(() => {
            ZephyrUtils.toast.info('👋 Welcome! Your Groq API key is pre-configured. Start chatting!');
        }, 1000);
    },

    /**
     * Update region display in UI
     */
    updateRegionDisplay() {
        const { $ } = ZephyrUtils.dom;
        const regionInfo = ZephyrAI.getRegionInfo ? ZephyrAI.getRegionInfo() : null;

        if (regionInfo && regionInfo.region) {
            // Update the API status to include region
            const statusText = $('#api-status-text');
            if (statusText && ZephyrAI.isConfigured()) {
                const flag = this.getRegionFlag(regionInfo.rawRegion || regionInfo.region);
                statusText.textContent = `${flag} ${regionInfo.rawRegion || regionInfo.region}`;
            }
        }
    },

    /**
     * Get emoji flag for region
     */
    getRegionFlag(region) {
        const flags = {
            'IN': '🇮🇳', 'US': '🇺🇸', 'UK': '🇬🇧', 'GB': '🇬🇧',
            'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸',
            'AU': '🇦🇺', 'CA': '🇨🇦', 'JP': '🇯🇵', 'CN': '🇨🇳',
            'BR': '🇧🇷', 'NL': '🇳🇱', 'DEFAULT': '🌍', 'EU': '🇪🇺'
        };
        return flags[region] || flags['DEFAULT'];
    },

    /**
     * Show region-aware hint
     */
    /**
     * Show region-aware hint
     */
    showRegionHint() {
        const regionInfo = ZephyrAI.getRegionInfo ? ZephyrAI.getRegionInfo() : null;
        if (regionInfo && regionInfo.shops) {
            setTimeout(() => {
                const flag = this.getRegionFlag(regionInfo.rawRegion || regionInfo.region);
                ZephyrUtils.toast.success(`${flag} Ready! Shopping recommendations for ${regionInfo.rawRegion || regionInfo.region} with ${regionInfo.currency} prices`);
            }, 800);
        }
    },

    /**
     * Toggle voice input
     */
    toggleVoiceInput() {
        const { $ } = ZephyrUtils.dom;
        const voiceBtn = $('#btn-voice');

        // Check for browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            ZephyrUtils.toast.error('Voice input not supported in this browser');
            return;
        }

        // Stop if already listening
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            voiceBtn.classList.remove('listening');
            this.updateAIStatus('ready');
            return;
        }

        // Start recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            voiceBtn.classList.add('listening');
            this.updateAIStatus('listening', 'Listening...');
            ZephyrUtils.toast.info('🎤 Listening... Speak now!');
        };

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            $('#chat-input').value = transcript;
            $('#btn-send').disabled = !transcript.trim();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            voiceBtn.classList.remove('listening');
            this.updateAIStatus('ready');

            const input = $('#chat-input').value.trim();
            if (input) {
                ZephyrUtils.toast.success('Voice captured! Press Enter or click Send');
                $('#chat-input').focus();
            }
        };

        this.recognition.onerror = (event) => {
            this.isListening = false;
            voiceBtn.classList.remove('listening');
            this.updateAIStatus('error', 'Error');
            ZephyrUtils.toast.error(`Voice error: ${event.error}`);
        };

        this.recognition.start();
    },

    /**
     * Update AI status indicator
     */
    updateAIStatus(status, text) {
        const { $ } = ZephyrUtils.dom;
        const statusEl = $('#ai-status');
        if (!statusEl) return;

        statusEl.classList.remove('thinking', 'error');

        switch (status) {
            case 'thinking':
                statusEl.classList.add('thinking');
                statusEl.querySelector('span').textContent = text || 'Thinking...';
                break;
            case 'error':
                statusEl.classList.add('error');
                statusEl.querySelector('span').textContent = text || 'Error';
                break;
            case 'listening':
                statusEl.classList.add('thinking');
                statusEl.querySelector('span').textContent = text || 'Listening...';
                break;
            default:
                statusEl.querySelector('span').textContent = 'Ready';
        }
    },

    /**
     * Update character counter
     */
    updateCharCounter(count) {
        const { $ } = ZephyrUtils.dom;
        const counter = $('#char-counter');
        if (!counter) return;

        const max = 2000;
        counter.textContent = `${count} / ${max}`;

        counter.classList.remove('warning', 'error');
        if (count > max) {
            counter.classList.add('error');
        } else if (count > max * 0.8) {
            counter.classList.add('warning');
        }
    },

    /**
     * Copy message to clipboard
     */
    copyMessage(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            button.classList.add('copied');
            button.innerHTML = '✓ Copied';
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = '📋 Copy';
            }, 2000);
        }).catch(() => {
            ZephyrUtils.toast.error('Failed to copy');
        });
    },

    /**
     * Generate smart suggestions based on context
     */
    generateSmartSuggestions(response) {
        const suggestions = [];
        const lowerResponse = response.toLowerCase();

        if (lowerResponse.includes('color') || lowerResponse.includes('palette')) {
            suggestions.push('Show me complementary colors');
            suggestions.push('What about accessories?');
        }
        if (lowerResponse.includes('outfit') || lowerResponse.includes('wear')) {
            suggestions.push('What shoes would match?');
            suggestions.push('Suggest alternatives on a budget');
        }
        if (lowerResponse.includes('trend') || lowerResponse.includes('style')) {
            suggestions.push('Show me similar styles');
            suggestions.push('Where can I buy these?');
        }
        if (lowerResponse.includes('casual') || lowerResponse.includes('formal')) {
            suggestions.push('Make it more casual');
            suggestions.push('Make it more formal');
        }

        // Default suggestions
        if (suggestions.length === 0) {
            suggestions.push('Tell me more');
            suggestions.push('Show alternatives');
        }

        return suggestions.slice(0, 3); // Max 3 suggestions
    },

    /**
     * Add message with enhanced features
     */
    addEnhancedMessage(role, content, suggestions = []) {
        const { $ } = ZephyrUtils.dom;
        const messagesContainer = $('#messages-inner');

        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;

        const avatar = role === 'user' ? '👤' : '⚡';
        const name = role === 'user' ? 'You' : 'Zephyr AI';
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        let suggestionsHtml = '';
        if (role === 'assistant' && suggestions.length > 0) {
            suggestionsHtml = `
                <div class="smart-suggestions">
                    ${suggestions.map(s => `<button class="smart-suggestion" onclick="ZephyrApp.useSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`).join('')}
                </div>
            `;
        }

        let actionsHtml = '';
        if (role === 'assistant') {
            actionsHtml = `
                <div class="message-actions">
                    <button class="msg-action-btn" onclick="ZephyrApp.copyMessage(\`${content.replace(/`/g, '\\`')}\`, this)">📋 Copy</button>
                    <button class="msg-action-btn" onclick="ZephyrApp.reactToMessage('like', this)">👍</button>
                    <button class="msg-action-btn" onclick="ZephyrApp.reactToMessage('dislike', this)">👎</button>
                </div>
            `;
        }

        messageEl.innerHTML = `
            <div class="message-avatar">
                <div class="avatar ${role === 'assistant' ? 'avatar-ai' : ''}">${avatar}</div>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${name}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-body">
                    <div class="typewriter-text">${this.formatResponse(content)}</div>
                    ${suggestionsHtml}
                </div>
                ${actionsHtml}
            </div>
        `;

        // Hide welcome screen if visible
        const welcomeScreen = $('#welcome-screen');
        if (welcomeScreen) welcomeScreen.style.display = 'none';

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        return messageEl;
    },

    /**
     * Use smart suggestion
     */
    useSuggestion(suggestion) {
        const { $ } = ZephyrUtils.dom;
        $('#chat-input').value = suggestion;
        $('#btn-send').disabled = false;
        this.sendMessage();
    },

    /**
     * React to message
     */
    reactToMessage(reaction, button) {
        button.style.background = reaction === 'like' ? 'var(--success)' : 'var(--error)';
        button.style.color = 'white';
        button.style.transform = 'scale(1.2)';

        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 200);

        ZephyrUtils.toast.success(reaction === 'like' ? '👍 Thanks for the feedback!' : '👎 We\'ll improve!');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ZephyrApp.init();
});

// Export for use in other modules
window.ZephyrApp = ZephyrApp;
