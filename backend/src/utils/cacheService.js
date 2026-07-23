const Redis = require("ioredis");

/**
 * Hybrid Multi-Tier Cache System (L1 In-Memory LRU + L2 Distributed Redis)
 * Includes Redis Pub/Sub invalidation and automatic graceful fallback to L1 when Redis is unavailable.
 */
class CacheService {
    constructor(maxLocalItems = 10000, defaultTTL = 300) {
        this.localCache = new Map();
        this.maxLocalItems = maxLocalItems;
        this.defaultTTL = defaultTTL; // in seconds

        this.redis = null;
        this.pub = null;
        this.sub = null;
        this.isRedisConnected = false;

        this.initRedis();
    }

    /**
     * Initialize optional Redis connection & Pub/Sub listener
     */
    initRedis() {
        const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : null);

        if (!redisUrl) {
            console.log("ℹ️ REDIS_URL not configured. Operating in L1 Local In-Memory Cache mode.");
            return;
        }

        try {
            const redisOptions = {
                lazyConnect: true,
                maxRetriesPerRequest: 1,
                retryStrategy: (times) => {
                    if (times > 3) {
                        return null; // Stop retrying after 3 failed attempts
                    }
                    return Math.min(times * 200, 1000);
                }
            };

            this.redis = new Redis(redisUrl, redisOptions);
            this.pub = new Redis(redisUrl, redisOptions);
            this.sub = new Redis(redisUrl, redisOptions);

            this.redis.connect().then(() => {
                this.isRedisConnected = true;
                console.log("✅ Redis L2 Cache Connected Successfully!");
            }).catch(() => {
                this.isRedisConnected = false;
                console.log("ℹ️ Could not connect to Redis. Falling back seamlessly to L1 In-Memory Cache.");
            });

            this.sub.connect().then(() => {
                this.sub.subscribe("url_shortener:cache_invalidate");
                this.sub.on("message", (channel, message) => {
                    if (channel === "url_shortener:cache_invalidate") {
                        this.handleRemoteInvalidation(message);
                    }
                });
            }).catch(() => {});

            this.redis.on("error", () => {
                this.isRedisConnected = false;
            });
        } catch (err) {
            this.isRedisConnected = false;
        }
    }

    /**
     * Handle cache invalidation message received via Redis Pub/Sub from another cluster worker
     */
    handleRemoteInvalidation(message) {
        try {
            const { type, key, prefix } = JSON.parse(message);
            if (type === "del" && key) {
                this.localCache.delete(key);
            } else if (type === "delPattern" && prefix) {
                for (const k of this.localCache.keys()) {
                    if (k.startsWith(prefix)) {
                        this.localCache.delete(k);
                    }
                }
            }
        } catch (err) {}
    }

    /**
     * Set a key in L1 local memory & L2 Redis
     */
    set(key, value, ttlSeconds = this.defaultTTL) {
        if (!key) return;

        // Set L1 Local Cache
        if (this.localCache.size >= this.maxLocalItems && !this.localCache.has(key)) {
            const firstKey = this.localCache.keys().next().value;
            this.localCache.delete(firstKey);
        }

        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.localCache.set(key, { value, expiresAt });

        // Set L2 Redis Cache asynchronously
        if (this.isRedisConnected && this.redis) {
            const payload = JSON.stringify(value);
            if (ttlSeconds) {
                this.redis.setex(key, ttlSeconds, payload).catch(() => {});
            } else {
                this.redis.set(key, payload).catch(() => {});
            }
        }
    }

    /**
     * Get a key. Checks L1 Local Cache first (< 0.1ms), then L2 Redis (1-2ms)
     */
    get(key) {
        if (!key) return null;

        // Check L1 Local Cache
        if (this.localCache.has(key)) {
            const item = this.localCache.get(key);

            if (item.expiresAt && Date.now() > item.expiresAt) {
                this.localCache.delete(key);
            } else {
                // Refresh LRU order
                this.localCache.delete(key);
                this.localCache.set(key, item);
                return item.value;
            }
        }

        return null;
    }

    /**
     * Async getter that falls back to L2 Redis if L1 misses
     */
    async getAsync(key) {
        const localValue = this.get(key);
        if (localValue !== null) return localValue;

        if (this.isRedisConnected && this.redis) {
            try {
                const redisData = await this.redis.get(key);
                if (redisData) {
                    const parsed = JSON.parse(redisData);
                    // Backfill L1 Local Cache
                    this.set(key, parsed, this.defaultTTL);
                    return parsed;
                }
            } catch (err) {}
        }

        return null;
    }

    /**
     * Delete a specific key and publish Pub/Sub invalidation event
     */
    del(key) {
        if (!key) return;

        this.localCache.delete(key);

        if (this.isRedisConnected) {
            if (this.redis) this.redis.del(key).catch(() => {});
            if (this.pub) {
                this.pub.publish("url_shortener:cache_invalidate", JSON.stringify({ type: "del", key })).catch(() => {});
            }
        }
    }

    /**
     * Delete all keys starting with prefix and broadcast Pub/Sub invalidation
     */
    delPattern(prefix) {
        if (!prefix) return;

        for (const k of this.localCache.keys()) {
            if (k.startsWith(prefix)) {
                this.localCache.delete(k);
            }
        }

        if (this.isRedisConnected) {
            if (this.redis) {
                this.redis.keys(`${prefix}*`).then((keys) => {
                    if (keys && keys.length > 0) {
                        this.redis.del(keys).catch(() => {});
                    }
                }).catch(() => {});
            }
            if (this.pub) {
                this.pub.publish("url_shortener:cache_invalidate", JSON.stringify({ type: "delPattern", prefix })).catch(() => {});
            }
        }
    }

    /**
     * Flush all cache entries
     */
    flush() {
        this.localCache.clear();
        if (this.isRedisConnected && this.redis) {
            this.redis.flushdb().catch(() => {});
        }
    }

    /**
     * Telemetry stats
     */
    getStats() {
        return {
            l1LocalSize: this.localCache.size,
            maxLocalItems: this.maxLocalItems,
            isRedisConnected: this.isRedisConnected
        };
    }
}

const cache = new CacheService();

module.exports = cache;
