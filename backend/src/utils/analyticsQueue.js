const Link = require("../models/Link");

/**
 * Asynchronous Batch Analytics Buffer Queue
 * Offloads link click increments and visit log writes from the HTTP request-response path.
 */
class AnalyticsQueue {
    constructor(flushIntervalMs = 2000, batchThreshold = 50) {
        this.buffer = new Map(); // linkId -> { count: number, visits: Array }
        this.flushIntervalMs = flushIntervalMs;
        this.batchThreshold = batchThreshold;
        this.timer = null;
        this.isFlushing = false;

        this.start();
    }

    start() {
        if (!this.timer) {
            this.timer = setInterval(() => {
                this.flush();
            }, this.flushIntervalMs);
            // Don't keep Node event loop alive unnecessarily on shutdown
            if (this.timer.unref) {
                this.timer.unref();
            }
        }
    }

    /**
     * Enqueue a visit log and click count increment
     */
    enqueue(linkId, visitData) {
        const idStr = linkId.toString();

        if (!this.buffer.has(idStr)) {
            this.buffer.set(idStr, { clicks: 0, visits: [] });
        }

        const entry = this.buffer.get(idStr);
        entry.clicks += 1;

        if (visitData) {
            entry.visits.push({
                timestamp: visitData.timestamp || new Date(),
                ip: visitData.ip || "Unknown",
                userAgent: visitData.userAgent || "Unknown"
            });
        }

        // Auto-flush if threshold is reached
        let totalItems = 0;
        for (const item of this.buffer.values()) {
            totalItems += item.clicks;
        }

        if (totalItems >= this.batchThreshold) {
            setImmediate(() => this.flush());
        }
    }

    /**
     * Flush buffered analytics to MongoDB using optimized bulk updates
     */
    async flush() {
        if (this.isFlushing || this.buffer.size === 0) return;

        this.isFlushing = true;
        const currentBuffer = this.buffer;
        this.buffer = new Map();

        try {
            const bulkOps = [];

            for (const [linkId, data] of currentBuffer.entries()) {
                bulkOps.push({
                    updateOne: {
                        filter: { _id: linkId },
                        update: {
                            $inc: { clicks: data.clicks },
                            $push: {
                                visits: {
                                    $each: data.visits,
                                    $slice: -5000 // Keep last 5000 visits to prevent unbounded document growth
                                }
                            }
                        }
                    }
                });
            }

            if (bulkOps.length > 0) {
                await Link.bulkWrite(bulkOps, { ordered: false });
            }
        } catch (err) {
            console.error("❌ Error flushing analytics queue:", err.message);
        } finally {
            this.isFlushing = false;
        }
    }

    /**
     * Get telemetry stats
     */
    getStats() {
        let pendingClicks = 0;
        for (const item of this.buffer.values()) {
            pendingClicks += item.clicks;
        }
        return {
            bufferedLinks: this.buffer.size,
            pendingClicks
        };
    }
}

const analyticsQueue = new AnalyticsQueue();

module.exports = analyticsQueue;
