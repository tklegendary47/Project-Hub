// =========================================================
// BEACON — config.js
// One place to point the frontend at your backend.
// Local dev: backend runs on localhost:5000.
// Production: replace the else-branch with your deployed
// backend URL (e.g. "https://api.yourdomain.com/api"), or
// leave it as "/api" if the backend also serves this frontend
// (see the static-serving block in backend/server.js).
// =========================================================
const API_BASE =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "/api";
