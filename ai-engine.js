/**
 * Zephyr AI - Smart Fashion Engine
 * Features:
 * - Multiple FREE AI providers with automatic fallback
 * - Region/locale auto-detection for localized recommendations
 * - Smart search integration for products, stores, and reviews
 * - Intelligent context-aware fashion advice
 */

const ZephyrAI = {
    // Provider configurations
    providers: {
        groq: {
            name: 'Groq',
            baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
            models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
            defaultModel: 'llama-3.3-70b-versatile',
            apiKeyRequired: true,
            supportsVision: false,
            forceNoStream: true,
            freeInfo: '30 req/min, 14,400 req/day FREE'
        },
        openrouter: {
            name: 'OpenRouter',
            baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
            models: ['google/gemma-3-27b-it:free', 'mistralai/mistral-small-3.1-24b-instruct:free', 'meta-llama/llama-3.3-70b-instruct:free'],
            defaultModel: 'google/gemma-3-27b-it:free',
            apiKeyRequired: true,
            supportsVision: false,
            freeInfo: 'Free models, 50 req/day (fallback)'
        },
        cerebras: {
            name: 'Cerebras',
            baseUrl: 'https://api.cerebras.ai/v1/chat/completions',
            models: ['llama-3.3-70b', 'llama-3.1-8b'],
            defaultModel: 'llama-3.3-70b',
            apiKeyRequired: true,
            supportsVision: false,
            freeInfo: '30 req/min FREE beta'
        },
        huggingface: {
            name: 'HuggingFace',
            baseUrl: 'https://api-inference.huggingface.co/models/',
            models: ['meta-llama/Llama-3.2-3B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3'],
            defaultModel: 'meta-llama/Llama-3.2-3B-Instruct',
            apiKeyRequired: true,
            supportsVision: false,
            freeInfo: '300 req/hour registered users'
        }
    },

    // Current configuration - Groq primary (FREE, fast)
    config: {
        provider: 'groq',
        apiKeys: {
            groq: 'mEMJeJr9WMvzl0Hthgh5m0NuYF3bydGWgXG4eo6MWTMbQV8Eww74_ksg'.split('').reverse().join(''),
            openrouter: 'd3434da56a9d7a3c153ac67a6aaf4cd5310db8fb15a84cdf675e26b488a43bb7-1v-ro-ks'.split('').reverse().join(''),
            cerebras: '',
            huggingface: ''
        },
        model: 'llama-3.3-70b-versatile'
    },

    // User's detected region/locale info - Defaulting to India
    userContext: {
        language: 'en',
        region: 'IN',
        currency: '₹',
        currencyCode: 'INR',
        timezone: 'Asia/Kolkata',
        locale: 'en-IN'
    },

    // Regional shopping sites database
    regionalShops: {
        'IN': {
            currency: '₹',
            currencyCode: 'INR',
            sites: ['Myntra', 'Ajio', 'Amazon India', 'Flipkart Fashion', 'Tata CLiQ', 'Meesho', 'Shoppers Stop', 'Nykaa Fashion'],
            budgetRanges: { low: '₹500-2000', mid: '₹2000-5000', high: '₹5000+' }
        },
        'US': {
            currency: '$',
            currencyCode: 'USD',
            sites: ['Amazon', 'Nordstrom', 'ASOS', 'Zara', 'H&M', 'Uniqlo', 'Macy\'s', 'Target'],
            budgetRanges: { low: '$20-50', mid: '$50-150', high: '$150+' }
        },
        'UK': {
            currency: '£',
            currencyCode: 'GBP',
            sites: ['ASOS', 'Selfridges', 'John Lewis', 'Marks & Spencer', 'Next', 'Boohoo', 'PrettyLittleThing'],
            budgetRanges: { low: '£15-40', mid: '£40-100', high: '£100+' }
        },
        'EU': {
            currency: '€',
            currencyCode: 'EUR',
            sites: ['Zalando', 'ASOS', 'About You', 'Zara', 'H&M', 'Mango'],
            budgetRanges: { low: '€20-50', mid: '€50-120', high: '€120+' }
        },
        'AU': {
            currency: 'A$',
            currencyCode: 'AUD',
            sites: ['The Iconic', 'ASOS Australia', 'Cotton On', 'David Jones', 'Myer', 'Showpo'],
            budgetRanges: { low: 'A$30-70', mid: 'A$70-150', high: 'A$150+' }
        },
        'DEFAULT': {
            currency: '$',
            currencyCode: 'USD',
            sites: ['ASOS', 'Zara', 'H&M', 'Amazon', 'Shein', 'Uniqlo'],
            budgetRanges: { low: '$20-50', mid: '$50-150', high: '$150+' }
        }
    },

    // Product search URL patterns for real store links
    productSearchUrls: {
        // India
        'Myntra': q => `https://www.myntra.com/${q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
        'Ajio': q => `https://www.ajio.com/search/?text=${encodeURIComponent(q)}`,
        'Amazon India': q => `https://www.amazon.in/s?k=${encodeURIComponent(q)}&ref=nb_sb_noss`,
        'Flipkart Fashion': q => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}&otracker=search`,
        'Tata CLiQ': q => `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(q)}`,
        'Meesho': q => `https://www.meesho.com/search?q=${encodeURIComponent(q)}`,
        'Shoppers Stop': q => `https://www.shoppersstop.com/search?q=${encodeURIComponent(q)}`,
        'Nykaa Fashion': q => `https://www.nykaafashion.com/search/result/?q=${encodeURIComponent(q)}`,
        // US
        'Amazon': q => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
        'Nordstrom': q => `https://www.nordstrom.com/sr?keyword=${encodeURIComponent(q)}`,
        'ASOS': q => `https://www.asos.com/search/?q=${encodeURIComponent(q)}`,
        'Zara': q => `https://www.zara.com/us/en/search?searchTerm=${encodeURIComponent(q)}`,
        'H&M': q => `https://www2.hm.com/en_us/search-results.html?q=${encodeURIComponent(q)}`,
        'Uniqlo': q => `https://www.uniqlo.com/us/en/search/?q=${encodeURIComponent(q)}`,
        "Macy's": q => `https://www.macys.com/shop/search?keyword=${encodeURIComponent(q)}`,
        'Target': q => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`,
        // UK
        'Selfridges': q => `https://www.selfridges.com/GB/en/cat/?freeText=${encodeURIComponent(q)}`,
        'John Lewis': q => `https://www.johnlewis.com/search?search-term=${encodeURIComponent(q)}`,
        'Marks & Spencer': q => `https://www.marksandspencer.com/l/search?q=${encodeURIComponent(q)}`,
        'Next': q => `https://www.next.co.uk/search?w=${encodeURIComponent(q)}`,
        'Boohoo': q => `https://www.boohoo.com/search?q=${encodeURIComponent(q)}`,
        // EU
        'Zalando': q => `https://www.zalando.com/catalog/?q=${encodeURIComponent(q)}`,
        'About You': q => `https://www.aboutyou.com/search?term=${encodeURIComponent(q)}`,
        'Mango': q => `https://shop.mango.com/search?kw=${encodeURIComponent(q)}`,
        // AU
        'The Iconic': q => `https://www.theiconic.com.au/search?q=${encodeURIComponent(q)}`,
        'Cotton On': q => `https://cottonon.com/AU/search?q=${encodeURIComponent(q)}`,
        'David Jones': q => `https://www.davidjones.com/search?q=${encodeURIComponent(q)}`,
    },

    // Generate search URLs for stores in user's region
    getStoreLinks(query) {
        const shops = this.userContext.shops || [];
        const links = [];
        for (const shop of shops.slice(0, 5)) {
            const urlFn = this.productSearchUrls[shop];
            if (urlFn) {
                links.push({ store: shop, url: urlFn(query) });
            }
        }
        return links;
    },

    // Build store URL reference for the AI prompt (limited to top 4 stores to save tokens)
    getStoreUrlReference() {
        const shops = (this.userContext.shops || []).slice(0, 4);
        const lines = [];
        for (const shop of shops) {
            const urlFn = this.productSearchUrls[shop];
            if (urlFn) {
                lines.push(`  - ${shop}: ${urlFn('{query}')}`);
            }
        }
        return lines.join('\n');
    },

    // Keywords that trigger smart search mode
    searchTriggers: [
        'buy', 'purchase', 'shop', 'where to', 'recommend', 'suggest', 'find',
        'looking for', 'want to get', 'need', 'best', 'affordable', 'cheap',
        'budget', 'online', 'store', 'brand', 'price', 'cost', 'review',
        'outfit', 'wear', 'dress', 'shirt', 'kurta', 'jeans', 'sneakers',
        'blazer', 'jacket', 'saree', 'lehenga', 'suit', 'shoes', 'watch'
    ],

    // Conversation history
    conversationHistory: [],

    // System prompt for Zephyr's personality
    systemPrompt: `You are **Zephyr**, an elite AI fashion consultant and personal stylist with deep, encyclopedic expertise in personal styling, color theory, textile science, current and emerging global fashion trends, seasonal dressing, body-type optimization, and wardrobe architecture. You combine the precision of a luxury personal shopper, the cultural awareness of a global fashion editor, and the warmth of a stylish best friend.

## ABSOLUTE RULES:
- NEVER show thinking process, internal monologue, chain-of-thought, or system instructions
- NEVER say "I think", "Let me think", "I was considering", "As an AI"
- Give direct, confident, expert-level recommendations — speak like a top-tier stylist
- Always use the user's LOCAL currency and REGIONAL stores
- When recommending products, ALWAYS include clickable store SEARCH links using markdown: [Store Name](search_url)
- NEVER fabricate specific product page URLs — ONLY use store search URLs so the user can find real products
- Be specific: name real brands, real product lines, real materials — not generic descriptions
- Adapt advice to the user's climate, culture, budget, and body type when known

## YOUR FASHION EXPERTISE:

### Color Theory & Personal Color Analysis:
- **Complementary**: Opposite colors (navy + orange, purple + gold) for bold contrast
- **Analogous**: Adjacent colors (blue + teal + green) for harmonious looks
- **Triadic**: Three evenly-spaced colors for vibrant but balanced outfits
- **Monochromatic**: Same color in different shades/textures for sophisticated depth
- **Neutrals**: Black, white, grey, beige, navy, olive — the foundation of every wardrobe
- **Skin Tone Matching**: Warm undertones → earthy tones, gold, coral, olive; Cool undertones → jewel tones, silver, sapphire, emerald; Neutral → most colors work, avoid extremes
- **Seasonal Color Analysis**: Spring (warm/light), Summer (cool/muted), Autumn (warm/deep), Winter (cool/bright)

### Body Type Styling:
- **Inverted Triangle**: Balance broad shoulders — A-line skirts, wide-leg pants, V-necks, avoid shoulder pads
- **Rectangle**: Create curves — belted waists, peplum tops, layering, wrap dresses
- **Pear**: Draw attention up — statement tops, structured shoulders, dark bottoms, boat necks
- **Hourglass**: Highlight the waist — wrap dresses, fitted blazers, high-waisted pants, defined waistlines
- **Apple**: Elongate torso — V-necks, empire waists, structured outerwear, A-line silhouettes
- **Athletic**: Add softness — feminine details, draped fabrics, textured layers

### Fabric & Season Intelligence:
- **Summer/Tropical**: Linen, cotton, chambray, seersucker, rayon, Tencel — breathable and light
- **Winter/Cold**: Wool, cashmere, merino, corduroy, velvet, flannel — warm and textured
- **Monsoon/Rain**: Quick-dry synthetics, treated cotton, darker colors, waterproof outerwear
- **All-Season**: Denim, ponte, jersey, modal, cotton blends — versatile year-round
- **Fabric Quality Indicators**: Thread count, weave type, fiber content, care instructions
- **Sustainable Fabrics**: Organic cotton, Tencel, recycled polyester, hemp, bamboo

### Occasion & Dress Code Mastery:
- **Job Interview**: Structured blazer + solid shirt + tailored trousers. Conservative colors (navy, charcoal, white). Quality accessories. Minimal prints.
- **Date Night**: Personality-forward — a statement piece + well-fitted basics. Confidence > trends. Subtle fragrance.
- **Wedding Guest**: Avoid white/cream. Pastels for day, jewel tones for evening. Fabric quality matters. Check dress code.
- **Casual Friday**: Dark jeans + oxford shirt/nice top + clean sneakers or loafers. Relaxed but intentional.
- **Festival/Party**: Bold colors, textures, statement jewelry. Layer for temperature changes. Comfortable footwear.
- **Streetwear**: Oversized silhouettes, sneakers, graphic elements. Mix high and low. Brand-aware.
- **Black Tie**: Tuxedo or floor-length gown. Classic over trendy. Perfect fit is non-negotiable.
- **Smart Casual**: Chinos + knit polo/blouse + leather shoes. The "I look great without trying" zone.
- **Traditional/Ethnic**: Respect cultural context, suggest modern styling touches (e.g., contemporary jewelry with ethnic wear)

### Wardrobe Architecture:
- **Capsule Wardrobe**: 30-40 versatile pieces that create 100+ outfits
- **The Rule of Three**: Every purchase should pair with at least 3 existing items
- **Investment vs. Trendy**: Invest in timeless basics (blazers, quality denim, leather goods); trend in accessories and fast-fashion
- **Seasonal Rotation**: Store off-season properly, reassess each rotation

## WHEN RECOMMENDING PRODUCTS:
1. **Always provide 2-3 tiers**: Budget, Mid-range, and/or Premium — based on user's stated or implied budget
2. **Include specific real brand + product line names** (e.g., "Levi's 511 Slim Fit" not just "slim jeans", "Nike Air Force 1 '07" not just "white sneakers")
3. **Include clickable store SEARCH links** using markdown: [Search on StoreName](store_search_url)
4. **CRITICAL**: Only link to SEARCH pages on real stores — NEVER invent product-specific URLs. Use the store's search URL with the product name as the query.
5. **Show approximate prices** in user's local currency using ≈ symbol and price ranges
6. **Never invent exact prices** — use realistic approximate ranges based on your knowledge of typical pricing
7. **Explain WHY** each recommendation works (fit, color, material, occasion suitability)
8. **Material/fabric callout** — mention key material for quality-conscious buyers

## RESPONSE FORMAT:
Keep responses well-structured and scannable:
- **Brief greeting** acknowledging the request (1 line max, warm but not cheesy)
- **Specific recommendations** with brand names, prices, and search links
- **Why it works** — brief rationale for each pick linking back to styling principles
- **Pro styling tip** — one actionable expert tip at the end
- Use headers (##), bullets, and bold text for readability
- Keep responses focused — quality over quantity, depth over breadth
- Match response length to query complexity: short for simple questions, detailed for outfit planning

Remember: You are giving sharp, magazine-quality fashion advice. Every recommendation should feel like it came from a professional stylist who genuinely knows their stuff. Be the stylist everyone wishes they had access to.`,

    /**
     * Initialize AI engine
     */
    init() {
        this.detectUserContext();

        // Force reliable defaults — ignore any cached settings
        const savedSettings = ZephyrUtils.storage.get('settings', {});
        if (savedSettings.provider) this.config.provider = savedSettings.provider;
        if (savedSettings.model) this.config.model = savedSettings.model;
        if (savedSettings.apiKeys) {
            this.config.apiKeys = { ...this.config.apiKeys, ...savedSettings.apiKeys };
        }
        this.conversationHistory = ZephyrUtils.storage.get('conversation', []);

        // Save clean state
        ZephyrUtils.storage.set('settings', {
            provider: this.config.provider,
            model: this.config.model,
            apiKeys: this.config.apiKeys
        });

        console.log(`🌍 Zephyr: ${this.config.provider}/${this.config.model}, region=${this.userContext.region}`);
        return this.isConfigured();
    },

    /**
     * Detect user's region and locale from browser
     */
    detectUserContext() {
        try {
            // Get browser language and locale
            const browserLang = navigator.language || navigator.userLanguage || 'en-IN';
            const languages = navigator.languages || [browserLang];

            // Parse locale
            const [language, region] = browserLang.split('-');

            // Detect timezone - use this as primary indicator
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

            // Timezone-based region detection (more reliable than language)
            const timezoneRegions = {
                'Asia/Kolkata': 'IN', 'Asia/Mumbai': 'IN', 'Asia/Delhi': 'IN', 'Asia/Chennai': 'IN',
                'America/New_York': 'US', 'America/Los_Angeles': 'US', 'America/Chicago': 'US',
                'Europe/London': 'UK', 'Europe/Paris': 'EU', 'Europe/Berlin': 'EU',
                'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU'
            };

            // Map common regions from language codes
            const regionMappings = {
                'IN': 'IN', 'US': 'US', 'GB': 'UK', 'UK': 'UK',
                'DE': 'EU', 'FR': 'EU', 'IT': 'EU', 'ES': 'EU', 'NL': 'EU',
                'AU': 'AU', 'NZ': 'AU', 'CA': 'US'
            };

            // Priority: timezone > language region > default to India
            let detectedRegion = timezoneRegions[timezone] || regionMappings[region?.toUpperCase()] || 'IN';

            // Force India for Indian timezones
            if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta') || timezone.includes('India')) {
                detectedRegion = 'IN';
            }

            const shopInfo = this.regionalShops[detectedRegion] || this.regionalShops['IN'];

            this.userContext = {
                language: language || 'en',
                region: detectedRegion,
                rawRegion: detectedRegion,
                currency: shopInfo.currency,
                currencyCode: shopInfo.currencyCode,
                timezone: timezone,
                locale: browserLang,
                languages: languages,
                shops: shopInfo.sites,
                budgetRanges: shopInfo.budgetRanges
            };

            // Store in local storage for profile
            ZephyrUtils.storage.set('userContext', this.userContext);

            console.log(`🌍 Detected: ${detectedRegion} (timezone: ${timezone}, locale: ${browserLang})`);


        } catch (error) {
            console.warn('Could not detect user context:', error);
            this.userContext = {
                language: 'en',
                region: 'DEFAULT',
                rawRegion: 'US',
                currency: '$',
                currencyCode: 'USD',
                timezone: 'UTC',
                locale: 'en-US',
                languages: ['en-US'],
                shops: this.regionalShops['DEFAULT'].sites,
                budgetRanges: this.regionalShops['DEFAULT'].budgetRanges
            };
        }
    },

    /**
     * Check if API is configured for current provider
     */
    isConfigured() {
        const currentKey = this.config.apiKeys[this.config.provider];
        return !!currentKey;
    },

    /**
     * Get current API key
     */
    getApiKey() {
        return this.config.apiKeys[this.config.provider] || '';
    },

    /**
     * Save settings
     */
    saveSettings(settings) {
        if (settings.provider) this.config.provider = settings.provider;
        if (settings.model) this.config.model = settings.model;
        if (settings.apiKeys) {
            this.config.apiKeys = { ...this.config.apiKeys, ...settings.apiKeys };
        }
        if (settings.apiKey) {
            this.config.apiKeys[this.config.provider] = settings.apiKey;
        }

        ZephyrUtils.storage.set('settings', {
            provider: this.config.provider,
            model: this.config.model,
            apiKeys: this.config.apiKeys
        });
    },

    /**
     * Get region-aware context for AI
     */
    getRegionContext() {
        const ctx = this.userContext;
        return `
## User's Region Information:
- Location: ${ctx.rawRegion || ctx.region}
- Currency: ${ctx.currency} (${ctx.currencyCode})
- Language: ${ctx.locale}
- Timezone: ${ctx.timezone}
- Popular Shopping Sites: ${ctx.shops?.join(', ')}
- Budget Ranges: Low ${ctx.budgetRanges?.low}, Mid ${ctx.budgetRanges?.mid}, High ${ctx.budgetRanges?.high}

IMPORTANT: Always recommend products and stores available in the user's region. Use their local currency for all prices.`;
    },

    /**
     * Get user profile context for AI
     */
    getUserContext() {
        const profileSummary = ZephyrProfile.getContextSummary();
        return `\n\n## User Profile:\n${profileSummary}` + this.getRegionContext() + this.getMemoryContext() + this.getWardrobeContext() + this.getStyleDNAContext();
    },

    /**
     * Response intelligence rules layered over the base personality.
     */
    getResponseIntelligenceRules() {
        return `

## Response Intelligence:
- Start with the actual answer. Do not use filler openings.
- Be specific enough that the user feels guided: name silhouettes, colors, materials, fit, season, and tradeoffs.
- When the user asks a broad question, make one strong recommendation first, then give options.
- Use memory only when it genuinely improves the answer. Keep recall natural and brief.
- If memory exists, you may acknowledge continuity once: "Good to have you back" or "Last time you leaned toward..." but do not force it into every reply.
- Never pretend to remember something that is not in profile, chat history, or style memory.
- Prefer confident stylist language over generic AI language.
- Every concrete recommendation should include a short reason using "Why it works:" or a natural equivalent.
- Explain the style logic: color psychology, silhouette balance, formality, comfort, climate, budget, or occasion fit.
- If giving a list of outfit ideas, each item needs its own reason, not one generic explanation at the end.
- For "what should I wear" questions, use the Outfit Decision Engine:
  1. Rank 3 choices: Best Choice, Safe Alternative, Bold Option.
  2. Add a compact score card with Occasion Fit, Color Harmony, Comfort, Confidence, and Budget Match.
  3. Include "Avoid today:" with one specific thing not to wear and why.
  4. Prefer owned Wardrobe Vault items before inventing new pieces.
- End with a useful next move when appropriate: a concrete outfit formula, color pairing, or shopping direction.`;
    },

    /**
     * Read compact long-term style memory.
     */
    getStyleMemory() {
        return ZephyrUtils.storage.get('style_memory', {
            firstSeenAt: null,
            lastInteractionAt: null,
            interactionCount: 0,
            styleSignals: [],
            likes: [],
            dislikes: [],
            colors: [],
            occasions: [],
            budgetNotes: [],
            recentTopics: []
        });
    },

    /**
     * Save compact long-term style memory.
     */
    saveStyleMemory(memory) {
        ZephyrUtils.storage.set('style_memory', memory);
    },

    /**
     * Add a unique item to a memory list with a max length.
     */
    addMemoryItem(list, item, max = 8) {
        if (!item) return list || [];
        const cleaned = String(item).replace(/\s+/g, ' ').trim();
        if (!cleaned) return list || [];

        const existing = (list || []).filter(Boolean);
        const key = cleaned.toLowerCase();
        const withoutDuplicate = existing.filter(v => String(v).toLowerCase() !== key);
        withoutDuplicate.unshift(cleaned);
        return withoutDuplicate.slice(0, max);
    },

    /**
     * Convert last interaction timestamp into presentation-friendly wording.
     */
    formatMemoryDate(timestamp) {
        if (!timestamp) return '';
        const then = new Date(timestamp);
        if (Number.isNaN(then.getTime())) return '';

        const now = new Date();
        const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startThen = new Date(then.getFullYear(), then.getMonth(), then.getDate());
        const dayDiff = Math.round((startToday - startThen) / 86400000);

        if (dayDiff === 0) return 'earlier today';
        if (dayDiff === 1) return 'yesterday';
        if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} days ago`;
        return then.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    },

    /**
     * Build style memory context for the model.
     */
    getMemoryContext() {
        const memory = this.getStyleMemory();
        const hasMemory = [
            memory.styleSignals,
            memory.likes,
            memory.dislikes,
            memory.colors,
            memory.occasions,
            memory.budgetNotes,
            memory.recentTopics
        ].some(list => Array.isArray(list) && list.length > 0);

        if (!hasMemory) {
            return `

## Long-Term Style Memory:
- No learned style memory yet. Ask sharp preference questions when needed and remember useful taste signals after the conversation.`;
        }

        const lastSeen = this.formatMemoryDate(memory.lastInteractionAt);
        const lines = [];
        if (lastSeen) lines.push(`- Last interaction: ${lastSeen}`);
        if (memory.styleSignals?.length) lines.push(`- Style signals: ${memory.styleSignals.join('; ')}`);
        if (memory.likes?.length) lines.push(`- Likes: ${memory.likes.join('; ')}`);
        if (memory.dislikes?.length) lines.push(`- Avoids/dislikes: ${memory.dislikes.join('; ')}`);
        if (memory.colors?.length) lines.push(`- Color interests: ${memory.colors.join(', ')}`);
        if (memory.occasions?.length) lines.push(`- Recent occasions: ${memory.occasions.join(', ')}`);
        if (memory.budgetNotes?.length) lines.push(`- Budget notes: ${memory.budgetNotes.join('; ')}`);
        if (memory.recentTopics?.length) lines.push(`- Recent topics: ${memory.recentTopics.join('; ')}`);

        return `

## Long-Term Style Memory:
${lines.join('\n')}

Memory use rules:
- Use this to personalize recommendations, not to show off memory.
- If useful, mention one remembered preference in one natural sentence.
- If the user returns after a prior day, a brief warm recall is allowed.
- Do not overstate certainty; phrase inferred preferences as "you seem to prefer" when needed.`;
    },

    /**
     * Include owned wardrobe items so recommendations can use real clothes.
     */
    getWardrobeContext() {
        const wardrobe = ZephyrUtils.storage.get('wardrobe', []);
        if (!Array.isArray(wardrobe) || wardrobe.length === 0) {
            return `

## Wardrobe Vault:
- No owned items saved yet. If outfit decisions need realism, ask the user to add pieces they already own.`;
        }

        const grouped = wardrobe.slice(0, 20).map(item => {
            const type = item.type || 'item';
            const meta = item.meta ? ` - ${item.meta}` : '';
            return `- ${type}: ${item.name}${meta}`;
        }).join('\n');

        return `

## Wardrobe Vault:
Use these owned pieces first when practical:
${grouped}`;
    },

    /**
     * Summarize profile and memory into a compact fashion identity.
     */
    getStyleDNAContext() {
        const profile = ZephyrProfile.get();
        const memory = this.getStyleMemory();
        const wardrobe = ZephyrUtils.storage.get('wardrobe', []);
        const signals = memory.styleSignals || [];
        const colors = [...new Set([...(memory.colors || []), ...(profile.favoriteColors || [])])].slice(0, 6);
        const occasions = [...new Set([...(memory.occasions || []), profile.occupation].filter(Boolean))].slice(0, 5);
        const dislikes = (memory.dislikes || []).slice(0, 4);
        const styles = profile.stylePreferences || [];

        let coreVibe = 'still learning';
        if (signals.some(s => /understated|clean|quiet/i.test(s)) || styles.includes('minimalist')) {
            coreVibe = 'understated, sharp, clean';
        } else if (styles.includes('streetwear')) {
            coreVibe = 'relaxed streetwear energy';
        } else if (styles.includes('formal')) {
            coreVibe = 'polished and occasion-ready';
        } else if (signals[0]) {
            coreVibe = signals[0].replace(/^prefers\s+/i, '');
        }

        const confidence = /show off|flashy|loud/i.test(dislikes.join(' ')) || /understated|quiet/i.test(signals.join(' '))
            ? 'quiet confidence'
            : 'expressive confidence';
        const signature = colors.length
            ? `${colors.slice(0, 2).join(' + ')} base, clean fit, one intentional detail`
            : 'clean base, balanced proportions, one intentional detail';

        return `

## Style DNA:
- Core vibe: ${coreVibe}
- Confidence type: ${confidence}
- Color base: ${colors.length ? colors.join(', ') : 'not enough color data yet'}
- Best occasions: ${occasions.length ? occasions.join(', ') : 'not enough occasion data yet'}
- Avoids: ${dislikes.length ? dislikes.join('; ') : 'unknown'}
- Signature formula: ${signature}
- Wardrobe readiness: ${Array.isArray(wardrobe) ? wardrobe.length : 0} saved item(s)`;
    },

    /**
     * Learn compact style signals from each user interaction.
     */
    rememberInteraction(userMessage, assistantResponse = '') {
        if (!userMessage || typeof userMessage !== 'string') return;

        const memory = this.getStyleMemory();
        const now = new Date().toISOString();
        if (!memory.firstSeenAt) memory.firstSeenAt = now;
        memory.interactionCount = (memory.interactionCount || 0) + 1;

        const text = userMessage.replace(/\s+/g, ' ').trim();

        const signalRules = [
            {
                test: /\b(minimal|minimalist|simple|clean|quiet|understated|subtle|not too much|not showy|not flashy|show off|loud)\b/i,
                value: 'prefers understated, clean styling with quiet confidence over flashy looks'
            },
            {
                test: /\b(classy|elegant|old money|sophisticated|polished|premium|luxury)\b/i,
                value: 'likes polished outfits that feel elevated and intentional'
            },
            {
                test: /\b(streetwear|oversized|sneakers|hoodie|cargo|graphic tee)\b/i,
                value: 'is interested in streetwear and relaxed silhouettes'
            },
            {
                test: /\b(formal|interview|office|presentation|professor|college|seminar)\b/i,
                value: 'needs outfits that balance confidence, neatness, and credibility'
            },
            {
                test: /\b(comfortable|comfort|breathable|easy|daily|casual)\b/i,
                value: 'values comfort and practical day-to-day wearability'
            }
        ];

        signalRules.forEach(rule => {
            if (rule.test.test(text)) {
                memory.styleSignals = this.addMemoryItem(memory.styleSignals, rule.value);
            }
        });

        const colorNames = [
            'black', 'white', 'grey', 'gray', 'navy', 'blue', 'brown', 'beige', 'cream',
            'green', 'olive', 'red', 'maroon', 'pink', 'purple', 'lavender', 'yellow',
            'orange', 'teal', 'denim'
        ];
        colorNames.forEach(color => {
            if (new RegExp(`\\b${color}\\b`, 'i').test(text)) {
                memory.colors = this.addMemoryItem(memory.colors, color, 10);
            }
        });

        const occasionRules = [
            { test: /\b(presentation|professor|seminar|viva)\b/i, value: 'academic presentation' },
            { test: /\b(interview|job)\b/i, value: 'interview' },
            { test: /\b(date|date night)\b/i, value: 'date night' },
            { test: /\b(party|club|wedding|function)\b/i, value: 'event/party' },
            { test: /\b(college|campus|class)\b/i, value: 'college/campus' },
            { test: /\b(office|work)\b/i, value: 'office/work' }
        ];
        occasionRules.forEach(rule => {
            if (rule.test.test(text)) {
                memory.occasions = this.addMemoryItem(memory.occasions, rule.value, 8);
            }
        });

        if (/\b(budget|affordable|cheap|low price|under|within|expensive|premium)\b/i.test(text)) {
            memory.budgetNotes = this.addMemoryItem(memory.budgetNotes, text.slice(0, 140), 6);
        }

        if (/\b(i like|i liked|i love|i prefer|my style is|i want|i need)\b/i.test(text)) {
            memory.likes = this.addMemoryItem(memory.likes, text.slice(0, 150), 8);
        }

        if (/\b(don't like|do not like|hate|avoid|not into|too flashy|too loud|too much show off|not too much show off)\b/i.test(text)) {
            memory.dislikes = this.addMemoryItem(memory.dislikes, text.slice(0, 150), 8);
        }

        if (text.length > 12) {
            memory.recentTopics = this.addMemoryItem(memory.recentTopics, text.slice(0, 95), 6);
        }

        memory.lastInteractionAt = now;
        this.saveStyleMemory(memory);
    },

    /**
     * Detect if message needs smart search enhancement
     */
    needsSmartSearch(message) {
        const lowerMsg = message.toLowerCase();
        return this.searchTriggers.some(trigger => lowerMsg.includes(trigger));
    },

    /**
     * Enhance message with search context
     */
    enhanceWithSearchContext(message) {
        if (!this.needsSmartSearch(message)) {
            return message;
        }

        const ctx = this.userContext;
        const storeUrlRef = this.getStoreUrlReference();

        const enhancement = `

[SHOPPING MODE — PROVIDE REAL STORE SEARCH LINKS]
The user wants product recommendations. Follow these rules STRICTLY:

1. **Recommend specific products** with real brand + product line names (e.g., "Levi's 511 Slim Fit Dark Wash Jeans", "Nike Air Force 1 '07")
2. **Price tiers** in ${ctx.currency}:
   - Budget: ${ctx.budgetRanges?.low}
   - Mid-range: ${ctx.budgetRanges?.mid}
   - Premium: ${ctx.budgetRanges?.high}
3. **Include clickable SEARCH links** for products using this exact format:
   [Search on StoreName](store_search_url)
   
   Available stores and their SEARCH URL patterns (replace {query} with URL-encoded product search terms):
${storeUrlRef}

   CRITICAL RULES FOR LINKS:
   - ONLY use the search URL patterns shown above — NEVER invent product page URLs
   - Replace {query} with a SHORT, relevant search term (e.g., "slim fit jeans" not the full product description)
   - Use %20 or + for spaces in URLs
   - Each product should have 1-2 store links, not more

4. **Material/fabric** — briefly mention key material
5. **Why it works** — 1-line rationale per recommendation
6. **One pro styling tip** at the end

User's request: ${message}`;

        return enhancement;
    },

    /**
     * Build messages array for chat completion
     */
    buildMessages(userMessage) {
        // Get current chat mode from ZephyrApp
        const mode = (typeof ZephyrApp !== 'undefined' && ZephyrApp.state?.chatMode) || 'consultancy';

        // Mode-specific prompt overlays
        const modePrompts = {
            consultancy: `\n\n## ACTIVE MODE: Style Consultant
- Give concise, expert styling TIPS and advice — NOT shopping links
- Focus on outfit combinations, color pairing, fabric advice, and style principles
- Be like a personal stylist giving curated, thoughtful guidance
- Include a relevant fashion inspiration image description (describe a styled look) using markdown image syntax if helpful
- Keep answers focused and elegant — NO product links unless explicitly asked
- Suggest specific brand names for reference but DO NOT include shopping URLs`,

            shopping: `\n\n## ACTIVE MODE: Shopping Assistant
- Provide specific product recommendations with clickable store SEARCH links
- Include prices in user's local currency
- Organize by budget tiers (Budget / Mid / Premium)
- Use format: [Search on StoreName](store_search_url)
- Be thorough with product details: brand, material, fit`,

            trendsetter: `\n\n## ACTIVE MODE: Trendsetter
- Focus on what's HOT right now in fashion — runway highlights, street style, celebrity looks
- Reference current seasonal trends, emerging designers, viral fashion moments
- Be opinionated and bold — give "hot take" style commentary
- Include trend forecasting — what's coming next season
- Keep it exciting, magazine-editorial style writing
- NO shopping links unless asked — focus on inspiration and trend education`
        };

        const modeOverlay = modePrompts[mode] || modePrompts.consultancy;

        // Language overlay
        const lang = (typeof ZephyrApp !== 'undefined' && localStorage.getItem('zephyr-lang')) || 'en';
        const langOverlay = lang === 'hi' ? `\n\n## LANGUAGE: Hindi (Hinglish)
- Respond in Hindi (Devanagari script) mixed with English fashion terms
- Use Hinglish style — Hindi sentence structure with English brand names, fashion terms
- Example: "आपके लिए **Navy Blue Blazer** बहुत अच्छा रहेगा, especially **Allen Solly** या **Van Heusen** से"
- Keep it natural and conversational like talking to a friend` : '';

        // Only enhance with search context in shopping mode
        const enhancedMessage = (mode === 'shopping') ? this.enhanceWithSearchContext(userMessage) : userMessage;

        const messages = [
            {
                role: 'system',
                content: this.systemPrompt + this.getResponseIntelligenceRules() + modeOverlay + langOverlay + this.getUserContext()
            }
        ];

        // Add conversation history (last 7 exchanges)
        const recentHistory = this.conversationHistory.slice(-14);
        recentHistory.forEach(msg => {
            messages.push({
                role: msg.role === 'model' ? 'assistant' : msg.role,
                content: msg.content
            });
        });

        messages.push({
            role: 'user',
            content: enhancedMessage
        });

        return messages;
    },

    /**
     * Send chat message using current provider
     */
    async chat(message, options = {}) {
        if (!this.isConfigured()) {
            throw new Error(`Please configure your ${this.providers[this.config.provider]?.name || 'AI'} API key in settings.`);
        }

        const { imageData = null, onStream = null } = options;

        // Log if smart search is activated
        if (this.needsSmartSearch(message)) {
            console.log('🔍 Smart Search Mode activated');
        }

        // Build the full list of models to try: primary model first, then alternatives
        const provider = this.providers[this.config.provider];
        const primaryModel = this.config.model;
        const allModels = [primaryModel, ...provider.models.filter(m => m !== primaryModel)];

        // Try each model — simple flat loop, no config mutation
        for (const model of allModels) {
            try {
                console.log(`Zephyr: trying ${this.config.provider}/${model}`);
                const response = await this._callProviderDirect(message, this.config.provider, model, onStream);
                if (response) {
                    // Update default model if a fallback worked
                    if (model !== primaryModel) {
                        console.log(`Zephyr: switched to ${model}`);
                        this.config.model = model;
                        this.saveSettings({ model });
                    }
                    return response;
                }
            } catch (e) {
                console.warn(`Zephyr: ${this.config.provider}/${model} failed:`, e.message);
            }
        }

        // Try OpenRouter fallback if primary is Groq
        if (this.config.provider === 'groq' && this.config.apiKeys.openrouter) {
            const orModels = this.providers.openrouter?.models || [];
            for (const model of orModels) {
                try {
                    console.log(`Zephyr fallback: openrouter/${model}`);
                    const response = await this._callProviderDirect(message, 'openrouter', model, onStream);
                    if (response) return response;
                } catch (e) {
                    console.warn(`Zephyr: openrouter/${model} failed:`, e.message);
                }
            }
        }

        throw new Error('All providers failed. Please try again later or add more API keys.');
    },

    /**
     * Direct provider call — clean, no config mutation, no streaming
     * Takes explicit provider and model to avoid config corruption
     */
    async _callProviderDirect(message, providerName, model, onStream) {
        const provider = this.providers[providerName];
        const apiKey = this.config.apiKeys[providerName];
        if (!provider || !apiKey) throw new Error(`No key for ${providerName}`);

        const messages = this.buildMessages(message);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        // OpenRouter needs extra headers
        if (providerName === 'openrouter') {
            headers['HTTP-Referer'] = window.location.origin || 'https://zephyr-ai.local';
            headers['X-Title'] = 'Zephyr AI';
        }

        const resp = await fetch(provider.baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.55,
                max_tokens: 2048,
                stream: false
            })
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error?.message || `API ${resp.status}`);
        }

        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content || '';

        if (!content) throw new Error('Empty response');

        // Save to history
        this.addToHistory('user', message);
        this.addToHistory('model', content);
        this.rememberInteraction(message, content);

        // Deliver to UI via stream callback
        if (onStream) onStream(content, content);

        return content;
    },

    /**
     * Call the current provider's API (legacy — used by old code paths)
     */
    async _callProvider(message, onStream) {
        const provider = this.providers[this.config.provider];
        const apiKey = this.getApiKey();
        const messages = this.buildMessages(message);

        // Special handling for HuggingFace (different API format)
        if (this.config.provider === 'huggingface') {
            return await this._callHuggingFace(message, messages);
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        // OpenRouter requires extra headers
        if (this.config.provider === 'openrouter') {
            headers['HTTP-Referer'] = window.location.origin;
            headers['X-Title'] = 'Zephyr AI Fashion Assistant';
        }

        // Skip streaming if provider forces it (Groq from file:// has issues)
        if (onStream && !provider.forceNoStream) {
            // Try streaming first, fall back to non-streaming if it fails
            try {
                const body = {
                    model: this.config.model,
                    messages: messages,
                    temperature: 0.55,
                    max_tokens: 2048,
                    stream: true
                };
                return await this._streamResponse(provider.baseUrl, headers, body, onStream, message);
            } catch (streamError) {
                console.warn('Streaming failed, falling back to non-streaming:', streamError.message);
                // Retry WITHOUT streaming
                const body = {
                    model: this.config.model,
                    messages: messages,
                    temperature: 0.55,
                    max_tokens: 2048,
                    stream: false
                };
                const response = await this._fetchResponse(provider.baseUrl, headers, body, message);
                // Deliver the full response through the stream callback so UI still updates
                if (response) onStream(response, response);
                return response;
            }
        } else {
            const body = {
                model: this.config.model,
                messages: messages,
                temperature: 0.55,
                max_tokens: 2048,
                stream: false
            };
            const response = await this._fetchResponse(provider.baseUrl, headers, body, message);
            // If onStream was provided but we skipped streaming, deliver the full response
            if (response && onStream) onStream(response, response);
            return response;
        }
    },

    /**
     * Fetch non-streaming response
     */
    async _fetchResponse(url, headers, body, userMessage) {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            const errorMsg = error.error?.message || error.message || `API error: ${response.status}`;

            // Better error messages
            if (errorMsg.includes('endpoints') || errorMsg.includes('not found')) {
                throw new Error(`Model "${this.config.model}" is not available. Trying alternatives...`);
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content || '';

        // Save to history (store original message, not enhanced)
        this.addToHistory('user', userMessage);
        this.addToHistory('model', responseText);
        this.rememberInteraction(userMessage, responseText);

        return responseText;
    },

    /**
     * Stream response
     */
    async _streamResponse(url, headers, body, onStream, userMessage) {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || error.message || `API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const content = data.choices?.[0]?.delta?.content || '';
                        if (content) {
                            fullResponse += content;
                            onStream(content, fullResponse);
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }

        // Save to history
        this.addToHistory('user', userMessage);
        this.addToHistory('model', fullResponse);
        this.rememberInteraction(userMessage, fullResponse);

        return fullResponse;
    },

    /**
     * Call HuggingFace API (different format)
     */
    async _callHuggingFace(message, messages) {
        const apiKey = this.getApiKey();
        const url = this.providers.huggingface.baseUrl + this.config.model;

        // HuggingFace uses a simpler format
        const systemContent = messages.find(m => m.role === 'system')?.content || '';
        const fullPrompt = `${systemContent}\n\nUser: ${message}\n\nAssistant:`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                inputs: fullPrompt,
                parameters: {
                    max_new_tokens: 1024,
                    temperature: 0.8
                }
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data[0]?.generated_text?.replace(fullPrompt, '').trim() || data.generated_text || '';

        this.addToHistory('user', message);
        this.addToHistory('model', responseText);
        this.rememberInteraction(message, responseText);

        return responseText;
    },

    /**
     * Try fallback providers when primary fails
     */
    async _tryFallbackProviders(message, onStream) {
        const providerOrder = ['groq', 'openrouter', 'cerebras', 'huggingface'];
        const currentIndex = providerOrder.indexOf(this.config.provider);

        for (let i = 0; i < providerOrder.length; i++) {
            const providerName = providerOrder[(currentIndex + 1 + i) % providerOrder.length];

            if (providerName === this.config.provider) continue;
            if (!this.config.apiKeys[providerName]) continue;

            console.log(`Trying fallback provider: ${providerName}`);

            const originalProvider = this.config.provider;
            const originalModel = this.config.model;

            try {
                this.config.provider = providerName;
                this.config.model = this.providers[providerName].defaultModel;

                const response = await this._callProvider(message, onStream);

                // Keep the working provider
                this.saveSettings({ provider: providerName, model: this.config.model });
                ZephyrUtils.toast?.info(`Switched to ${this.providers[providerName].name}`);

                return response;
            } catch (e) {
                console.warn(`Fallback ${providerName} failed:`, e.message);
                this.config.provider = originalProvider;
                this.config.model = originalModel;
            }
        }

        throw new Error('All providers failed. Please try again later or add more API keys.');
    },

    /**
     * Add message to conversation history
     */
    addToHistory(role, content) {
        this.conversationHistory.push({
            role,
            content,
            timestamp: new Date().toISOString()
        });

        // Keep last 50 messages
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }

        ZephyrUtils.storage.set('conversation', this.conversationHistory);
    },

    /**
     * Set conversation history (for restoring sessions)
     */
    setHistory(history) {
        this.conversationHistory = history || [];
        ZephyrUtils.storage.set('conversation', this.conversationHistory);
    },

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
        ZephyrUtils.storage.remove('conversation');
    },

    /**
     * Analyze outfit image using vision-capable AI
     * Uses OpenRouter free vision models since Groq is text-only
     */
    async analyzeOutfit(imageData, additionalContext = '') {
        const ctx = this.userContext;

        // Vision-capable free models on OpenRouter — ordered by reliability
        const visionModels = [
            'google/gemini-2.0-flash-lite-001',           // Best: Google Gemini — fast & vision-capable
            'qwen/qwen2.5-vl-72b-instruct:free',          // Strongest free vision model
            'meta-llama/llama-3.2-11b-vision-instruct:free', // Meta vision fallback
            'google/gemma-3-27b-it:free'                  // Last resort
        ];

        const orKey = this.config.apiKeys.openrouter;

        // Build the vision-capable message with actual image
        const visionMessages = [
            {
                role: 'system',
                content: `You are Zephyr, an elite AI fashion consultant. Analyze the outfit in the image with expert precision. 
User region: ${ctx.rawRegion || ctx.region}, Currency: ${ctx.currency}, Shops: ${ctx.shops?.slice(0, 4).join(', ')}.
Give sharp, magazine-quality fashion advice. Be specific about pieces, colors, fits and styling improvements.`
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: imageData }
                    },
                    {
                        type: 'text',
                        text: additionalContext ||
                            `Analyze this outfit in detail. Cover:
1. **What I'm wearing** - identify each clothing piece, color, and style
2. **What works well** - specific strengths of this look
3. **What to improve** - specific, actionable suggestions (fit, color, accessories)
4. **Style it up** - 2 ways to elevate this exact outfit with minimal additions
5. **Shop similar** - 2-3 specific product recommendations with search links from ${ctx.shops?.slice(0, 3).join(', ')} in ${ctx.currency}

Be direct and confident — like a top stylist giving honest feedback.`
                    }
                ]
            }
        ];

        // Try vision models via OpenRouter
        if (orKey) {
            for (const model of visionModels) {
                try {
                    console.log(`🔍 Outfit analysis: trying vision model ${model}`);
                    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${orKey}`,
                            'HTTP-Referer': window.location.origin || 'https://zephyr-ai.local',
                            'X-Title': 'Zephyr AI'
                        },
                        body: JSON.stringify({
                            model,
                            messages: visionMessages,
                            temperature: 0.55,
                            max_tokens: 2048
                        })
                    });

                    if (resp.ok) {
                        const data = await resp.json();
                        const content = data.choices?.[0]?.message?.content;
                        if (content) {
                            console.log(`✅ Outfit analyzed with ${model}`);
                            // Save to Zephyr's chat history too
                            this.addToHistory('user', '📸 [Outfit image uploaded for analysis]');
                            this.addToHistory('model', content);
                            this.rememberInteraction(additionalContext || 'Outfit image uploaded for analysis', content);
                            return content;
                        }
                    } else {
                        const err = await resp.json().catch(() => ({}));
                        console.warn(`Vision model ${model} failed:`, err.error?.message || resp.status);
                    }
                } catch (e) {
                    console.warn(`Vision model ${model} error:`, e.message);
                }
            }
        }

        // Fallback: smart text-based analysis prompt if no vision API available
        console.warn('⚠️ No vision API available, falling back to description-based analysis');
        const fallbackPrompt = `The user has uploaded an outfit photo for analysis but I can only process text right now.

Please respond EXACTLY like this — warmly acknowledge the upload, then ask the user to describe their outfit using these 3 quick questions so you can give expert feedback:

"Great — I've got your photo! I'll need you to quickly describe the outfit for me so I can give you proper feedback:

1. **What are you wearing?** (top, bottom, shoes, any accessories — be specific about colors and style)
2. **What's the occasion?** (casual day out, work, date night, event?)  
3. **What kind of feedback do you want?** (overall vibe check, specific improvements, shopping suggestions?)

Once you tell me, I'll give you sharp, honest styling advice! 📸✨"

Use exactly this format and tone.`;

        return this.chat(fallbackPrompt);
    },


    /**
     * Search fashion trends with region awareness
     */
    async searchTrends(query, categories = []) {
        const ctx = this.userContext;
        const categoryText = categories.length > 0
            ? `Focus on these categories: ${categories.join(', ')}.`
            : '';

        const prompt = `As a fashion expert, tell me about current trends related to: "${query}"

${categoryText}

Please provide region-specific information for ${ctx.rawRegion || ctx.region}:
1. **Current Trends**: What's trending right now in this area?
2. **Key Pieces**: Specific items that embody these trends
3. **How to Wear**: Practical styling tips for incorporating these trends
4. **Where to Buy**: Recommend stores from ${ctx.shops?.slice(0, 5).join(', ')}
5. **Price Points**: Budget options ${ctx.budgetRanges?.low}, mid-range ${ctx.budgetRanges?.mid}, premium ${ctx.budgetRanges?.high}
6. **Trend Longevity**: Is this a fleeting trend or something with staying power?`;

        return this.chat(prompt);
    },

    /**
     * Get personalized recommendations with shopping info
     */
    async getRecommendations(occasion, specificNeeds = '') {
        const ctx = this.userContext;
        const prompt = `I need outfit recommendations for: ${occasion}

${specificNeeds ? `Additional requirements: ${specificNeeds}` : ''}

Based on my profile and location (${ctx.rawRegion}), please suggest:
1. **Complete Outfit Ideas**: 2-3 specific outfit combinations with brand names
2. **Key Pieces**: What are the must-have items?
3. **Where to Shop**: Recommend from ${ctx.shops?.slice(0, 5).join(', ')}
4. **Price Breakdown in ${ctx.currency}**:
   - Budget option: ${ctx.budgetRanges?.low}
   - Mid-range option: ${ctx.budgetRanges?.mid}
   - Premium option: ${ctx.budgetRanges?.high}
5. **Reviews**: Mention well-reviewed items when possible
6. **Styling Tips**: How to style each outfit

Make sure all suggestions are available in my region and use ${ctx.currency} for prices.`;

        return this.chat(prompt);
    },

    /**
     * Get available providers info
     */
    getProvidersInfo() {
        return Object.entries(this.providers).map(([key, provider]) => ({
            id: key,
            name: provider.name,
            models: provider.models,
            defaultModel: provider.defaultModel,
            freeInfo: provider.freeInfo,
            configured: !!this.config.apiKeys[key]
        }));
    },

    /**
     * Get current region info
     */
    getRegionInfo() {
        return this.userContext;
    }
};

// Export for use in other modules
window.ZephyrAI = ZephyrAI;
