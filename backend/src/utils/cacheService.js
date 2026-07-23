/**
 * Ultra-Fast High-Performance In-Memory Cache with TTL & LRU Eviction
 * Designed for sub-millisecond lookups for slugs, user sessions, and dashboard stats.
 */

class CacheService {
    constructor(maxItems = 10000, defaultTTL = 300) {
        this.cache = new Map();
        this.maxItems = maxItems;
        this.defaultTTL = defaultTTL; // in seconds
    }

    /**
     * Set a key in the cache with optional TTL in seconds
     */
    set(key, value, ttlSeconds = this.defaultTTL) {
        if (!key) return;

        // Evict oldest entry if max capacity reached
        if (this.cache.size >= this.maxItems && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.cache.set(key, { value, expiresAt });
    }

    /**
     * Get a key from the cache. Returns null if expired or missing.
     */
    get(key) {
        if (!key || !this.cache.has(key)) return null;

        const item = this.cache.get(key);

        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // Re-insert to refresh LRU order
        this.cache.delete(key);
        this.cache.set(key, item);

        return item.value;
    }

    /**
     * Delete a specific key
     */
    del(key) {
        if (key) {
            this.cache.delete(key);
        }
    }

    /**
     * Delete all keys starting with a prefix (e.g. "dash:user123")
     */
    delPattern(prefix) {
        if (!prefix) return;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Flush all cache entries
     */
    flush() {
        this.cache.clear();
    }

    /**
     * Return cache telemetry stats
     */
    getStats() {
        return {
            size: this.cache.size,
            maxItems: this.maxItems
        };
    }
}

// Global cache instance
const cache = new CacheService();

module.exports = cache;
