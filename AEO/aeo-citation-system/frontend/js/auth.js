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

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
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
