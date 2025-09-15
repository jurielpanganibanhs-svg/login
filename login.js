// -------------------- LOGIN LOGIC --------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const usernameInput = form.querySelector("input[type='text']");
  const passwordInput = form.querySelector("input[type='password']");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // SIMPLE VALIDATION
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    // DEMO USER (replace with real backend call)
    if (username === "user123" && password === "12345") {
      alert("✅ Login successful!");
      window.location.href = "dashboard.html"; // Replace with your next page
    } else {
      alert("❌ Invalid username or password.");
    }
  });
});

// -------------------- GOOGLE SIGN-IN --------------------
// Load Google API
const googleBtn = document.querySelector(".google-btn");
googleBtn.addEventListener("click", () => {
  // Replace CLIENT_ID with your real OAuth client ID from Google Cloud Console
  const clientId = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";
  const redirectUri = window.location.origin + "/google-callback.html";
  const scope = "email profile";

  // Construct OAuth URL
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${encodeURIComponent(scope)}`;

  // Redirect user to Google login
  window.location.href = authUrl;
});
