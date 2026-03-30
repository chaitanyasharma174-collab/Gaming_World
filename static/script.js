/* ================= DOM ELEMENTS ================= */

// Signup inputs
const firstName = document.getElementById("firstName");
const lastName  = document.getElementById("lastName");
const email     = document.getElementById("email");
const password  = document.getElementById("password");

// Login inputs
const loginEmail    = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

// Popups
const signupPopup = document.getElementById("signupPopup");
const loginPopup  = document.getElementById("loginPopup");

// Navbar buttons
const loginBtn  = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Optional UI elements
const greetMessage = document.getElementById("greetMessage");
const currentTime  = document.getElementById("currentTime");


/* ================= CUSTOM ALERT ================= */

function showAlert(title, message) {
  document.getElementById("alertTitle").innerText = title;
  document.getElementById("alertMessage").innerText = message;
  document.getElementById("customAlert").style.display = "flex";
}

function closeAlert() {
  document.getElementById("customAlert").style.display = "none";
}


/* ================= POPUP CONTROLS ================= */

function openSignup() {
  signupPopup.style.display = "flex";
}

function openLogin() {
  loginPopup.style.display = "flex";
}

function closePopup() {
  signupPopup.style.display = "none";
  loginPopup.style.display = "none";
}

function switchToLogin() {
  signupPopup.style.display = "none";
  loginPopup.style.display = "flex";
}

function switchToSignup() {
  loginPopup.style.display = "none";
  signupPopup.style.display = "flex";
}


/* ================= SIGNUP ================= */

function signup() {
  fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first: firstName.value,
      last: lastName.value,
      email: email.value,
      password: password.value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      showAlert("Account Created 🎉", data.message);
      switchToLogin();
    } else {
      showAlert("Signup Failed ❌", data.message);
    }
  })
  .catch(() => {
    showAlert("Error ⚠️", "Signup failed. Try again later.");
  });
}


/* ================= LOGIN ================= */

function login() {
  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: loginEmail.value,
      password: loginPassword.value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      showAlert("Welcome 🎮", "Login successful!");
      closePopup();

      if (loginBtn)  loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
      showAlert("Login Failed ❌", data.message);
    }
  })
  .catch(() => {
    showAlert("Error ⚠️", "Unable to login. Try again.");
  });
}


/* ================= LOGOUT ================= */

function logout() {
  fetch("/logout")
    .then(res => res.json())
    .then(() => {
      showAlert("Logged Out 👋", "You have been logged out successfully.");

      if (logoutBtn) logoutBtn.style.display = "none";
      if (loginBtn)  loginBtn.style.display = "inline-block";
    })
    .catch(() => {
      showAlert("Error ⚠️", "Logout failed.");
    });
}


/* ================= CHECK LOGIN STATUS ================= */

fetch("/check-login")
  .then(res => res.json())
  .then(data => {
    if (data.logged_in) {
      if (loginBtn)  loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
      if (logoutBtn) logoutBtn.style.display = "none";
      if (loginBtn)  loginBtn.style.display = "inline-block";
    }
  });


/* ================= PLAY GAME ACCESS CHECK ================= */

function checkPlayAccess() {
  fetch("/check-login")
    .then(res => res.json())
    .then(data => {
      if (data.logged_in) {
        window.location.href = "/play-game";
      } else {
        showAlert("Login Required 🔒", "Please login first to play the game.");
      }
    });
}


/* ================= GREETING MESSAGE ================= */

function updateGreeting() {
  if (!greetMessage) return;

  let hour = new Date().getHours();
  let msg =
    hour < 12 ? "Good Morning Gamer 👾" :
    hour < 18 ? "Good Afternoon Warrior ⚔️" :
                "Good Evening Night Raider 🌙";

  greetMessage.innerText = msg;
}


/* ================= CLOCK ================= */

function updateClock() {
  if (!currentTime) return;

  currentTime.innerText =
    "Current Time: " + new Date().toLocaleTimeString();
}

// Initial calls
updateGreeting();
updateClock();
setInterval(updateClock, 1000);
