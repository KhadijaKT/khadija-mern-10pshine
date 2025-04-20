const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Fail quickly if can't connect
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
};

// Handle connection error after initial connection
mongoose.connection.on("error", (err) => {
  console.error("🔥 MongoDB runtime error:", err.message);
});

module.exports = connectDB;
