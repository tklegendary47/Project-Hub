// =========================================================
// BEACON — dashboard-live.js
// Fetches the logged-in user's real website + citation data
// and renders it into the dashboard shell. Replaces the static
// demo numbers used on dashboard-preview.html (that page stays
// as a marketing-only mockup for people who haven't signed up).
// =========================================================

const ENGINE_LABELS = {
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  google_ai: "Google AI",
  gemini: "Gemini",
  claude: "Claude",
};

let currentWebsiteId = null;

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  const user = getSessionUser();
  if (user) {
    document.getElementById("navUserName").textContent = user.name ? `Hi, ${user.name.split(" ")[0]}` : "";
  }

  document.getElementById("logoutLink").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  loadDashboard();
});

async function loadDashboard() {
  showState("loading");
  try {
    const { websites } = await apiFetch("/tracker/websites");
    if (!websites || websites.length === 0) {
      window.location.href = "onboarding.html";
      return;
    }

    // Single-website MVP: track the first (most recently added) site.
    const website = websites[0];
    currentWebsiteId = website._id;
    document.getElementById("dashDomain").textContent = website.displayName || website.domain;

    await refreshDashboardData();
  } catch (err) {
    showState("error");
    document.getElementById("errorMessage").textContent = err.message;
  }
}

async function refreshDashboardData() {
  const data = await apiFetch(`/tracker/websites/${currentWebsiteId}/dashboard`);

  if (!data.hasRunFirstCheck) {
    showState("emptyChecks");
    return;
  }

  renderDashboard(data);
  showState("content");
  bindActions();
}

function renderDashboard(data) {
  document.getElementById("statMention").textContent = `${data.overallMentionRate}%`;
  document.getElementById("statEngines").textContent = data.enginesCiting;
  document.getElementById("statOpen").textContent = data.openDiagnostics.length;
  document.getElementById("statOpenNote").textContent =
    data.openDiagnostics.length > 0 ? "Needs attention" : "All clear";
  document.getElementById("statWebsite").textContent = data.website.domain;
  document.getElementById("statAddedDate").textContent = new Date(data.website.createdAt).toLocaleDateString();

  document.getElementById("dashTitle").textContent =
    data.overallMentionRate >= 50
      ? "You're visible more often than not."
      : "There's real room to improve your visibility.";

  // Engine bars
  const engineList = document.getElementById("engineList");
  engineList.innerHTML = "";
  Object.entries(data.engineStats).forEach(([engine, stats]) => {
    const row = document.createElement("div");
    row.className = "engine-row";

    const color = stats.rate >= 60 ? "var(--glow)" : stats.rate >= 30 ? "var(--teal)" : "var(--coral)";
    const pctLabel = stats.checksCount > 0 ? `${stats.rate}%` : "Not checked";

    row.innerHTML = `
      <span class="engine-name">${ENGINE_LABELS[engine] || engine}</span>
      <div class="engine-bar"><div class="engine-bar-fill" style="width:${stats.rate}%; background:${color};"></div></div>
      <span class="engine-pct ${stats.checksCount === 0 ? "dash-pct-zero" : ""}">${pctLabel}</span>
    `;
    engineList.appendChild(row);
  });

  // Diagnostics
  const diagList = document.getElementById("diagList");
  diagList.innerHTML = "";
  if (data.openDiagnostics.length === 0) {
    diagList.innerHTML = `<div class="state-message" style="padding:20px 0;"><h3 style="font-size:17px;">Nothing open right now</h3><p>Every gap Beacon has found so far has been marked fixed.</p></div>`;
  } else {
    data.openDiagnostics.forEach((citation) => {
      const d = citation.diagnostic;
      const card = document.createElement("div");
      card.className = `diag-card ${d.priority === "high" ? "diag-card--high" : ""}`;
      card.innerHTML = `
        <div class="diag-top">
          <span class="diag-priority ${d.priority === "high" ? "diag-priority--high" : "diag-priority--med"}">${d.priority} priority</span>
          <span class="diag-engine">${ENGINE_LABELS[citation.engine] || citation.engine}</span>
        </div>
        <h3>${citation.promptUsed}</h3>
        <p>${d.reason}</p>
        <ul>${d.suggestedFixes.map((f) => `<li>${f}</li>`).join("")}</ul>
        <button class="btn btn-ghost btn-sm" data-citation-id="${citation._id}">Mark as fixed</button>
      `;
      diagList.appendChild(card);
    });
  }
}

function bindActions() {
  const runBtn = document.getElementById("runCheckBtn");
  if (runBtn) {
    runBtn.onclick = async () => {
      runBtn.disabled = true;
      runBtn.textContent = "Checking all 5 engines...";
      try {
        await apiFetch(`/tracker/websites/${currentWebsiteId}/check`, { method: "POST" });
        await refreshDashboardData();
      } catch (err) {
        alert(`Couldn't run the check: ${err.message}`);
      } finally {
        runBtn.disabled = false;
        runBtn.textContent = "Run new check";
      }
    };
  }

  document.querySelectorAll("[data-citation-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.citationId;
      btn.disabled = true;
      btn.textContent = "Saving...";
      try {
        await apiFetch(`/tracker/citations/${id}/resolve`, { method: "PATCH" });
        await refreshDashboardData();
      } catch (err) {
        alert(`Couldn't update: ${err.message}`);
        btn.disabled = false;
        btn.textContent = "Mark as fixed";
      }
    });
  });
}

const firstCheckBtn = document.getElementById("firstCheckBtn");
if (firstCheckBtn) {
  firstCheckBtn.addEventListener("click", async () => {
    firstCheckBtn.disabled = true;
    firstCheckBtn.textContent = "Running...";
    try {
      await apiFetch(`/tracker/websites/${currentWebsiteId}/check`, { method: "POST" });
      await refreshDashboardData();
    } catch (err) {
      alert(`Couldn't run the check: ${err.message}`);
      firstCheckBtn.disabled = false;
      firstCheckBtn.textContent = "Run first check";
    }
  });
}

function showState(state) {
  const states = ["loading", "error", "emptyChecks", "content"];
  const idMap = {
    loading: "loadingState",
    error: "errorState",
    emptyChecks: "emptyChecksState",
    content: "dashContent",
  };
  states.forEach((s) => {
    document.getElementById(idMap[s]).style.display = s === state ? "block" : "none";
  });
}
