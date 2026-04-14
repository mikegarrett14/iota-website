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
    initIncomeOptions();
    initServiceOptions();
    initRecruitingOptions();
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
    } else {
      img.style.display = "none";
      placeholder.style.display = "flex";
    }
  }

  // ── BUILD INCOME OPTIONS (Step 4) ─────────────────────────────────────────
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

        setTimeout(function () { goToStep(5); }, 220);
      });

      container.appendChild(btn);
    });
  }

  // ── BUILD SERVICE OPTIONS (Step 5) ────────────────────────────────────────
  function initServiceOptions() {
    const select = document.getElementById("service-select");
    if (!select) return;

    CONFIG.formOptions.serviceOptions.forEach(function (opt) {
      const el = document.createElement("option");
      el.value = opt;
      el.textContent = opt;
      select.appendChild(el);
    });
  }

  function initRecruitingOptions() {
    const select = document.getElementById("recruiting-select");
    if (!select) return;

    CONFIG.formOptions.recruitingOptions.forEach(function (opt) {
      const el = document.createElement("option");
      el.value = opt;
      el.textContent = opt;
      select.appendChild(el);
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

    if (n === 5) {
      const service    = val("service-select");
      const recruiting = val("recruiting-select");
      if (!service) {
        showError("Please select the service you sell.");
        document.getElementById("service-select").classList.add("error");
        return false;
      }
      if (!recruiting) {
        showError("Please select your recruiting model.");
        document.getElementById("recruiting-select").classList.add("error");
        return false;
      }
      formData.service    = service;
      formData.recruiting = recruiting;
    }

    return true;
  }

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  window.submitForm = function () {
    if (!validateStep(5)) return;

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

    // Route based on qualification
    const dest = formData.intent === "high"
      ? CONFIG.routing.highIntentPage
      : CONFIG.routing.lowIntentPage;

    window.location.href = dest + "?fn=" + encodeURIComponent(formData.firstName);
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
