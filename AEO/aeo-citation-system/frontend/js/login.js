document.addEventListener("DOMContentLoaded", () => {
  if (getToken()) {
    window.location.href = "dashboard.html";
    return;
  }

  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("formError");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFormError(errorBox);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveSession(data.token, data.user);

      // Decide where to send them: do they already have a tracked website?
      try {
        const { websites } = await apiFetch("/tracker/websites");
        window.location.href = websites && websites.length ? "dashboard.html" : "onboarding.html";
      } catch {
        window.location.href = "onboarding.html";
      }
    } catch (err) {
      showFormError(errorBox, err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
    }
  });
});
