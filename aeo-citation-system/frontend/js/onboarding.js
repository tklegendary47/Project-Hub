document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  renderConnectionBanner("connBanner");

  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  const form = document.getElementById("onboardingForm");
  const errorBox = document.getElementById("formError");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFormError(errorBox);

    const domain = document.getElementById("domain").value.trim();
    const displayName = document.getElementById("displayName").value.trim();
    const category = document.getElementById("category").value.trim();
    const location = document.getElementById("location").value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = "Connecting...";

    try {
      const { website } = await apiFetch("/tracker/websites", {
        method: "POST",
        body: JSON.stringify({ domain, displayName, category, location }),
      });

      // Kick off the very first check right away so the dashboard
      // isn't empty the moment they land on it.
      submitBtn.textContent = "Running your first scan...";
      await apiFetch(`/tracker/websites/${website._id}/check`, { method: "POST" });

      window.location.href = "dashboard.html";
    } catch (err) {
      showFormError(errorBox, err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Connect website";
    }
  });
});
