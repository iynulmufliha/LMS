/**
 * server.js – bootstraps API with visible route table
 * ---------------------------------------------------
 * • Loads env vars
 * • Sets up Express + CORS + JSON
 * • Connects to MongoDB
 * • Mounts route files if they exist
 * • Logs final route table
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const listEndpoints = require("express-list-endpoints");

const app = express();

/* ────────────── 1. Basics ───────────── */
const PORT       = process.env.PORT       || 5000;
const MONGO_URI  = process.env.MONGO_URI  || "mongodb://127.0.0.1/viwisetech";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/* ────────────── 2. Middleware ───────── */
app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

/* ────────────── 3. MongoDB ──────────── */
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅  MongoDB connected"))
  .catch((err) => {
    console.error("❌  Mongo connection error:", err.message);
    process.exit(1);
  });

/* ────────────── 4. Safe route mount ─── */
function safeUse(mountPath, rel) {
  const abs = path.join(__dirname, rel + ".js"); // ensure .js extension
  if (!fs.existsSync(abs)) {
    return console.warn(`⚠️  Skipped ${mountPath} – file not found (${rel})`);
  }

  try {
    const router = require(abs);
    app.use(mountPath, router);
    console.log(`🔗  Mounted ${mountPath}`);
  } catch (err) {
    console.warn(`⚠️  Skipped ${mountPath} – require error:\n   ${err.message}`);
  }
}

/* ────────────── 5. Route registration ─ */
safeUse("/auth",                "./routes/auth-routes/index");
safeUse("/media",               "./routes/instructor-routes/media-routes");
safeUse("/instructor/course",   "./routes/instructor-routes/course-routes");
safeUse("/student/course",      "./routes/student-routes/course-routes");
safeUse("/student/order",       "./routes/student-routes/order-routes");
safeUse("/student/courses-bought", "./routes/student-routes/student-courses-routes");
safeUse("/student/course-progress", "./routes/student-routes/course-progress-routes");

/* ────────────── 6. Global error handler */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

/* ────────────── 7. Start server ─────── */
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.table(listEndpoints(app));          // ← see every route
});
