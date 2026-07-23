const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const options = {
            maxPoolSize: 50,
            minPoolSize: 10,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);

        console.log("==========================================");
        console.log("✅ MongoDB Connected Successfully");
        console.log(`🌐 Host      : ${conn.connection.host}`);
        console.log(`📂 Database  : ${conn.connection.name}`);
        console.log(`🚀 ReadyState: ${conn.connection.readyState}`);
        console.log("==========================================");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed");
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;