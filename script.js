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
      const item = button.parentElement;
      const isActive = item.classList.contains("active");

      item.closest(".accordion").querySelectorAll(".accordion-item").forEach(i => {
        i.classList.remove("active");
      });

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

  /* ============================
     GSAP SCROLL ANIMATIONS
     (only on landing page, only if GSAP loaded)
  ============================ */
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    /* ----- SECTION REVEALS (layered entrance) ----- */
    document.querySelectorAll(".reveal").forEach((el) => {
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

    /* ----- JOURNEY: sticky scroll with step activation ----- */
    const journeySection = document.querySelector(".journey-section");
    const journeySteps = document.querySelectorAll(".journey-step");

    if (journeySection && journeySteps.length > 0) {
      // Pin the journey section
      ScrollTrigger.create({
        trigger: journeySection,
        start: "top 10%",
        end: () => `+=${journeySteps.length * 200}`,
        pin: true,
        pinSpacing: true
      });

      // Activate steps progressively
      journeySteps.forEach((step, i) => {
        ScrollTrigger.create({
          trigger: journeySection,
          start: () => `top+=${i * 200} 10%`,
          end: () => `top+=${(i + 1) * 200} 10%`,
          onEnter: () => step.classList.add("active"),
          onLeaveBack: () => step.classList.remove("active")
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
