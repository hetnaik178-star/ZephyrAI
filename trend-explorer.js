/**
 * Zephyr AI - Trend Explorer
 * Handles real-time fashion trend discovery using web search
 * Includes color-based image search via Pexels API
 */

const ZephyrTrendExplorer = {
  // Cache for trend results
  cache: new Map(),
  cacheTimeout: 30 * 60 * 1000, // 30 minutes

  // Currently active color
  activeColor: null,

  /**
   * Initialize trend explorer
   */
  init() {
    this.setupEventListeners();
    this.setupColorSearch();
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (!ZephyrUtils || !ZephyrUtils.dom) {
      console.error('ZephyrUtils not initialized');
      return;
    }

    const { $ } = ZephyrUtils.dom;

    const searchBtn = $('#btn-search-trends');
    const queryInput = $('#trend-query');
    const categoryCheckboxes = document.querySelectorAll('input[name="trend-cat"]');

    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.search());
    }

    if (queryInput) {
      queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.search();
      });
    }

    // Debounced search function (reduced to 300ms for responsiveness)
    const debouncedSearch = ZephyrUtils.debounce(() => this.search(), 300);

    // Category checkbox styling and auto-search
    if (categoryCheckboxes.length > 0) {
      categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
          const label = cb.closest('.form-checkbox');
          if (label) label.classList.toggle('selected', cb.checked);

          // Auto-trigger search when category changes
          debouncedSearch();
        });
      });
    } else {
      console.warn('No trend category checkboxes found');
    }
  },

  /**
   * Setup color search functionality
   */
  setupColorSearch() {
    const paletteGrid = document.getElementById('color-palette-grid');
    const closeBtn = document.getElementById('color-results-close');

    if (paletteGrid) {
      paletteGrid.addEventListener('click', (e) => {
        const swatch = e.target.closest('.color-swatch');
        if (!swatch) return;

        const colorHex = swatch.dataset.color;
        const colorName = swatch.dataset.name;

        // Toggle active state
        const swatches = paletteGrid.querySelectorAll('.color-swatch');
        swatches.forEach(s => s.classList.remove('active'));

        if (this.activeColor === colorName) {
          // Clicking same color again closes results
          this.activeColor = null;
          this.hideColorResults();
          return;
        }

        swatch.classList.add('active');
        this.activeColor = colorName;
        this.searchByColor(colorName, colorHex);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.activeColor = null;
        this.hideColorResults();
        const swatches = document.querySelectorAll('.color-swatch');
        swatches.forEach(s => s.classList.remove('active'));
      });
    }
  },

  /**
   * Search fashion images by color
   */
  async searchByColor(colorName, colorHex) {
    const resultsContainer = document.getElementById('color-image-results');
    const imageGrid = document.getElementById('color-image-grid');
    const loadingEl = document.getElementById('color-results-loading');
    const swatchEl = document.getElementById('color-results-swatch');
    const titleEl = document.getElementById('color-results-title');

    if (!resultsContainer) return;

    // Show results area with loading
    resultsContainer.style.display = 'block';
    imageGrid.innerHTML = '';
    imageGrid.style.display = 'none';
    loadingEl.style.display = 'grid';

    // Update header
    if (swatchEl) swatchEl.style.background = colorHex;
    if (titleEl) titleEl.textContent = `${colorName} Fashion Inspiration`;

    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      // Build search queries for this color
      const queries = [
        `${colorName} fashion outfit style`,
        `${colorName} color clothing trend`,
        `${colorName} dress wear look`
      ];

      // Fetch images from Pexels using ZephyrImages
      const allImages = [];
      const seenIds = new Set();

      // Fetch all queries in parallel
      const results = await Promise.all(
        queries.map((q, i) => this.fetchColorImages(q, i === 0 ? 4 : 3))
      );

      for (const batch of results) {
        for (const img of batch) {
          if (!seenIds.has(img.id)) {
            seenIds.add(img.id);
            allImages.push(img);
          }
        }
      }

      // Hide loading, show grid
      loadingEl.style.display = 'none';
      imageGrid.style.display = 'grid';

      if (allImages.length === 0) {
        imageGrid.innerHTML = `
          <div class="color-no-results" style="grid-column: 1 / -1;">
            <span class="color-no-results-icon">🔍</span>
            <p class="color-no-results-text">No images found for "${colorName}". Try another color!</p>
          </div>
        `;
        return;
      }

      // Render image cards (max 9)
      const imagesToShow = allImages.slice(0, 9);
      imagesToShow.forEach((img, idx) => {
        const card = document.createElement('div');
        card.className = 'color-img-card';

        card.innerHTML = `
          <div class="color-img-wrap">
            <img src="${img.url}" alt="${img.alt}" loading="lazy" />
            <div class="color-img-overlay">
              <button class="color-img-view-btn">🔍 View Full</button>
            </div>
          </div>
          <div class="color-img-info">
            <span class="color-img-alt">${img.alt}</span>
            <a href="${img.photographerUrl}" target="_blank" rel="noopener" class="color-img-credit">
              📷 ${img.photographer}
            </a>
          </div>
        `;

        // Click to open lightbox
        card.addEventListener('click', (e) => {
          if (e.target.closest('a')) return; // Don't intercept credit links
          if (window.ZephyrImages) {
            ZephyrImages.openLightbox(img, imagesToShow, idx);
          }
        });

        imageGrid.appendChild(card);
      });

      // Toast notification
      if (window.ZephyrUtils) {
        ZephyrUtils.toast.success(`Found ${imagesToShow.length} ${colorName} looks!`);
      }

    } catch (error) {
      console.error('Color search error:', error);
      loadingEl.style.display = 'none';
      imageGrid.style.display = 'grid';
      imageGrid.innerHTML = `
        <div class="color-no-results" style="grid-column: 1 / -1;">
          <span class="color-no-results-icon">⚠️</span>
          <p class="color-no-results-text">Something went wrong. Please try again.</p>
        </div>
      `;
    }
  },

  /**
   * Fetch images from Pexels API (reuses ZephyrImages API key)
   */
  async fetchColorImages(query, perPage = 4) {
    // Use ZephyrImages if available
    if (window.ZephyrImages) {
      return await ZephyrImages.fetchImages(query, perPage);
    }

    // Fallback: direct Pexels API call
    const apiKey = '7I5AokYnoDQfmJhuZLs0U3ecabPYtImSgvdoecBD5JHbcIZ48Gm6K0hK';
    const baseUrl = 'https://api.pexels.com/v1/search';

    try {
      const url = `${baseUrl}?query=${encodeURIComponent(query)}&per_page=${perPage + 4}&orientation=portrait`;
      const response = await fetch(url, {
        headers: { 'Authorization': apiKey }
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (!data.photos || data.photos.length === 0) return [];

      return data.photos.slice(0, perPage).map(photo => ({
        id: photo.id,
        url: photo.src.medium,
        large: photo.src.large,
        alt: photo.alt || query,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        color: photo.avg_color
      }));
    } catch (error) {
      console.warn('Pexels color search failed:', error);
      return [];
    }
  },

  /**
   * Hide color results section
   */
  hideColorResults() {
    const resultsContainer = document.getElementById('color-image-results');
    if (resultsContainer) {
      resultsContainer.style.opacity = '0';
      resultsContainer.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        resultsContainer.style.display = 'none';
        resultsContainer.style.opacity = '';
        resultsContainer.style.transform = '';
      }, 300);
    }
  },

  /**
   * Get selected categories
   */
  getSelectedCategories() {
    const checkboxes = document.querySelectorAll('input[name="trend-cat"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  },

  /**
   * Search for trends
   */
  async search() {
    const { $, show, hide } = ZephyrUtils.dom;

    const queryInput = $('#trend-query');
    const searchBtn = $('#btn-search-trends');
    const resultsContainer = $('#trend-results');

    let query = queryInput?.value?.trim();
    const categories = this.getSelectedCategories();

    // If no query but categories selected, use categories as query
    if (!query && categories.length > 0) {
      query = categories.join(' and ') + ' fashion';
    }

    if (!query) {
      ZephyrUtils.toast.warning('Please enter a topic or select a category');
      return;
    }

    if (!ZephyrAI.isConfigured()) {
      ZephyrUtils.toast.error('Please configure your API key first');
      return;
    }

    // Check cache
    const cacheKey = `${query}-${categories.join(',')}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      this.displayResults(cached.data);
      return;
    }

    // Show loading state
    if (searchBtn) {
      searchBtn.disabled = true;
      searchBtn.innerHTML = `
        <div class="typing-indicator" style="padding: 0; gap: 4px;">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      `;
    }

    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: var(--space-8);">
          <div class="typing-indicator" style="justify-content: center; margin-bottom: var(--space-4);">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
          <p style="color: var(--text-secondary);">Searching for the latest trends...</p>
        </div>
      `;
    }

    try {
      const results = await ZephyrAI.searchTrends(query, categories);

      // Cache results
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      this.displayResults(results);

      ZephyrUtils.toast.success('Trends loaded!');
    } catch (error) {
      console.error('Trend search error:', error);
      ZephyrUtils.toast.error(error.message || 'Failed to search trends');

      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="card" style="text-align: center; padding: var(--space-8); border-color: var(--error);">
            <p style="color: var(--error); margin-bottom: var(--space-2);">Failed to load trends</p>
            <p style="color: var(--text-tertiary); font-size: var(--text-sm);">${error.message}</p>
          </div>
        `;
      }
    } finally {
      // Reset button
      if (searchBtn) {
        searchBtn.disabled = false;
        searchBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          Search
        `;
      }
    }
  },

  /**
   * Display trend results
   */
  displayResults(content) {
    const { $ } = ZephyrUtils.dom;
    const resultsContainer = $('#trend-results');

    if (!resultsContainer) return;

    // Convert markdown to HTML
    const htmlContent = ZephyrUtils.markdown.toHtml(content);

    resultsContainer.innerHTML = `
      <div class="card" style="margin-top: var(--space-5);">
        <div class="card-header">
          <div class="card-icon">✨</div>
          <h3 class="card-title">Trend Results</h3>
        </div>
        <div class="card-body message-body">
          ${htmlContent}
        </div>
        <div style="margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--border-subtle);">
          <button class="btn btn-secondary" id="btn-discuss-trends" style="width: 100%;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Discuss with Zephyr
          </button>
        </div>
      </div>
    `;

    // Add click handler for discuss button
    const discussBtn = $('#btn-discuss-trends');
    if (discussBtn) {
      discussBtn.addEventListener('click', () => {
        this.discussTrends(content);
      });
    }
  },

  /**
   * Open chat to discuss trends
   */
  discussTrends(trendContent) {
    if (!window.ZephyrApp) return;

    // Switch to chat view
    ZephyrApp.switchView('chat');

    // Pre-fill chat with context
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.value = "Based on the trends you just showed me, what would work best for my style?";
      chatInput.focus();
      chatInput.dispatchEvent(new Event('input'));
    }
  },

  /**
   * Get quick trend suggestions
   */
  getQuickTrends() {
    return [
      { query: 'Spring 2026 fashion trends', icon: '🌸' },
      { query: 'Sustainable fashion trends', icon: '🌿' },
      { query: 'Streetwear trends', icon: '🔥' },
      { query: 'Minimalist wardrobe essentials', icon: '⚪' },
      { query: 'Office wear trends', icon: '💼' },
      { query: 'Celebrity street style', icon: '⭐' }
    ];
  },

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
};

// Export for use in other modules
window.ZephyrTrendExplorer = ZephyrTrendExplorer;

