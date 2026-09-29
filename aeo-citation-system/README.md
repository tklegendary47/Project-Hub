# Beacon — AEO Citation System

A full website + backend for tracking and improving how AI search engines
(ChatGPT, Perplexity, Gemini, Claude, Google AI) mention your business.

This project has two independent halves that talk to each other over HTTP:

```
aeo-citation-system/
├── frontend/          Static marketing site + real product (HTML/CSS/JS, no build step)
│   ├── index.html               Landing page (hero, problem, product, pricing, waitlist)
│   ├── signup.html               Create a real account
│   ├── login.html                 Log in
│   ├── onboarding.html            Connect your first website (post-signup)
│   ├── dashboard.html             The REAL, data-connected product dashboard
│   ├── dashboard-preview.html    Static marketing mockup (for prospects who haven't signed up)
│   ├── css/
│   │   ├── style.css              Full design system — colors, type, all landing-page sections
│   │   ├── dashboard.css          Dashboard layout (sidebar, stat cards, panels) — shared by both dashboard pages
│   │   └── auth.css                Sign-up/login/onboarding card styling
│   ├── js/
│   │   ├── config.js               API_BASE — the one line to change when you deploy
│   │   ├── auth.js                  Shared session storage + authenticated fetch helper
│   │   ├── signup.js / login.js / onboarding.js   Form handlers for each page
│   │   ├── dashboard-live.js        Fetches real data and renders the real dashboard
│   │   ├── main.js                  Beacon canvas animation, nav, pricing toggle, waitlist form
│   │   └── dashboard.js             Animated demo numbers — only used by dashboard-preview.html
│   └── assets/                 Put your logo/favicon/social images here
│
├── backend/            Express + MongoDB API
│   ├── server.js               Entry point — wires everything together
│   ├── package.json
│   ├── .env.example             Copy to .env and fill in real values
│   ├── config/
│   │   └── db.js               MongoDB connection
│   ├── models/                  Mongoose schemas
│   │   ├── User.js
│   │   ├── Website.js
│   │   ├── Citation.js
│   │   └── Waitlist.js
│   ├── controllers/              Route logic
│   │   ├── authController.js
│   │   ├── trackerController.js
│   │   └── waitlistController.js
│   ├── routes/                    URL → controller wiring
│   │   ├── auth.js
│   │   ├── tracker.js
│   │   └── waitlist.js
│   ├── middleware/
│   │   └── authMiddleware.js     JWT verification
│   └── utils/
│       └── mockAIChecker.js       Simulated AI-engine checks — replace with real API calls later
│
└── README.md            You are here
```

## The real, click-through user flow

1. **`index.html`** → visitor clicks "Log in" (existing user), or navigates
   to **`signup.html`** to create an account.
2. **`signup.html`** → creates a real account via `POST /api/auth/register`,
   stores the returned JWT in `localStorage`, and sends them straight to
   **`onboarding.html`**.
3. **`onboarding.html`** → they enter their domain, category, and location.
   This calls `POST /api/tracker/websites` to save the site, then
   immediately calls `POST /api/tracker/websites/:id/check` to run the
   first scan, so the dashboard is never empty on first load.
4. **`dashboard.html`** → fetches `GET /api/tracker/websites/:id/dashboard`
   and renders real mention rates per engine and real open diagnostics.
   The "Run new check" button re-triggers a scan; "Mark as fixed" calls
   `PATCH /api/tracker/citations/:id/resolve`.
5. **`login.html`** → existing users log back in via `POST /api/auth/login`,
   then get routed to `dashboard.html` (or `onboarding.html` if they
   somehow have no website yet).

`dashboard-preview.html` is intentionally kept separate and still uses
static demo numbers — that's the version linked from the public landing
page for people who haven't signed up yet, so prospects always see a
polished, populated dashboard rather than an empty new account.

## How sessions work

Logging in/signing up stores a JSON Web Token (JWT) in the browser's
`localStorage`, via `js/auth.js`. Every subsequent request to a protected
API route (`/api/tracker/...`) automatically attaches that token in the
`Authorization` header. There's no database of "logged in sessions" —
the token itself, signed by your `JWT_SECRET`, is the proof of identity,
and it naturally expires after the `JWT_EXPIRES_IN` window in your `.env`
(7 days by default). Logging out just deletes the token from the browser;
nothing needs to happen server-side.

## How the pieces fit together

1. **The browser loads any `frontend/*.html` file** directly — no build
   step, no framework, no bundler. It's plain HTML/CSS/JS, so you can open
   it by double-clicking the file or serve it from any static host.

2. **The landing page's waitlist form** (`js/main.js`) sends a `POST` request
   to `/api/waitlist` on the backend. If the backend isn't running yet, the
   form still shows a friendly confirmation message so the page never looks
   broken during early development.

3. **The backend (`backend/server.js`)** is a normal Express API. It:
   - Connects to MongoDB (`config/db.js`)
   - Exposes `/api/auth/*` for registration/login (returns a JWT)
   - Exposes `/api/tracker/*` for adding websites, running checks, and
     reading dashboard data (all require a valid JWT)
   - Exposes `/api/waitlist` for the landing page's email capture
   - Can optionally serve the `frontend/` folder itself (see the comment
     block in `server.js`) if you want one deployment instead of two

5. **The mention-checking logic** (`utils/mockAIChecker.js`) is currently
   simulated — it returns realistic-looking results so the whole product
   works end-to-end before you have real API keys. When you're ready to go
   live: replace the inside of `checkMention()` with real calls to the
   OpenAI, Perplexity, Google AI, and Anthropic APIs. Nothing else in the
   codebase needs to change, because every other file just calls
   `checkMention()` and uses whatever it returns.

## Running it locally

**Backend:**
```bash
cd backend
cp .env.example .env        # then fill in a real MONGODB_URI and JWT_SECRET
npm install
npm run dev                  # or: npm start
```
The API runs on `http://localhost:5000` by default.

**Frontend:**
```bash
cd frontend
python3 -m http.server 8080  # or any static file server / Live Server extension
```
Open `http://localhost:8080` in your browser.

Make sure `CLIENT_ORIGIN` in `backend/.env` matches whatever URL you're
serving the frontend from (e.g. `http://localhost:8080`), so CORS allows
the two to talk to each other.

## Getting a real MongoDB database

1. Create a free account at mongodb.com/cloud/atlas
2. Create a free (M0) cluster
3. Add a database user and password
4. Under Network Access, allow your IP (or `0.0.0.0/0` for early development)
5. Copy the connection string into `MONGODB_URI` in your `.env` file

## Deploying

A simple, low-cost path:
- **Backend:** Render, Railway, or Fly.io (all have free/cheap tiers that run Node + connect to MongoDB Atlas)
- **Frontend:** Netlify, Vercel, or GitHub Pages (all serve static files for free)
- Point the frontend's `fetch()` calls at your deployed backend URL instead of `/api/...` once they're on separate domains, and set `CLIENT_ORIGIN` on the backend to your deployed frontend URL.

## What's real vs. what's a placeholder right now

| Piece | Status |
|---|---|
| Landing page design, copy, animation | Fully real, ready to use |
| Sign-up / login / onboarding pages | Fully real, connected to the backend |
| Dashboard (`dashboard.html`) | Fully real — reads live data from your account |
| `dashboard-preview.html` (marketing mockup) | Static demo data, by design, for pre-signup visitors |
| Auth (register/login/JWT) | Fully functional against a real MongoDB |
| Website tracking (add domain, schemas) | Fully functional |
| AI mention checking | Simulated — swap in real API calls when you have keys |
| Waitlist capture | Fully functional against a real MongoDB |
| Payment processing | Not included yet — this is Month 5 in the partnership plan (Stripe/Paystack integration) |
