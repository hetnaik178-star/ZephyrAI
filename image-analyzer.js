/**
 * Zephyr AI - Image Analyzer
 * Handles image upload, preview, and analysis for outfit recognition
 */

const ZephyrImageAnalyzer = {
    // Current image state
    currentImage: null,
    currentImageData: null,
    _scanInterval: null,

    /**
     * Initialize image analyzer
     */
    init() {
        this.setupEventListeners();
    },

    /**
     * Setup event listeners for image upload
     */
    setupEventListeners() {
        const { $ } = ZephyrUtils.dom;

        const uploadZone = $('#upload-zone');
        const fileInput = $('#file-input');
        const removeBtn = $('#remove-preview');
        const analyzeBtn = $('#btn-analyze');

        if (!uploadZone || !fileInput) return;

        // Click to upload
        uploadZone.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');

            if (e.dataTransfer.files.length > 0) {
                this.handleFile(e.dataTransfer.files[0]);
            }
        });

        // Remove preview
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearImage();
            });
        }

        // Analyze button
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyze());
        }

        // Paste from clipboard
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) this.handleFile(file);
                    break;
                }
            }
        });
    },

    /**
     * Handle file selection
     */
    async handleFile(file) {
        const { dom, toast, validateImageFile, fileToBase64 } = ZephyrUtils;

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        try {
            // Convert to base64
            const base64 = await fileToBase64(file);

            this.currentImage = file;
            this.currentImageData = base64;

            // Show preview
            this.showPreview(base64);

            toast.success('Image loaded successfully!');
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Failed to process image');
        }
    },

    /**
     * Show image preview
     */
    showPreview(base64) {
        const { dom } = ZephyrUtils;
        const { $, show, hide } = dom;

        const preview = $('#upload-preview');
        const previewImg = $('#preview-image');
        const uploadZone = $('#upload-zone');
        const analyzeBtn = $('#btn-analyze');

        if (previewImg) {
            previewImg.src = base64;
        }

        if (preview) show(preview);
        if (uploadZone) hide(uploadZone);
        if (analyzeBtn) show(analyzeBtn);
    },

    /**
     * Clear current image
     */
    clearImage() {
        const { dom } = ZephyrUtils;
        const { $, show, hide } = dom;

        this.currentImage = null;
        this.currentImageData = null;

        const preview = $('#upload-preview');
        const previewImg = $('#preview-image');
        const uploadZone = $('#upload-zone');
        const analyzeBtn = $('#btn-analyze');
        const fileInput = $('#file-input');

        if (previewImg) previewImg.src = '';
        if (preview) hide(preview);
        if (uploadZone) show(uploadZone);
        if (analyzeBtn) hide(analyzeBtn);
        if (fileInput) fileInput.value = '';
    },

    /**
     * Show futuristic scanning animation over the image
     */
    showScan() {
        const overlay = document.getElementById('scan-overlay');
        if (overlay) overlay.classList.add('active');

        const statusEl = document.getElementById('scan-status');
        if (!statusEl) return;

        const statuses = [
            'SCANNING OUTFIT...',
            'DETECTING COLORS...',
            'ANALYZING FIT...',
            'READING PATTERNS...',
            'CHECKING STYLE...',
            'AI PROCESSING...'
        ];
        let i = 0;
        statusEl.textContent = statuses[0];
        this._scanInterval = setInterval(() => {
            i = (i + 1) % statuses.length;
            statusEl.textContent = statuses[i];
        }, 900);
    },

    /**
     * Hide scanning animation
     */
    hideScan() {
        const overlay = document.getElementById('scan-overlay');
        if (overlay) overlay.classList.remove('active');
        if (this._scanInterval) {
            clearInterval(this._scanInterval);
            this._scanInterval = null;
        }
    },

    /**
     * Analyze current image
     */
    async analyze() {
        if (!this.currentImageData) {
            ZephyrUtils.toast.warning('Please upload an image first');
            return;
        }

        if (!ZephyrAI.isConfigured()) {
            ZephyrUtils.toast.error('Please configure your API key first');
            return;
        }

        const { $ } = ZephyrUtils.dom;
        const analyzeBtn = $('#btn-analyze');

        // Show scan animation + disable button
        this.showScan();
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.querySelector('.analyze-btn-text').textContent = 'Analyzing...';
        }

        try {
            const intent = window.ZephyrApp?.getSelectedOutfitIntent?.() || 'confident';
            const analysis = await ZephyrAI.analyzeOutfit(
                this.currentImageData,
                `Analyze this outfit for the communication intent: ${intent}. Judge whether the look expresses that intent, include a score card, explain why each improvement works, and mention what to avoid.`
            );

            this.hideScan();
            this.showAnalysisResult(analysis);
            ZephyrUtils.toast.success('Analysis complete!');
        } catch (error) {
            console.error('Analysis error:', error);
            this.hideScan();
            ZephyrUtils.toast.error(error.message || 'Failed to analyze image');
        } finally {
            // Reset button to premium state
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = `
                  <span class="analyze-btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                  </span>
                  <span class="analyze-btn-text">Analyze Outfit</span>
                  <span class="analyze-btn-glow"></span>
                `;
            }
        }
    },

    /**
     * Show analysis result in chat
     */
    showAnalysisResult(analysis) {
        // Switch to chat view
        if (window.ZephyrApp) {
            ZephyrApp.switchView('chat');
        }

        // Add the analysis as a message
        if (window.ZephyrApp) {
            // Add user message showing image was analyzed
            ZephyrApp.addMessage('user', '📸 [Uploaded outfit image for analysis]');

            // Add AI response
            ZephyrApp.addMessage('assistant', analysis);
        }
    },

    /**
     * Quick analyze from chat (when attaching image)
     */
    async quickAnalyze(file, userMessage = '') {
        const validation = ZephyrUtils.validateImageFile(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const base64 = await ZephyrUtils.fileToBase64(file);

        const prompt = userMessage || 'Please analyze this outfit and give me your thoughts.';

        return ZephyrAI.chat(prompt, { imageData: base64 });
    }
};

// Export for use in other modules
window.ZephyrImageAnalyzer = ZephyrImageAnalyzer;
