// =========================================================
// BEACON — auth.js
// Session storage + authenticated fetch helper, shared by
// signup.html, login.html, onboarding.html, and dashboard.html.
//
// The session (JWT + basic user info) is kept in localStorage.
// This is a real, standalone website served from your own
// domain — not a sandboxed embed — so localStorage is the
// normal, correct choice here (the same pattern almost every
// JWT-based single-page app uses). If you later want extra
// protection against XSS token theft, the more advanced option
// is to move the token into an httpOnly cookie set by the
// server instead — worth doing before handling real payments.
// =========================================================

const SESSION_TOKEN_KEY = "beacon_token";
const SESSION_USER_KEY = "beacon_user";

function saveSession(token, user) {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_USER_KEY));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
}

// Call at the top of any page that requires a logged-in user.
function requireAuth(redirectTo = "login.html") {
  if (!getToken()) {
    window.location.href = redirectTo;
  }
}

function logout(redirectTo = "login.html") {
  clearSession();
  window.location.href = redirectTo;
}

// Wraps fetch(): adds the Authorization header automatically,
// parses JSON, and throws a readable Error on non-2xx responses
// so callers can just try/catch instead of checking res.ok everywhere.
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (networkErr) {
    // fetch() itself throws (not a 4xx/5xx) when it can't reach the server
    // at all — wrong URL, backend not running, CORS blocked, etc. This is
    // the exact case that shows up as the generic "Failed to fetch" error.
    throw new Error(
      `Can't reach the server at ${API_BASE}. Make sure the backend is running ` +
      `(see README.md) and that CLIENT_ORIGIN in backend/.env matches this page's URL.`
    );
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    // no JSON body — leave data as {}
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// Pings the backend's health endpoint so pages can show a clear banner
// BEFORE someone fills out a whole form only to hit "Failed to fetch."
async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

// Renders (or hides) a connection-warning banner into a given container.
// Call this on page load for any page that talks to the API.
async function renderConnectionBanner(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const healthy = await checkBackendHealth();
  if (healthy) {
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";
  container.innerHTML = `
    <span class="conn-banner-dot"></span>
    <span>Can't reach the server at <code>${API_BASE}</code> right now.
    Make sure the backend is running before signing up or logging in —
    see the README for setup steps.</span>
  `;
}

function showFormError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.style.display = "block";
}

function hideFormError(el) {
  if (!el) return;
  el.style.display = "none";
  el.textContent = "";
}
