require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5176;

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Routes - ensure these are properly imported
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const noteRoutes=require("./routes/noteRoutes");
app.use("/api/notes",noteRoutes);
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});