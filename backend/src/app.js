const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const linkRoutes = require("./routes/linkRoutes");
const publicRoutes = require("./routes/publicRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const errorHandler = require("./middleware/errorHandler");
const { globalLimiter } = require("./middleware/rateLimiter");
const cache = require("./utils/cacheService");
const analyticsQueue = require("./utils/analyticsQueue");

const app = express();

/*
====================================
Middlewares
====================================
*/

app.use(helmet());
app.use(cors());
app.use(compression()); // HTTP response compression (gzip/deflate)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all /api/ endpoints
app.use("/api", globalLimiter);

/*
====================================
Enhanced Diagnostics Health Check
====================================
*/

app.get("/health", (req, res) => {
    const memory = process.memoryUsage();
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    };

    res.status(200).json({
        success: true,
        message: "Server is healthy and performing optimally.",
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        database: {
            status: dbStatusMap[dbState] || "unknown",
            readyState: dbState
        },
        memory: {
            rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`
        },
        telemetry: {
            cacheStats: cache.getStats(),
            queueStats: analyticsQueue.getStats()
        }
    });
});

/*
====================================
API Routes
====================================
*/

app.use("/api/auth", authRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/dashboard", dashboardRoutes);

/*
====================================
Public Redirect
====================================
*/

app.use("/", publicRoutes);

/*
====================================
404 Handler
====================================
*/

app.use((req, res, next) => {
    const AppError = require("./utils/AppError");
    next(new AppError("Route not found.", 404));
});

/*
====================================
Global Error Handler
====================================
*/

app.use(errorHandler);

module.exports = app;