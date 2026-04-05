document.addEventListener("DOMContentLoaded", () => {

  /* ============================
     MOBILE NAV TOGGLE
  ============================ */
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("mainNav");

  if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      nav.classList.toggle("open");
    });

    // Close nav when a link is clicked
    nav.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        nav.classList.remove("open");
      });
    });
  }

  /* ============================
     SCROLL REVEAL
  ============================ */
  const reveals = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => revealObserver.observe(el));

  /* ============================
     ACCORDION
  ============================ */
  document.querySelectorAll(".accordion-header").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      const isActive = item.classList.contains("active");

      // Close all siblings in the same accordion
      item.closest(".accordion").querySelectorAll(".accordion-item").forEach(i => {
        i.classList.remove("active");
      });

      // Toggle current
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  /* ============================
     SMOOTH SCROLL FOR ANCHOR LINKS
  ============================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

});

/* ============================
   FIREBASE SETUP
============================ */
const firebaseConfig = {
  apiKey: "AIzaSyDkHrapWQGe-fo-Y_flshYrwNnTcLRSl-I",
  authDomain: "surrogacydz.firebaseapp.com",
  projectId: "surrogacydz",
  storageBucket: "surrogacydz.firebasestorage.app",
  messagingSenderId: "877548005847",
  appId: "1:877548005847:web:3f7ea1ee01f4072c404392",
  measurementId: "G-KD069RCH18"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

/* ============================
   UI ELEMENTS
============================ */
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const authConfirm = document.getElementById("authConfirm");
const authMessage = document.getElementById("authMessage");

let isSignup = false;

/* ============================
   OPEN MODAL
============================ */
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    isSignup = false;
    authTitle.textContent = "Login";
    authConfirm.style.display = "none";
    authModal.style.display = "flex";
  });
}

if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    isSignup = true;
    authTitle.textContent = "Sign Up";
    authConfirm.style.display = "block";
    authModal.style.display = "flex";
  });
}

if (authModal) {
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) {
      authModal.style.display = "none";
    }
  });
}

/* ============================
   AUTH SUBMIT
============================ */
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;
    const confirm = document.getElementById("authConfirm").value;

    try {
      if (isSignup) {
        if (password !== confirm) {
          authMessage.textContent = "Passwords do not match.";
          return;
        }

        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        await userCred.user.sendEmailVerification();
        authMessage.textContent = "Verification email sent. Check spam folder.";
      } else {
        const userCred = await auth.signInWithEmailAndPassword(email, password);

        if (!userCred.user.emailVerified) {
          authMessage.textContent = "Please verify your email first.";
          return;
        }

        authModal.style.display = "none";
      }
    } catch (err) {
      console.error(err);
      authMessage.textContent = err.message;
    }
  });
}

/* ============================
   LOGOUT
============================ */
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
  });
}

/* ============================
   AUTH STATE
============================ */
auth.onAuthStateChanged((user) => {
  const profileContainer = document.getElementById("profileContainer");
  const profileEmail = document.getElementById("profileEmail");

  if (!profileContainer || !profileEmail) return;

  if (user && user.emailVerified) {
    if (loginBtn) loginBtn.style.display = "none";
    if (signupBtn) signupBtn.style.display = "none";
    profileContainer.style.display = "flex";
    profileEmail.textContent = user.email;
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (signupBtn) signupBtn.style.display = "inline-block";
    profileContainer.style.display = "none";
  }
});

/* ============================
   FORGOT PASSWORD
============================ */
const forgotPassword = document.getElementById("forgotPassword");
if (forgotPassword) {
  forgotPassword.addEventListener("click", async () => {
    const email = document.getElementById("authEmail").value;

    if (!email) {
      authMessage.textContent = "Please enter your email above first.";
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      authMessage.textContent = "Password reset email sent. Check spam folder.";
    } catch (err) {
      console.error(err);
      authMessage.textContent = err.message;
    }
  });
}
