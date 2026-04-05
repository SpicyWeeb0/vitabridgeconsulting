document.addEventListener("DOMContentLoaded", () => {

  /* ============================
     REDUCED MOTION CHECK
  ============================ */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    nav.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        nav.classList.remove("open");
      });
    });
  }

  /* ============================
     HERO STAGGER ENTRANCE
  ============================ */
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    if (prefersReducedMotion) {
      heroContent.classList.add("loaded");
    } else {
      requestAnimationFrame(() => {
        heroContent.classList.add("loaded");
      });
    }
  }

  /* ============================
     ACCORDION
  ============================ */
  document.querySelectorAll(".accordion-header").forEach(button => {
    button.addEventListener("click", () => {
      button.parentElement.classList.toggle("active");
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

  /* ============================
     GSAP SCROLL ANIMATIONS
     (only on landing page, only if GSAP loaded)
  ============================ */
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    /* ----- SECTION REVEALS (layered entrance) ----- */
    /* Exclude elements that have their own dedicated GSAP animations */
    const dedicatedAnimated = ".program-card, .advantage-item, .trust-item, .journey-step, .accordion-item";
    document.querySelectorAll(".reveal").forEach((el) => {
      if (el.matches(dedicatedAnimated)) return;
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    /* ----- HERO PARALLAX (gentle upward drift on scroll) ----- */
    const heroSection = document.querySelector(".hero");
    if (heroSection) {
      gsap.to(heroSection, {
        y: -60,
        opacity: 0.6,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    /* ----- PROGRAMS: staggered card reveal ----- */
    const programCards = document.querySelectorAll(".program-card");
    if (programCards.length > 0) {
      gsap.fromTo(programCards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#programs",
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    /* ----- WHY ARMENIA: "new chapter" entrance ----- */
    const whyArmenia = document.querySelector("#why-armenia");
    if (whyArmenia) {
      const advantageItems = whyArmenia.querySelectorAll(".advantage-item");
      if (advantageItems.length > 0) {
        gsap.fromTo(advantageItems,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: whyArmenia,
              start: "top 70%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }

    /* ----- JOURNEY: smooth step-by-step reveal on scroll ----- */
    const journeySteps = document.querySelectorAll(".journey-step");

    if (journeySteps.length > 0) {
      journeySteps.forEach((step, i) => {
        gsap.to(step, {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: step,
            start: "top 85%",
            end: "top 60%",
            scrub: 0.5,
            onEnter: () => step.classList.add("active"),
            onLeaveBack: () => step.classList.remove("active")
          }
        });
      });
    }

    /* ----- TRUST GRID: staggered reveal ----- */
    const trustItems = document.querySelectorAll(".trust-item");
    if (trustItems.length > 0) {
      gsap.fromTo(trustItems,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#trust",
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    /* ----- FAQ: gentle entrance, accordion handles the rest ----- */
    const faqSection = document.querySelector("#faq");
    if (faqSection) {
      const accordionItems = faqSection.querySelectorAll(".accordion-item");
      gsap.fromTo(accordionItems,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: faqSection,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    /* ----- FINAL CTA: soft entrance ----- */
    const ctaSection = document.querySelector(".cta-section");
    if (ctaSection) {
      gsap.fromTo(ctaSection.querySelector(".cta-content"),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaSection,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

  } else if (!prefersReducedMotion) {
    /* ----- FALLBACK: simple IntersectionObserver if no GSAP ----- */
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

    // Fallback: activate journey steps sequentially
    const journeySteps = document.querySelectorAll(".journey-step");
    if (journeySteps.length > 0) {
      const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      }, { threshold: 0.3 });
      journeySteps.forEach(el => stepObserver.observe(el));
    }
  } else {
    /* ----- REDUCED MOTION: make everything visible ----- */
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("active"));
    document.querySelectorAll(".journey-step").forEach(el => el.classList.add("active"));
  }

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
    window.location.href = "index.html";
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

/* ============================
   LONG-FORM PAGES (eligibility / consultation / program overview)
   Show the thank-you state on submit. No backend wired up yet.
============================ */
(function () {
  const formIds = ["eligibilityForm", "consultationForm", "programOverviewForm"];
  formIds.forEach((id) => {
    const form = document.getElementById(id);
    const thankYou = document.getElementById("thankYou");
    if (!form || !thankYou) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      form.setAttribute("hidden", "");
      thankYou.removeAttribute("hidden");
      thankYou.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();

/* ============================
   ACCOUNT PAGE
============================ */
(function () {
  const accountPage = document.getElementById("accountPage");
  if (!accountPage) return;

  const signedIn = document.getElementById("accountSignedIn");
  const signedOut = document.getElementById("accountSignedOut");
  const accountEmail = document.getElementById("accountEmail");
  const loginTrigger = document.getElementById("accountLoginTrigger");
  const accountLogoutBtn = document.getElementById("accountLogoutBtn");

  const emailForm = document.getElementById("changeEmailForm");
  const passwordForm = document.getElementById("changePasswordForm");
  const emailMessage = document.getElementById("emailMessage");
  const passwordMessage = document.getElementById("passwordMessage");

  function setMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove("success", "error");
    if (type) el.classList.add(type);
  }

  auth.onAuthStateChanged((user) => {
    if (user && user.emailVerified) {
      signedIn.removeAttribute("hidden");
      signedOut.setAttribute("hidden", "");
      accountEmail.textContent = user.email;
    } else {
      signedIn.setAttribute("hidden", "");
      signedOut.removeAttribute("hidden");
    }
  });

  if (loginTrigger) {
    loginTrigger.addEventListener("click", () => {
      const btn = document.getElementById("loginBtn");
      if (btn) btn.click();
    });
  }

  if (accountLogoutBtn) {
    accountLogoutBtn.addEventListener("click", async () => {
      await auth.signOut();
      window.location.href = "index.html";
    });
  }

  async function reauthenticate(currentPassword) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in.");
    const cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    await user.reauthenticateWithCredential(cred);
  }

  if (emailForm) {
    emailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      setMessage(emailMessage, "Updating…");
      const newEmail = document.getElementById("newEmail").value.trim();
      const currentPassword = document.getElementById("emailCurrentPassword").value;
      try {
        await reauthenticate(currentPassword);
        await auth.currentUser.updateEmail(newEmail);
        try { await auth.currentUser.sendEmailVerification(); } catch (_) {}
        setMessage(emailMessage, "Email updated. A verification link has been sent to your new address.", "success");
        accountEmail.textContent = auth.currentUser.email;
        emailForm.reset();
      } catch (err) {
        console.error(err);
        setMessage(emailMessage, err.message || "Could not update email.", "error");
      }
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      setMessage(passwordMessage, "Updating…");
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmNewPassword = document.getElementById("confirmNewPassword").value;
      if (newPassword !== confirmNewPassword) {
        setMessage(passwordMessage, "New passwords do not match.", "error");
        return;
      }
      try {
        await reauthenticate(currentPassword);
        await auth.currentUser.updatePassword(newPassword);
        setMessage(passwordMessage, "Password updated successfully.", "success");
        passwordForm.reset();
      } catch (err) {
        console.error(err);
        setMessage(passwordMessage, err.message || "Could not update password.", "error");
      }
    });
  }
})();
