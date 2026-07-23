require("dotenv").config();

const cluster = require("cluster");
const os = require("os");
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/database");
const analyticsQueue = require("./utils/analyticsQueue");

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;
const isClusterMode = process.env.NODE_ENV === "production" || process.env.ENABLE_CLUSTER === "true";

if (isClusterMode && cluster.isPrimary) {
    console.log("==========================================");
    console.log(`⚡ Multi-Core CPU Cluster Master Process PID: ${process.pid}`);
    console.log(`🔥 Spawning ${numCPUs} Worker Processes...`);
    console.log("==========================================");

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.warn(`⚠️ Worker process ${worker.process.pid} died (code: ${code}, signal: ${signal}). Spawning replacement...`);
        cluster.fork();
    });
} else {
    let server;

    const startServer = async () => {
        await connectDB();

        server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} (Worker PID: ${process.pid})`);
        });
    };

    const handleShutdown = async (signal) => {
        console.log(`\n⚠️ Worker ${process.pid} received ${signal}. Initiating graceful shutdown...`);

        if (server) {
            server.close(async () => {
                console.log(`🔌 Closed HTTP server on worker ${process.pid}.`);

                try {
                    // Flush pending analytics logs to MongoDB
                    console.log("📊 Flushing analytics queue...");
                    await analyticsQueue.flush();

                    // Close database connection
                    await mongoose.connection.close();
                    console.log(`✅ Closed MongoDB connection on worker ${process.pid}.`);
                    process.exit(0);
                } catch (err) {
                    console.error("❌ Error during graceful shutdown:", err);
                    process.exit(1);
                }
            });
        } else {
            process.exit(0);
        }
    };

    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));

    startServer();
}