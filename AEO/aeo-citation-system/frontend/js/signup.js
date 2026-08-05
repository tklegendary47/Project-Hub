document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, no reason to see the signup page again.
  if (getToken()) {
    window.location.href = "onboarding.html";
    return;
  }

  const form = document.getElementById("signupForm");
  const errorBox = document.getElementById("formError");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFormError(errorBox);

    const name = document.getElementById("name").value.trim();
    const businessName = document.getElementById("businessName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating your account...";

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, businessName }),
      });
      saveSession(data.token, data.user);
      // Straight into onboarding — this is the first website they'll track.
      window.location.href = "onboarding.html";
    } catch (err) {
      showFormError(errorBox, err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Create account";
    }
  });
});
