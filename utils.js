/**
 * Zephyr AI - Utility Functions
 * Common helper functions used across the application
 */

const ZephyrUtils = {
  /**
   * Safe localStorage operations
   */
  storage: {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(`zephyr_${key}`);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('Storage get error:', e);
        return defaultValue;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(`zephyr_${key}`, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Storage set error:', e);
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(`zephyr_${key}`);
        return true;
      } catch (e) {
        console.error('Storage remove error:', e);
        return false;
      }
    }
  },

  /**
   * DOM helper functions
   */
  dom: {
    $(selector) {
      return document.querySelector(selector);
    },

    $$(selector) {
      return document.querySelectorAll(selector);
    },

    create(tag, attrs = {}, children = []) {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class') {
          el.className = value;
        } else if (key === 'dataset') {
          Object.entries(value).forEach(([dataKey, dataValue]) => {
            el.dataset[dataKey] = dataValue;
          });
        } else if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          el.setAttribute(key, value);
        }
      });
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else {
          el.appendChild(child);
        }
      });
      return el;
    },

    show(el) {
      if (typeof el === 'string') el = this.$(el);
      if (el) el.classList.remove('hidden');
    },

    hide(el) {
      if (typeof el === 'string') el = this.$(el);
      if (el) el.classList.add('hidden');
    },

    toggle(el, show) {
      if (typeof el === 'string') el = this.$(el);
      if (el) el.classList.toggle('hidden', !show);
    }
  },

  /**
   * Format helpers
   */
  format: {
    date(date) {
      const d = new Date(date);
      const now = new Date();
      const diff = now - d;

      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    time(date) {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    currency(amount, currency = 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    },

    truncate(str, length = 100) {
      if (str.length <= length) return str;
      return str.slice(0, length) + '...';
    }
  },

  /**
   * Simple markdown to HTML converter
   */
  markdown: {
    toHtml(text) {
      if (!text) return '';

      let html = text
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        // Code
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // Links (markdown format)
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        // Auto-linkify bare URLs not already inside an href
        .replace(/(?<!href="|">)(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
        // Headers
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        // Lists
        .replace(/^\* (.+)$/gm, '<li>$1</li>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p>')
        // Line breaks
        .replace(/\n/g, '<br>');

      // Wrap loose list items
      html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');

      // Wrap in paragraph
      if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
      }

      return html;
    }
  },

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Toast notifications
   */
  toast: {
    show(message, type = 'info', duration = 4000) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
      };

      toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    warning(message) { this.show(message, 'warning'); },
    info(message) { this.show(message, 'info'); }
  },

  /**
   * File to Base64 converter
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validate image file
   */
  validateImageFile(file, maxSizeMB = 10) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)' };
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return { valid: false, error: `Image must be smaller than ${maxSizeMB}MB` };
    }

    return { valid: true };
  }
};

// Export for use in other modules
window.ZephyrUtils = ZephyrUtils;
