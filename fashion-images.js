/**
 * Zephyr Fashion Images — Dynamic Associative Image Display
 * Fetches relevant fashion images from Pexels based on AI response content
 * Only enriches Zephyr AI responses, does not affect Sophie or other widgets
 */

const ZephyrImages = {
    apiKey: '7I5AokYnoDQfmJhuZLs0U3ecabPYtImSgvdoecBD5JHbcIZ48Gm6K0hK',
    baseUrl: 'https://api.pexels.com/v1/search',

    // Cache to avoid re-fetching same queries
    cache: new Map(),
    // Track shown image IDs to avoid duplicates in session
    shownIds: new Set(),

    // Fashion-related keywords to detect in responses
    fashionKeywords: {
        clothing: [
            'blazer', 'jacket', 'coat', 'shirt', 'blouse', 'top', 'sweater', 'hoodie',
            'cardigan', 'vest', 'polo', 'turtleneck', 'tank top', 't-shirt', 'tee',
            'jeans', 'pants', 'trousers', 'chinos', 'shorts', 'skirt', 'dress',
            'suit', 'tuxedo', 'jumpsuit', 'romper', 'overalls', 'leggings',
            'kurta', 'saree', 'sari', 'lehenga', 'sherwani', 'salwar', 'anarkali',
            'kimono', 'kaftan', 'tunic', 'peplum', 'wrap dress', 'maxi dress',
            'midi dress', 'mini dress', 'sundress', 'gown', 'cocktail dress'
        ],
        accessories: [
            'sneakers', 'shoes', 'boots', 'heels', 'sandals', 'loafers', 'oxfords',
            'watch', 'sunglasses', 'hat', 'cap', 'scarf', 'belt', 'tie', 'bow tie',
            'handbag', 'purse', 'clutch', 'backpack', 'tote', 'wallet',
            'jewelry', 'necklace', 'bracelet', 'earrings', 'ring', 'cufflinks'
        ],
        styles: [
            'casual', 'formal', 'streetwear', 'athleisure', 'boho', 'bohemian',
            'minimalist', 'classic', 'vintage', 'retro', 'preppy', 'grunge',
            'elegant', 'chic', 'sporty', 'luxury', 'smart casual', 'business casual',
            'cocktail', 'black tie', 'date night', 'office wear', 'work outfit',
            'summer outfit', 'winter outfit', 'spring outfit', 'fall outfit',
            'festival', 'party wear', 'wedding guest', 'bridal'
        ],
        colors: [
            'navy', 'burgundy', 'olive', 'charcoal', 'beige', 'cream', 'ivory',
            'pastel', 'earth tone', 'jewel tone', 'monochrome', 'neutral',
            'black and white', 'red', 'blue', 'green', 'pink', 'purple',
            'orange', 'yellow', 'brown', 'grey', 'white', 'black', 'teal', 'coral'
        ],
        fabrics: [
            'denim', 'leather', 'silk', 'cotton', 'linen', 'wool', 'cashmere',
            'velvet', 'suede', 'satin', 'chiffon', 'tweed', 'corduroy', 'flannel'
        ]
    },

    /**
     * Extract fashion-relevant search queries from AI response text
     * Returns 1-3 search queries
     */
    extractKeywords(responseText) {
        const text = responseText.toLowerCase();
        const found = { clothing: [], accessories: [], styles: [], colors: [], fabrics: [] };

        // Scan for keyword matches
        for (const [category, words] of Object.entries(this.fashionKeywords)) {
            for (const word of words) {
                if (text.includes(word) && !found[category].includes(word)) {
                    found[category].push(word);
                }
            }
        }

        // Count total fashion terms found
        const totalFound = Object.values(found).flat().length;
        if (totalFound < 2) return []; // Not fashion-focused enough

        // Detect gender context for better image relevance
        const genderHints = [];
        if (/\b(men|male|man|boy|guys|gentleman|groom|him|his)\b/.test(text)) genderHints.push('men');
        if (/\b(women|female|woman|girl|ladies|bride|her|she)\b/.test(text)) genderHints.push('women');
        const genderTag = genderHints.length === 1 ? genderHints[0] : '';

        // Detect occasion / season context
        const occasions = ['beach', 'summer', 'winter', 'spring', 'fall', 'autumn', 'wedding',
            'interview', 'office', 'party', 'date', 'festival', 'gym', 'travel', 'vacation'];
        const foundOccasion = occasions.find(o => text.includes(o)) || '';

        // Build smart search queries (max 3)
        const queries = [];

        // Query 1: Main clothing item + color + gender + occasion
        if (found.clothing.length > 0) {
            const mainItem = found.clothing[0];
            const color = found.colors[0] || '';
            const parts = [genderTag, color, mainItem, foundOccasion, 'outfit'].filter(Boolean);
            queries.push(parts.join(' '));
        }

        // Query 2: Second clothing or accessory + style
        if (found.clothing.length > 1) {
            const item = found.clothing[1];
            const style = found.styles[0] || '';
            const parts = [genderTag, style, item, 'fashion'].filter(Boolean);
            queries.push(parts.join(' '));
        } else if (found.accessories.length > 0) {
            const acc = found.accessories[0];
            const parts = [genderTag, acc, 'fashion style'].filter(Boolean);
            queries.push(parts.join(' '));
        }

        // Query 3: Style/occasion look
        if (found.styles.length > 0 && queries.length < 3) {
            const style = found.styles[0];
            const item = found.clothing[0] || 'look';
            const parts = [genderTag, style, item, 'styling'].filter(Boolean);
            queries.push(parts.join(' '));
        }

        // Fallback: color/fabric + fashion
        if (queries.length === 0 && (found.colors.length > 0 || found.fabrics.length > 0)) {
            const term = found.colors[0] || found.fabrics[0];
            queries.push(`${genderTag} ${term} fashion outfit`.trim());
        }

        return queries.slice(0, 3);
    },

    /**
     * Fetch images from Pexels API
     */
    async fetchImages(query, perPage = 4) {
        // Check cache
        if (this.cache.has(query)) {
            return this.cache.get(query);
        }

        try {
            const url = `${this.baseUrl}?query=${encodeURIComponent(query)}&per_page=${perPage + 6}&orientation=landscape`;
            const response = await fetch(url, {
                headers: { 'Authorization': this.apiKey }
            });

            if (!response.ok) {
                console.warn(`Pexels API error: ${response.status}`);
                return this.fallbackImages(query);
            }

            const data = await response.json();
            if (!data.photos || data.photos.length === 0) {
                return this.fallbackImages(query);
            }

            // Filter out already shown images and pick best ones
            const images = data.photos
                .filter(p => !this.shownIds.has(p.id))
                .slice(0, perPage)
                .map(photo => ({
                    id: photo.id,
                    url: photo.src.medium,
                    large: photo.src.large,
                    alt: photo.alt || query,
                    photographer: photo.photographer,
                    photographerUrl: photo.photographer_url,
                    color: photo.avg_color
                }));

            // Mark as shown
            images.forEach(img => this.shownIds.add(img.id));

            // Cache result
            this.cache.set(query, images);
            return images;

        } catch (error) {
            console.warn('Pexels fetch failed:', error);
            return this.fallbackImages(query);
        }
    },

    /**
     * Fallback: use Unsplash source URLs (no API key needed)
     */
    fallbackImages(query) {
        const q = encodeURIComponent(query);
        const images = [];
        // Generate 2 unique fallback images using random seeds
        for (let i = 0; i < 2; i++) {
            const seed = Date.now() + i;
            images.push({
                id: `fallback-${seed}`,
                url: `https://source.unsplash.com/400x260/?${q}&sig=${seed}`,
                large: `https://source.unsplash.com/800x520/?${q}&sig=${seed}`,
                alt: query,
                photographer: 'Unsplash',
                photographerUrl: 'https://unsplash.com',
                color: '#1a1a2e'
            });
        }
        return images;
    },

    /**
     * Main entry: fetch images for a Zephyr AI response
     * Uses the USER's original question as primary query for relevance
     */
    async fetchForResponse(responseText, userMessage = '') {
        // Build queries: user question is PRIMARY, AI response keywords are SECONDARY
        const queries = [];

        // PRIMARY: Clean up user's question into a search query
        if (userMessage && userMessage.length > 3) {
            // Strip filler words and make it a fashion search
            const cleaned = userMessage.toLowerCase()
                .replace(/\b(suggest|recommend|help|me|what|which|should|i|please|can|you|give|show|tell|some|a|an|the|for|with|and|or|about|how|do|does|is|are|was|were|be|been|my|your|its|have|has|need|want)\b/gi, '')
                .replace(/[?!.,]/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (cleaned.length > 2) {
                // Add "fashion" or "outfit" if not already present
                const hasFashionWord = /\b(outfit|fashion|style|wear|look|clothing|clothes|dress)\b/.test(cleaned);
                queries.push(hasFashionWord ? cleaned : `${cleaned} fashion`);
            }
        }

        // SECONDARY: Extract specific items from AI response
        const responseQueries = this.extractKeywords(responseText);
        // Add up to 2 response-based queries (skip if too similar to user query)
        for (const rq of responseQueries) {
            if (queries.length >= 3) break;
            // Don't add if too similar to existing queries
            const isDuplicate = queries.some(q => {
                const words1 = new Set(q.split(' '));
                const words2 = new Set(rq.split(' '));
                let overlap = 0;
                words2.forEach(w => { if (words1.has(w)) overlap++; });
                return overlap >= 2;
            });
            if (!isDuplicate) queries.push(rq);
        }

        // If no queries at all, bail out
        if (queries.length === 0) return [];

        // Fetch images for all queries in parallel
        const results = await Promise.all(
            queries.map((q, i) => this.fetchImages(q, i === 0 ? 3 : 2))
        );

        // Flatten and deduplicate
        const allImages = [];
        const seenIds = new Set();
        for (const batch of results) {
            for (const img of batch) {
                if (!seenIds.has(img.id)) {
                    seenIds.add(img.id);
                    allImages.push(img);
                }
            }
        }

        // Return max 5 images
        return allImages.slice(0, 5);
    },

    /**
     * Create the animated image gallery
     */
    createGallery(images) {
        if (!images || images.length === 0) return null;

        const gallery = document.createElement('div');
        gallery.className = 'msg-image-gallery';

        // Animated header
        const header = document.createElement('div');
        header.className = 'msg-gallery-header';
        header.innerHTML = `
            <div class="msg-gallery-header-line"></div>
            <span class="msg-gallery-icon">📸</span>
            <span class="msg-gallery-title">Style Inspiration</span>
            <span class="msg-gallery-count">${images.length} looks</span>
            <div class="msg-gallery-header-line"></div>
        `;
        gallery.appendChild(header);

        // Scrollable image row
        const row = document.createElement('div');
        row.className = 'msg-gallery-row';

        images.forEach((img, index) => {
            const card = document.createElement('div');
            card.className = 'msg-image-card';
            card.style.setProperty('--card-bg', img.color || '#1a1a2e');
            card.style.setProperty('--card-index', index);
            card.style.setProperty('--card-delay', `${index * 0.12}s`);

            // Start with skeleton shimmer
            card.innerHTML = `
                <div class="msg-image-wrap">
                    <div class="msg-image-skeleton"></div>
                    <img src="${img.url}" alt="${img.alt}" loading="lazy" />
                    <div class="msg-image-overlay">
                        <span class="msg-image-zoom">🔍 View</span>
                    </div>
                    <div class="msg-image-shine"></div>
                </div>
                <div class="msg-image-caption">
                    <span class="msg-image-alt">${img.alt}</span>
                    <a href="${img.photographerUrl}" target="_blank" rel="noopener" class="msg-image-credit">
                        📷 ${img.photographer}
                    </a>
                </div>
            `;

            // Handle image load — remove skeleton, trigger entrance
            const imgEl = card.querySelector('img');
            imgEl.addEventListener('load', () => {
                card.classList.add('loaded');
                card.querySelector('.msg-image-skeleton')?.remove();
            });
            imgEl.addEventListener('error', () => {
                card.style.display = 'none';
            });

            // Click to open lightbox
            card.querySelector('.msg-image-wrap').addEventListener('click', () => {
                this.openLightbox(img, images, index);
            });

            row.appendChild(card);
        });

        gallery.appendChild(row);

        // Stagger entrance animation after append
        requestAnimationFrame(() => {
            gallery.classList.add('visible');
        });

        return gallery;
    },

    /**
     * Lightbox with navigation
     */
    openLightbox(img, allImages, currentIndex) {
        const existing = document.getElementById('zephyr-lightbox');
        if (existing) existing.remove();

        const lb = document.createElement('div');
        lb.id = 'zephyr-lightbox';
        lb.className = 'zephyr-lightbox';

        const renderImage = (i) => {
            const photo = allImages[i];
            const content = lb.querySelector('.lightbox-content');
            if (!content) return;
            content.querySelector('img').src = photo.large;
            content.querySelector('img').alt = photo.alt;
            content.querySelector('.lb-caption').textContent = photo.alt;
            content.querySelector('.lb-credit').textContent = `📷 ${photo.photographer}`;
            content.querySelector('.lb-credit').href = photo.photographerUrl;
            content.querySelector('.lb-counter').textContent = `${i + 1} / ${allImages.length}`;
        };

        lb.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <div class="lightbox-content">
                <img src="${img.large}" alt="${img.alt}" />
                <div class="lightbox-info">
                    <div class="lb-info-left">
                        <span class="lb-caption">${img.alt}</span>
                        <a href="${img.photographerUrl}" target="_blank" rel="noopener" class="lb-credit">📷 ${img.photographer}</a>
                    </div>
                    <span class="lb-counter">${currentIndex + 1} / ${allImages.length}</span>
                </div>
                ${allImages.length > 1 ? `
                    <button class="lb-nav lb-prev" title="Previous">‹</button>
                    <button class="lb-nav lb-next" title="Next">›</button>
                ` : ''}
                <button class="lightbox-close" title="Close">✕</button>
            </div>
        `;

        // Navigation
        let idx = currentIndex;
        lb.querySelector('.lb-prev')?.addEventListener('click', (e) => {
            e.stopPropagation();
            idx = (idx - 1 + allImages.length) % allImages.length;
            renderImage(idx);
        });
        lb.querySelector('.lb-next')?.addEventListener('click', (e) => {
            e.stopPropagation();
            idx = (idx + 1) % allImages.length;
            renderImage(idx);
        });

        // Close
        lb.addEventListener('click', (e) => {
            if (e.target === lb || e.target.classList.contains('lightbox-backdrop') || e.target.classList.contains('lightbox-close')) {
                lb.classList.add('closing');
                setTimeout(() => lb.remove(), 300);
            }
        });

        // Keyboard nav
        const onKey = (e) => {
            if (e.key === 'Escape') { lb.classList.add('closing'); setTimeout(() => lb.remove(), 300); document.removeEventListener('keydown', onKey); }
            if (e.key === 'ArrowLeft') { idx = (idx - 1 + allImages.length) % allImages.length; renderImage(idx); }
            if (e.key === 'ArrowRight') { idx = (idx + 1) % allImages.length; renderImage(idx); }
        };
        document.addEventListener('keydown', onKey);

        document.body.appendChild(lb);
        requestAnimationFrame(() => lb.classList.add('open'));
    }
};

window.ZephyrImages = ZephyrImages;
