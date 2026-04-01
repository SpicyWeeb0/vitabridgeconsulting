document.addEventListener("DOMContentLoaded", () => {

  const mainContent = document.getElementById("mainContent");
  const logo = document.getElementById("logo");
  const submenuBar = document.getElementById("submenuBar");
  const navItems = document.querySelectorAll(".nav-item[data-menu]");
  const contactLink = document.querySelector('.nav a[href="#contact"]');

  // Save original homepage
  const originalContent = mainContent.innerHTML;

  /* -------------------------------
     SUBMENU DATA
  -------------------------------- */
  const submenus = {
    about: [
      {
        title: "Our Mission",
        img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3",
        text: "We provide ethical, transparent and compassionate surrogacy services."
      },
      {
        title: "Our Team",
        img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
        text: "A multidisciplinary team of doctors, lawyers and coordinators."
      }
    ],
    who: [
      {
        title: "Why Choose Us",
        img: "https://images.unsplash.com/photo-1579154204601-01588f351e67",
        text: "Personalized care, international experience, legal security."
      }
    ],
    stages: Array.from({ length: 6 }, (_, i) => ({
      title: `Program ${i + 1}`,
      img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3",
      text: "Detailed explanation of this surrogacy program stage."
    }))
  };

  /* -------------------------------
     REVEAL ANIMATION
  -------------------------------- */
  function initReveal() {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    reveals.forEach(el => observer.observe(el));
  }

  initReveal();

  /* -------------------------------
     MAIN MENU → SUBMENU
  -------------------------------- */
  navItems.forEach(item => {
    const key = item.dataset.menu;
    item.addEventListener("mouseenter", () => {
      submenuBar.innerHTML = submenus[key]
        .map((sub, i) =>
          `<li data-menu="${key}" data-index="${i}">${sub.title}</li>`
        ).join("");
      submenuBar.classList.add("active");
    });
  });

  document.querySelector(".header").addEventListener("mouseleave", () => {
    submenuBar.classList.remove("active");
  });

  /* -------------------------------
     SUBMENU CLICK → LOAD CONTENT
  -------------------------------- */
  submenuBar.addEventListener("click", e => {
    if (e.target.tagName !== "LI") return;

    const menu = e.target.dataset.menu;
    const index = e.target.dataset.index;
    const data = submenus[menu][index];

    mainContent.innerHTML = `
      <div class="loader"></div>

      <section class="section reveal" style="display:none">
        <div class="container">
          <h2 style="text-align:center; margin-bottom:2rem;">${data.title}</h2>

          <div class="image-card" style="max-width:700px; margin:auto">
            <div class="image-badge"></div>
            <img src="${data.img}" alt="">
            <div class="overlay">
              <div class="overlay-title">${data.title}</div>
            </div>
          </div>

          <p style="max-width:700px; margin:2rem auto; text-align:center;">
            ${data.text}
          </p>
        </div>
      </section>
    `;

    setTimeout(() => {
      document.querySelector(".loader")?.remove();
      document.querySelector(".section")?.style.setProperty("display", "block");
      initReveal();
    }, 900);
  });

  /* -------------------------------
     LOGO → RESTORE HOMEPAGE
  -------------------------------- */
  logo.addEventListener("click", () => {
    mainContent.innerHTML = originalContent;
    initReveal();
  });

  /* -------------------------------
     CONTACT LINK FIX
  -------------------------------- */
  if (contactLink) {
    contactLink.addEventListener("click", e => {
      e.preventDefault();
      mainContent.innerHTML = originalContent;
      initReveal();
      setTimeout(() => {
        document.getElementById("contact")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
  }

});
/* ============================
   FIREBASE SETUP
============================ */

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

loginBtn.addEventListener("click", () => {
  isSignup = false;
  authTitle.textContent = "Login";
  authConfirm.style.display = "none";
  authModal.style.display = "flex";
});

signupBtn.addEventListener("click", () => {
  isSignup = true;
  authTitle.textContent = "Sign Up";
  authConfirm.style.display = "block";
  authModal.style.display = "flex";
});

authModal.addEventListener("click", e => {
  if (e.target === authModal) {
    authModal.style.display = "none";
  }
});

/* ============================
   AUTH SUBMIT
============================ */

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


logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
});

auth.onAuthStateChanged((user) => {
  const profileContainer = document.getElementById("profileContainer");
  const profileEmail = document.getElementById("profileEmail");

  if (user && user.emailVerified) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    profileContainer.style.display = "flex";
    profileEmail.textContent = user.email;
  } else {
    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    profileContainer.style.display = "none";
  }
});

const forgotPassword = document.getElementById("forgotPassword");
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
