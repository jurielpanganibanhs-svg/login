// script1.js
// Place this file in the same folder as your main1.html (HTML already includes <script src="script1.js"></script>)

// -------------------- Helper: serve decode JWT payload --------------------
function decodeJwtPayload(jwt) {
  // jwt = header.payload.signature
  try {
    const payload = jwt.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // add padding if necessary
    const pad = base64.length % 4;
    const padded = base64 + (pad ? '='.repeat(4 - pad) : '');
    const json = decodeURIComponent(escape(window.atob(padded)));
    return JSON.parse(json);
  } catch (err) {
    console.error('Failed to decode JWT payload', err);
    return null;
  }
}

// -------------------- FORM LOGIN (existing demo) --------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const usernameInput = form.querySelector("input[type='text']");
  const passwordInput = form.querySelector("input[type='password']");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    // LOCAL DEMO CHECK
    if (username === "user123" && password === "12345") {
      localStorage.setItem("app_user", JSON.stringify({ username }));
      window.location.href = "dashboard.html";
    } else {
      alert("❌ Invalid username or password.");
    }
  });

  // Load Google Identity Services script dynamically (keeps HTML unchanged)
  loadGoogleIdentityScript().then(initGSI).catch(err => {
    console.warn('GSI script failed to load', err);
  });
});

// -------------------- DYNAMICALLY LOAD GSI CLIENT --------------------
function loadGoogleIdentityScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

// -------------------- INIT GOOGLE IDENTITY (client-side JS flow) --------------------
function initGSI() {
  // --- 1) Replace with YOUR client ID from Google Cloud Console ---
  const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";

  if (!CLIENT_ID || CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID_HERE")) {
    console.warn("Please set CLIENT_ID in script1.js with your real Google OAuth Web client ID.");
    return;
  }

  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    console.error("Google Identity Services not available.");
    return;
  }

  // Callback invoked when Google provides a credential (ID token)
  function handleCredentialResponse(response) {
    // response.credential is a JWT (ID token). Decode payload to get user info.
    const payload = decodeJwtPayload(response.credential);
    if (!payload) {
      console.error("Couldn't decode credential");
      return;
    }
    // Example payload fields: payload.email, payload.name, payload.picture
    console.log("Gmail sign-in payload:", payload);

    // Save minimal session locally for demo:
    localStorage.setItem("google_user", JSON.stringify({
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    }));

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  }

  // Initialize GSI
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse,
    ux_mode: "popup" // or "popup" (no redirect) — popup is easier for local dev
  });

  // Render the button: we will replace your existing .google-btn element with the GSI button container
  const oldBtn = document.querySelector(".google-btn");
  if (oldBtn) {
    const wrapper = document.createElement("div");
    wrapper.id = "gsi-button-wrapper";
    // Keep same styling container size: insert wrapper where the old button was
    oldBtn.parentNode.replaceChild(wrapper, oldBtn);

    google.accounts.id.renderButton(
      wrapper,
      {
        theme: "outline",
        size: "large",
        width: "100%"
        // more options available: type, shape, text, logo_alignment, etc.
      }
    );

    // Optionally show One Tap (commented out). Use carefully.
    // google.accounts.id.prompt();
  } else {
    console.warn(".google-btn element not found in DOM — cannot render GSI button.");
  }
}
