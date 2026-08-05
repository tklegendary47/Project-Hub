require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const trackerRoutes = require("./routes/tracker");
const waitlistRoutes = require("./routes/waitlist");

const app = express();

// ---------- Middleware ----------
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));

// ---------- API routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/waitlist", waitlistRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ---------- Serve the frontend (optional, for a single-deploy setup) ----------
// If you deploy frontend and backend separately (e.g. frontend on Netlify/
// Vercel, backend on Render/Railway), you can delete this block — the
// frontend already talks to the API by URL, not by being served from here.
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------- Error handler (catches anything thrown in routes) ----------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on our end." });
});

// ---------- Start ----------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Beacon API running on http://localhost:${PORT}`);
  });
});
