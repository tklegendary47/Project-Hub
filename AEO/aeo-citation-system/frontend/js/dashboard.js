// =========================================================
// BEACON — dashboard.js
// Animates stat counters and engine bars on the dashboard
// preview page. Static demo data — replace with live API
// calls to /api/dashboard once the backend is connected.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  animateCount("statMention", 63, "%");
  animateCount("statEngines", 4, "/5", true);
  animateCount("statOpen", 3, "");
  animateCount("statFixed", 11, "");
  animateEngineBars();
});

function animateCount(id, target, suffix, isFraction = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = isFraction ? `${value}${suffix}` : `${value}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function animateEngineBars() {
  const bars = document.querySelectorAll(".engine-bar-fill");
  bars.forEach((bar, i) => {
    const fill = bar.dataset.fill || 0;
    setTimeout(() => {
      bar.style.width = `${fill}%`;
    }, 150 + i * 90);
  });
}
