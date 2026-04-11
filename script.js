document.addEventListener("DOMContentLoaded", () => {

  /* ============================
     REDUCED MOTION CHECK
  ============================ */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================
     CINEMATIC TEXT SPLITTERS
     Runtime-only splitting — never edits the
     HTML source. Splits .hero-content h1 /
     .hero-subtitle into per-line masks and
     .section-title / .page-hero h1 into per-word
     spans for fade+blur reveal.
  ============================ */
  function splitIntoLines(el, maxLines = 5) {
    if (!el || el.dataset.split === "1") return;
    // Skip if element contains nested markup (not plain text)
    if (el.children.length > 0) return;
    const text = el.textContent.trim();
    if (!text) return;

    const words = text.split(/\s+/);
    // First pass: render each word as an inline-block so we can measure offsetTop
    el.textContent = "";
    const probe = document.createElement("span");
    probe.style.display = "inline";
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.style.display = "inline-block";
      s.textContent = w + (i < words.length - 1 ? " " : "");
      probe.appendChild(s);
    });
    el.appendChild(probe);

    // Group words into visual lines by offsetTop
    const lines = [];
    let currentLine = [];
    let currentTop = null;
    probe.querySelectorAll("span").forEach((s) => {
      const top = s.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) < 2) {
        currentLine.push(s.textContent);
        currentTop = top;
      } else {
        lines.push(currentLine.join("").trimEnd());
        currentLine = [s.textContent];
        currentTop = top;
      }
    });
    if (currentLine.length) lines.push(currentLine.join("").trimEnd());

    // Rebuild with line masks
    el.textContent = "";
    lines.slice(0, maxLines).forEach((lineText, idx) => {
      const mask = document.createElement("span");
      mask.className = "line-mask lm-" + (idx + 1);
      const inner = document.createElement("span");
      inner.className = "line-inner";
      inner.textContent = lineText;
      mask.appendChild(inner);
      el.appendChild(mask);
    });
    el.dataset.split = "1";
  }

  function splitIntoWords(el) {
    if (!el || el.dataset.wsplit === "1") return;
    if (el.children.length > 0) return;
    const text = el.textContent.trim();
    if (!text) return;

    const words = text.split(/\s+/);
    el.textContent = "";
    el.classList.add("word-split");
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "word";
      s.style.setProperty("--i", i);
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.dataset.wsplit = "1";
  }

  function runCinematicSplits() {
    if (prefersReducedMotion) return;
    const heroH1 = document.querySelector(".hero-content h1");
    const heroSub = document.querySelector(".hero-content .hero-subtitle");
    if (heroH1) splitIntoLines(heroH1, 3);
    if (heroSub) splitIntoLines(heroSub, 4);
    document.querySelectorAll(".section-title, .page-hero h1").forEach(splitIntoWords);
  }

  // Wait for webfonts to settle so line measurement is accurate
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(runCinematicSplits).catch(runCinematicSplits);
  } else {
    requestAnimationFrame(runCinematicSplits);
  }

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
    const activateHero = () => {
      heroContent.classList.add("loaded");
      heroContent.querySelectorAll(".line-mask").forEach((m) => m.classList.add("lm-ready"));
    };
    if (prefersReducedMotion) {
      activateHero();
    } else {
      // Wait a tick past splitter so masks exist before we toggle .lm-ready.
      // document.fonts.ready resolves asynchronously, so delay hero activation
      // until after splits can run.
      const kickHero = () => requestAnimationFrame(activateHero);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(kickHero).catch(kickHero);
      } else {
        requestAnimationFrame(kickHero);
      }
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
    gsap.defaults({ ease: "expo.out" });

    // Helper: fire the CSS-driven cinematic reveals (.active on the section,
    // .ws-in on any word-split titles inside it) so paragraph blur + gold
    // underline sweeps run in sync with the GSAP tween.
    const activateCinematic = (el) => {
      el.classList.add("active");
      el.querySelectorAll(".word-split").forEach((w) => w.classList.add("ws-in"));
    };
    const deactivateCinematic = (el) => {
      el.classList.remove("active");
      el.querySelectorAll(".word-split").forEach((w) => w.classList.remove("ws-in"));
    };

    /* ----- SECTION REVEALS (layered entrance) ----- */
    /* Exclude elements that have their own dedicated GSAP animations */
    const dedicatedAnimated = ".program-card, .advantage-item, .trust-item, .journey-step, .accordion-item";
    document.querySelectorAll(".reveal").forEach((el) => {
      if (el.matches(dedicatedAnimated)) return;
      gsap.fromTo(el,
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 1.6,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none reverse",
            onEnter: () => activateCinematic(el),
            onEnterBack: () => activateCinematic(el),
            onLeaveBack: () => deactivateCinematic(el)
          }
        }
      );
    });

    /* ----- HERO PARALLAX (layered cinematic drift) ----- */
    const heroSection = document.querySelector(".hero");
    if (heroSection) {
      // Base drift of the whole hero band
      gsap.to(heroSection, {
        y: -90,
        opacity: 0.55,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      // H1 drifts faster — gives a layered depth feel
      const heroH1 = heroSection.querySelector(".hero-content h1");
      if (heroH1) {
        gsap.to(heroH1, {
          y: -140,
          ease: "none",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // Mid-layer (desc + checks) drifts at an intermediate speed
      const heroMid = heroSection.querySelectorAll(".hero-desc, .hero-checks");
      if (heroMid.length > 0) {
        gsap.to(heroMid, {
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }
    }

    /* ----- PROGRAMS: staggered card reveal ----- */
    const programCards = document.querySelectorAll(".program-card");
    if (programCards.length > 0) {
      gsap.fromTo(programCards,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.3,
          stagger: 0.22,
          ease: "expo.out",
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
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            stagger: 0.18,
            ease: "expo.out",
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
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.16,
          ease: "expo.out",
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
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.14,
          ease: "expo.out",
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
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "expo.out",
          scrollTrigger: {
            trigger: ctaSection,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // After all splits + ScrollTriggers are set up, refresh once webfonts
    // finish so trigger positions account for any late layout shifts.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }

  } else if (!prefersReducedMotion) {
    /* ----- FALLBACK: simple IntersectionObserver if no GSAP ----- */
    const reveals = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // Fire cinematic word-split reveals inside the section
          entry.target.querySelectorAll(".word-split").forEach((w) => w.classList.add("ws-in"));
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    reveals.forEach(el => revealObserver.observe(el));

    // Also catch standalone word-split titles that aren't inside a .reveal
    // (e.g. the initial .page-hero h1 on interior pages).
    const looseWordSplits = document.querySelectorAll(".word-split");
    if (looseWordSplits.length > 0) {
      const wsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ws-in");
            wsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      looseWordSplits.forEach(el => wsObserver.observe(el));
    }

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
    document.querySelectorAll(".line-mask").forEach(m => m.classList.add("lm-ready"));
    document.querySelectorAll(".word-split").forEach(w => w.classList.add("ws-in"));
  }

  // Safety net: reveal .page-hero word-split titles immediately on interior
  // pages (they sit above the fold, so the normal scroll trigger wouldn't
  // fire). Must run AFTER the splitter has finished, so chain off fonts.ready
  // with the same ordering as the splitter above.
  if (!prefersReducedMotion) {
    const revealPageHeroTitles = () => {
      const pageHero = document.querySelector(".page-hero");
      if (!pageHero) return;
      pageHero.querySelectorAll(".word-split").forEach((w) => {
        // Double rAF so the base CSS paints before .ws-in transitions start
        requestAnimationFrame(() => {
          requestAnimationFrame(() => w.classList.add("ws-in"));
        });
      });
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(revealPageHeroTitles).catch(revealPageHeroTitles);
    } else {
      requestAnimationFrame(revealPageHeroTitles);
    }
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

/* ============================================
   LUXURY LAYER — cursor, scroll-aware nav
   ============================================
   Appended, purely additive. Does not touch
   any existing handlers above this block.
   ============================================ */
(function luxuryLayer() {
  const supportsFinePointer = window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Custom cursor ---- */
  if (supportsFinePointer) {
    const cursor = document.createElement('div');
    cursor.id = 'lux-cursor';
    const ring = document.createElement('div');
    ring.id = 'lux-cursor-ring';
    document.body.appendChild(cursor);
    document.body.appendChild(ring);

    let mx = -100, my = -100, rx = -100, ry = -100;
    let rafId = null;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
      if (!document.body.classList.contains('lux-ready')) {
        document.body.classList.add('lux-ready');
      }
    };
    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      if (document.body.classList.contains('lux-ready')) {
        cursor.style.opacity = '';
        ring.style.opacity = '';
      }
    });

    const animateRing = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      rafId = requestAnimationFrame(animateRing);
    };
    animateRing();

    // Hover state on interactive elements
    const hoverSelector = 'a, button, input, textarea, select, label, .accordion-header, .insight-card, .feature-card, .program-card, .advantage-item, .trust-item, .journey-step, .insight-link, .nav-link, .hamburger';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSelector)) {
        document.body.classList.add('lux-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSelector) &&
          (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(hoverSelector))) {
        document.body.classList.remove('lux-hover');
      }
    });
  }

  /* ---- Scroll-aware nav states ---- */
  const header = document.querySelector('.header');
  if (header) {
    const darkSelectors = '.cta-section, .footer';
    const updateNav = () => {
      const scrolled = window.scrollY > 40;
      let onDark = false;
      document.querySelectorAll(darkSelectors).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= 90 && r.bottom >= 90) onDark = true;
      });
      header.classList.toggle('on-dark', onDark);
      header.classList.toggle('scrolled', scrolled && !onDark);
      document.body.classList.toggle('on-dark-section', onDark);
    };
    updateNav();
    let scrollRaf = null;
    window.addEventListener('scroll', () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        updateNav();
        scrollRaf = null;
      });
    }, { passive: true });
    window.addEventListener('resize', updateNav);
  }
})();
