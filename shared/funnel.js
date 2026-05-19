/**
 * IOTA MEDIA — Funnel Logic
 * Handles multi-step form: navigation, validation, submission, and routing.
 * Reads CONFIG from the campaign's config.js (loaded before this script).
 */

(function () {
  "use strict";

  // ── STATE ──────────────────────────────────────────────────────────────────
  let currentStep = 1;
  const totalSteps = 5;
  const formData = {};

  // ── INIT ───────────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    initGuidePreview();
    initIndustryOptions();
    initIncomeOptions();
    showStep(1);
  });

  // ── GUIDE PREVIEW IMAGE ───────────────────────────────────────────────────
  function initGuidePreview() {
    const url = CONFIG.assets.guidePreviewImageUrl;
    const img = document.getElementById("guide-preview-img");
    const placeholder = document.getElementById("guide-preview-placeholder");
    if (!img || !placeholder) return;

    if (url) {
      img.src = url;
      img.style.display = "block";
      placeholder.style.display = "none";
      img.onerror = function () {
        img.style.display = "none";
        placeholder.style.display = "flex";
      };
    } else {
      img.style.display = "none";
      placeholder.style.display = "flex";
    }
  }

  // ── INDUSTRY OPTIONS (Step 4) ─────────────────────────────────────────────
  function initIndustryOptions() {
    const btns = document.querySelectorAll("#industry-options .option-btn");
    const otherWrap = document.getElementById("industry-other-wrap");
    if (!btns.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
        formData.industry = btn.dataset.value;
        if (btn.dataset.value === "other") {
          otherWrap.style.display = "block";
          document.getElementById("industry-other").focus();
        } else {
          otherWrap.style.display = "none";
          formData.industryOther = "";
        }
      });
    });
  }

  // ── BUILD INCOME OPTIONS (Step 5) ─────────────────────────────────────────
  function initIncomeOptions() {
    const container = document.getElementById("income-options");
    if (!container) return;

    CONFIG.routing.incomeOptions.forEach(function (opt) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-btn";
      btn.textContent = opt.label;
      btn.dataset.value = opt.value;
      btn.dataset.intent = opt.intent;

      btn.addEventListener("click", function () {
        formData.incomeLabel = opt.label;
        formData.intent = opt.intent;

        // Visual feedback then auto-advance
        document.querySelectorAll("#income-options .option-btn").forEach(function (b) {
          b.classList.remove("selected");
        });
        btn.classList.add("selected");

        setTimeout(function () { submitForm(); }, 220);
      });

      container.appendChild(btn);
    });
  }

  // ── STEP NAVIGATION ───────────────────────────────────────────────────────
  function showStep(n) {
    document.querySelectorAll(".step").forEach(function (el) {
      el.classList.add("hidden");
    });
    const target = document.getElementById("step-" + n);
    if (target) {
      target.classList.remove("hidden");
    }
    currentStep = n;
    clearError();

    // Fire GA4 event when a new step is reached
    if (typeof gtag === "function") {
      gtag("event", "funnel_step_view", { step_number: n });
    }
  }

  function goToStep(n) {
    if (n > currentStep && !validateStep(currentStep)) return;
    showStep(n);
  }

  // ── VALIDATION ────────────────────────────────────────────────────────────
  function validateStep(n) {
    clearError();

    if (n === 1) {
      const first = val("first-name");
      const last  = val("last-name");
      if (!first || !last) {
        showError("Please enter your first and last name.");
        if (!first) document.getElementById("first-name").classList.add("error");
        if (!last)  document.getElementById("last-name").classList.add("error");
        return false;
      }
      formData.firstName = first;
      formData.lastName  = last;
    }

    if (n === 2) {
      const email = val("email");
      if (!email || !isValidEmail(email)) {
        showError("Please enter a valid email address.");
        document.getElementById("email").classList.add("error");
        return false;
      }
      formData.email = email;
    }

    if (n === 3) {
      const phone = val("phone");
      if (!phone || phone.replace(/\D/g, "").length < 7) {
        showError("Please enter a valid phone number.");
        document.getElementById("phone").classList.add("error");
        return false;
      }
      formData.phone = phone;
    }

    if (n === 4) {
      if (!formData.industry) {
        showError("Please select your industry.");
        return false;
      }
      if (formData.industry === "other") {
        const other = val("industry-other");
        if (!other) {
          showError("Please specify your industry.");
          document.getElementById("industry-other").classList.add("error");
          return false;
        }
        formData.industryOther = other;
      }
    }

    return true;
  }

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  window.submitForm = function () {

    // Fire GA4 conversion event
    if (typeof gtag === "function") {
      gtag("event", "form_submit", { intent: formData.intent });
    }

    // Fire Meta Pixel Lead event
    if (typeof fbq === "function") {
      fbq("track", "Lead");
    }

    // Persist to localStorage so the destination page can personalise
    try { localStorage.setItem("iotaLead", JSON.stringify(formData)); } catch (e) {}

    // Fire-and-forget POST to webhook if configured
    const endpoint = CONFIG.integrations.formWebhookUrl;
    if (endpoint) {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        keepalive: true,
      }).catch(function () {
        // Silently continue — don't block the user on a network error
      });
    }

    var page = formData.intent === "high"
      ? CONFIG.routing.offerPage
      : CONFIG.routing.offerPageLowIntent;
    window.location.href = page + "?fn=" + encodeURIComponent(formData.firstName);
  };

  // ── EXPOSE NAVIGATION TO HTML ─────────────────────────────────────────────
  window.nextStep = function (from) { goToStep(from + 1); };
  window.prevStep = function (from) { showStep(from - 1); };

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function isValidEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function showError(msg) {
    const el = document.getElementById("error-msg");
    if (el) el.textContent = msg;
  }

  function clearError() {
    const el = document.getElementById("error-msg");
    if (el) el.textContent = "";
    document.querySelectorAll(".error").forEach(function (el) {
      el.classList.remove("error");
    });
  }
})();
