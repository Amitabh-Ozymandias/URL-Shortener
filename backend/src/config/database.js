const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

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