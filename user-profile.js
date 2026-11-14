/**
 * Zephyr AI - User Profile Management
 * Handles user preferences, measurements, and budget settings
 */

const ZephyrProfile = {
    // Default profile structure
    defaultProfile: {
        // Basics
        name: '',
        gender: '',
        ageRange: '',
        climate: '',

        // Measurements
        height: '',
        heightUnit: 'cm',
        weight: '',
        weightUnit: 'kg',
        chest: '',
        waist: '',
        hips: '',
        shoeSize: '',
        shoeSizeSystem: 'eu',

        // Preferences
        stylePreferences: [],
        favoriteColors: [],
        occupation: '',

        // Budget
        currency: 'USD',
        budgetMin: '',
        budgetMax: '',
        shoppingPreferences: [],

        // Meta
        createdAt: null,
        updatedAt: null
    },

    /**
     * Get current profile
     */
    get() {
        return ZephyrUtils.storage.get('profile', { ...this.defaultProfile });
    },

    /**
     * Save profile
     */
    save(profile) {
        profile.updatedAt = new Date().toISOString();
        if (!profile.createdAt) {
            profile.createdAt = profile.updatedAt;
        }
        return ZephyrUtils.storage.set('profile', profile);
    },

    /**
     * Update specific fields
     */
    update(fields) {
        const profile = this.get();
        const updated = { ...profile, ...fields };
        return this.save(updated);
    },

    /**
     * Check if profile has essential info
     */
    hasBasicInfo() {
        const profile = this.get();
        return profile.name || profile.gender || profile.stylePreferences.length > 0;
    },

    /**
     * Get profile summary for AI context
     */
    getContextSummary() {
        const profile = this.get();
        const parts = [];

        if (profile.name) {
            parts.push(`User's name is ${profile.name}`);
        }

        if (profile.gender) {
            parts.push(`Gender: ${profile.gender}`);
        }

        if (profile.ageRange) {
            parts.push(`Age range: ${profile.ageRange}`);
        }

        if (profile.climate) {
            parts.push(`Lives in ${profile.climate} climate`);
        }

        if (profile.height && profile.heightUnit) {
            parts.push(`Height: ${profile.height}${profile.heightUnit}`);
        }

        if (profile.weight && profile.weightUnit) {
            parts.push(`Weight: ${profile.weight}${profile.weightUnit}`);
        }

        // Add body measurements if available
        const measurements = [];
        if (profile.chest) measurements.push(`chest ${profile.chest}cm`);
        if (profile.waist) measurements.push(`waist ${profile.waist}cm`);
        if (profile.hips) measurements.push(`hips ${profile.hips}cm`);
        if (measurements.length > 0) {
            parts.push(`Measurements: ${measurements.join(', ')}`);
        }

        if (profile.shoeSize) {
            parts.push(`Shoe size: ${profile.shoeSize} (${profile.shoeSizeSystem.toUpperCase()})`);
        }

        if (profile.stylePreferences.length > 0) {
            parts.push(`Preferred styles: ${profile.stylePreferences.join(', ')}`);
        }

        if (profile.favoriteColors.length > 0) {
            parts.push(`Favorite colors: ${profile.favoriteColors.join(', ')}`);
        }

        if (profile.occupation) {
            parts.push(`Occupation: ${profile.occupation}`);
        }

        if (profile.budgetMin || profile.budgetMax) {
            const budget = [];
            if (profile.budgetMin) budget.push(`min ${profile.currency} ${profile.budgetMin}`);
            if (profile.budgetMax) budget.push(`max ${profile.currency} ${profile.budgetMax}`);
            parts.push(`Budget: ${budget.join(' - ')}`);
        }

        if (profile.shoppingPreferences.length > 0) {
            parts.push(`Shopping preferences: ${profile.shoppingPreferences.join(', ')}`);
        }

        return parts.length > 0
            ? parts.join('. ') + '.'
            : 'No user profile information available yet.';
    },

    /**
     * Initialize profile form with saved data
     */
    initForm() {
        const profile = this.get();
        const { $ } = ZephyrUtils.dom;

        // Basics
        if ($('#profile-name')) $('#profile-name').value = profile.name || '';
        if ($('#profile-gender')) $('#profile-gender').value = profile.gender || '';
        if ($('#profile-age')) $('#profile-age').value = profile.ageRange || '';
        if ($('#profile-climate')) $('#profile-climate').value = profile.climate || '';

        // Measurements
        if ($('#profile-height')) $('#profile-height').value = profile.height || '';
        if ($('#profile-height-unit')) $('#profile-height-unit').value = profile.heightUnit || 'cm';
        if ($('#profile-weight')) $('#profile-weight').value = profile.weight || '';
        if ($('#profile-weight-unit')) $('#profile-weight-unit').value = profile.weightUnit || 'kg';
        if ($('#profile-chest')) $('#profile-chest').value = profile.chest || '';
        if ($('#profile-waist')) $('#profile-waist').value = profile.waist || '';
        if ($('#profile-hips')) $('#profile-hips').value = profile.hips || '';
        if ($('#profile-shoe')) $('#profile-shoe').value = profile.shoeSize || '';
        if ($('#profile-shoe-system')) $('#profile-shoe-system').value = profile.shoeSizeSystem || 'eu';

        // Preferences - checkboxes
        this.setCheckboxes('style-pref', profile.stylePreferences || []);
        this.setCheckboxes('fav-color', profile.favoriteColors || []);

        if ($('#profile-occupation')) $('#profile-occupation').value = profile.occupation || '';

        // Budget
        if ($('#profile-currency')) $('#profile-currency').value = profile.currency || 'USD';
        if ($('#profile-budget-min')) $('#profile-budget-min').value = profile.budgetMin || '';
        if ($('#profile-budget-max')) $('#profile-budget-max').value = profile.budgetMax || '';

        this.setCheckboxes('shop-pref', profile.shoppingPreferences || []);
    },

    /**
     * Set checkbox values
     */
    setCheckboxes(name, values) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
        checkboxes.forEach(cb => {
            const isChecked = values.includes(cb.value);
            cb.checked = isChecked;
            cb.closest('.form-checkbox')?.classList.toggle('selected', isChecked);
        });
    },

    /**
     * Get checkbox values
     */
    getCheckboxValues(name) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    },

    /**
     * Save form data to profile
     */
    saveForm() {
        const { $ } = ZephyrUtils.dom;

        const profile = {
            // Basics
            name: $('#profile-name')?.value || '',
            gender: $('#profile-gender')?.value || '',
            ageRange: $('#profile-age')?.value || '',
            climate: $('#profile-climate')?.value || '',

            // Measurements
            height: $('#profile-height')?.value || '',
            heightUnit: $('#profile-height-unit')?.value || 'cm',
            weight: $('#profile-weight')?.value || '',
            weightUnit: $('#profile-weight-unit')?.value || 'kg',
            chest: $('#profile-chest')?.value || '',
            waist: $('#profile-waist')?.value || '',
            hips: $('#profile-hips')?.value || '',
            shoeSize: $('#profile-shoe')?.value || '',
            shoeSizeSystem: $('#profile-shoe-system')?.value || 'eu',

            // Preferences
            stylePreferences: this.getCheckboxValues('style-pref'),
            favoriteColors: this.getCheckboxValues('fav-color'),
            occupation: $('#profile-occupation')?.value || '',

            // Budget
            currency: $('#profile-currency')?.value || 'USD',
            budgetMin: $('#profile-budget-min')?.value || '',
            budgetMax: $('#profile-budget-max')?.value || '',
            shoppingPreferences: this.getCheckboxValues('shop-pref')
        };

        return this.save(profile);
    },

    /**
     * Export profile as JSON
     */
    export() {
        const profile = this.get();
        const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zephyr-profile-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Import profile from JSON
     */
    async import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const profile = JSON.parse(e.target.result);
                    this.save(profile);
                    resolve(profile);
                } catch (err) {
                    reject(new Error('Invalid profile file'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
};

// Export for use in other modules
window.ZephyrProfile = ZephyrProfile;
