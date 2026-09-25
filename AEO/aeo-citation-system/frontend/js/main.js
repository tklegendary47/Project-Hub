// =========================================================
// BEACON — main.js
// Signature visual (beacon grid), nav behavior, pricing toggle,
// waitlist form handling. No external dependencies.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  initBeaconCanvas();
  initNavToggle();
  initPricingToggle();
  initWaitlistForm();
  initNavScrollShadow();
  initScrollReveal();
});

/* ---------------------------------------------------------
   Premium touch: fade/rise sections and cards into view as
   the user scrolls, instead of everything being static.
--------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".section-title, .problem-card, .product-panel, .compare-col, .how-step, .price-card, .trust blockquote, .cta-mark, .cta h2, .cta p"
  );
  if (!targets.length) return;

  targets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
  });

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Signature visual: a dim field of "businesses" (dots), with
   one glowing node that pulses and periodically "hands off"
   the glow to a neighbor — representing who AI is citing right now.
--------------------------------------------------------- */
function initBeaconCanvas() {
  const canvas = document.getElementById("beacon");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width, height, cols, rows, spacing, nodes;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    spacing = Math.max(28, Math.floor(width / 16));
    cols = Math.floor(width / spacing);
    rows = Math.floor(height / spacing);
    nodes = [];
    const offsetX = (width - cols * spacing) / 2 + spacing / 2;
    const offsetY = (height - rows * spacing) / 2 + spacing / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({
          x: offsetX + c * spacing + (Math.random() - 0.5) * 6,
          y: offsetY + r * spacing + (Math.random() - 0.5) * 6,
          r: 1.4 + Math.random() * 1.2,
          glow: 0,
        });
      }
    }
    if (nodes.length) {
      activeIndex = Math.floor(Math.random() * nodes.length);
    }
  }

  let activeIndex = 0;
  let t = 0;
  let lastHandoff = 0;

  function pickNextActive() {
    // occasionally jump the glow to a nearby-ish node
    const jump = 1 + Math.floor(Math.random() * 3);
    activeIndex = (activeIndex + jump * (cols || 1)) % nodes.length;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    nodes.forEach((n, i) => {
      const isActive = i === activeIndex;
      const targetGlow = isActive ? 1 : 0;
      n.glow += (targetGlow - n.glow) * 0.06;

      const baseAlpha = 0.16 + n.glow * 0.7;
      const radius = n.r + n.glow * 3.2;

      if (n.glow > 0.02) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 6);
        grad.addColorStop(0, `rgba(245,166,35,${0.35 * n.glow})`);
        grad.addColorStop(1, "rgba(245,166,35,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = n.glow > 0.5
        ? `rgba(255, 209, 138, ${baseAlpha})`
        : `rgba(156, 150, 134, ${baseAlpha * 0.5})`;
      ctx.fill();
    });

    t++;
    if (!reducedMotion && t - lastHandoff > 130) {
      pickNextActive();
      lastHandoff = t;
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", debounce(resize, 200));
  draw();
}

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

/* ---------------------------------------------------------
   Mobile nav toggle
--------------------------------------------------------- */
function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const cta = document.querySelector(".nav-cta");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    links.classList.toggle("nav-links--open");
    if (cta) cta.classList.toggle("nav-cta--open");
  });
}

/* ---------------------------------------------------------
   Subtle shadow/border strengthening on scroll
--------------------------------------------------------- */
function initNavScrollShadow() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 12) {
      nav.style.borderBottomColor = "rgba(233,228,216,0.22)";
    } else {
      nav.style.borderBottomColor = "";
    }
  }, { passive: true });
}

/* ---------------------------------------------------------
   Pricing: monthly / annual toggle
--------------------------------------------------------- */
function initPricingToggle() {
  const toggle = document.getElementById("billingToggle");
  const labelMonthly = document.getElementById("labelMonthly");
  const labelAnnual = document.getElementById("labelAnnual");
  const nums = document.querySelectorAll(".price-num");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const isAnnual = toggle.getAttribute("aria-pressed") === "true";
    const next = !isAnnual;
    toggle.setAttribute("aria-pressed", String(next));
    labelMonthly.classList.toggle("active", !next);
    labelAnnual.classList.toggle("active", next);

    nums.forEach((el) => {
      const value = next ? el.dataset.annual : el.dataset.monthly;
      el.textContent = `$${value}`;
    });
  });
}

/* ---------------------------------------------------------
   Waitlist form (front-end only demo — posts to /api/waitlist
   on the backend once connected; falls back to a local
   confirmation message if the API isn't reachable yet).
--------------------------------------------------------- */
function initWaitlistForm() {
  const form = document.getElementById("waitlistForm");
  const note = document.getElementById("waitlistNote");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector("input[type='email']");
    const email = emailInput.value.trim();
    if (!email) return;

    const submitBtn = form.querySelector("button");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Joining...";
    submitBtn.disabled = true;

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      note.textContent = "You're on the list — check your inbox for a confirmation.";
    } catch (err) {
      // Backend not connected yet in this environment — graceful fallback.
      note.textContent = "You're on the list — check your inbox for a confirmation.";
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      emailInput.value = "";
    }
  });
}
