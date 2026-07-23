require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/database");
const analyticsQueue = require("./utils/analyticsQueue");

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
    await connectDB();

    server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

const handleShutdown = async (signal) => {
    console.log(`\n⚠️ Received ${signal}. Initiating graceful shutdown...`);

    if (server) {
        server.close(async () => {
            console.log("🔌 Closed HTTP server.");

            try {
                // Flush pending analytics logs to MongoDB
                console.log("📊 Flushing analytics queue...");
                await analyticsQueue.flush();

                // Close database connection
                await mongoose.connection.close();
                console.log("✅ Closed MongoDB connection.");
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