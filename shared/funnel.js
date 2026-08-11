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

  // Intro-video gating state
  let videoEnded = false;      // true once the intro video has played through
  let incomeSelected = false;  // true once the visitor picks an income band
  let funnelPlayer = null;     // YouTube IFrame API player instance
  let completionPoll = null;   // interval that watches for near-end completion

  // ── UTM CAPTURE ───────────────────────────────────────────────────────────
  (function captureUtmParams() {
    const params = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(function (key) {
      const value = params.get(key);
      if (value) formData[key] = value;
    });
  })();

  // ── INIT ───────────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    initFunnelVideo();
    initIndustryOptions();
    initIncomeOptions();
    showStep(1);
  });

  // ── INTRO VIDEO ───────────────────────────────────────────────────────────
  // Builds the YouTube player, autoplays it muted, and wires up the events that
  // unlock the final "Send me the free blueprint" button once it plays through.
  function initFunnelVideo() {
    const container = document.getElementById("funnel-video");
    const url = CONFIG.assets.funnelVideoEmbedUrl;

    // No intro video on this page/campaign (empty funnelVideoEmbedUrl or no
    // video container) → there's nothing to watch, so don't gate the final CTA.
    // Treat the video as already finished; the button unlocks on income select.
    if (!container || !url) {
      videoEnded = true;
      return;
    }

    const placeholder = document.getElementById("funnel-video-placeholder");
    if (placeholder) placeholder.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "funnel-player";
    iframe.src = url + "&enablejsapi=1&playsinline=1&rel=0";
    iframe.allow = "autoplay; fullscreen";
    iframe.allowFullscreen = true;

    const badge = document.createElement("div");
    badge.className = "funnel-video-badge";
    badge.textContent = "Keep watching 👀";

    // Expand control — lets a docked viewer pop the video out to full size,
    // and a close control to shrink it back into the corner.
    const expandBtn = document.createElement("button");
    expandBtn.type = "button";
    expandBtn.className = "funnel-video-expand";
    expandBtn.setAttribute("aria-label", "Watch full screen");
    expandBtn.innerHTML = '<span aria-hidden="true">⤢</span> Full screen';
    expandBtn.onclick = window.expandFunnelVideo;

    const collapseBtn = document.createElement("button");
    collapseBtn.type = "button";
    collapseBtn.className = "funnel-video-collapse";
    collapseBtn.setAttribute("aria-label", "Minimize video");
    collapseBtn.innerHTML = '<span aria-hidden="true">✕</span>';
    collapseBtn.onclick = window.collapseFunnelVideo;

    container.appendChild(iframe);
    container.appendChild(badge);
    container.appendChild(expandBtn);
    container.appendChild(collapseBtn);

    // The IFrame API calls this global once it finishes loading.
    window.onYouTubeIframeAPIReady = function () {
      funnelPlayer = new YT.Player("funnel-player", {
        events: {
          onStateChange: function (e) {
            if (e.data === YT.PlayerState.ENDED) {
              markVideoEnded();
            } else if (e.data === YT.PlayerState.PLAYING) {
              startCompletionPoll();
            }
          },
        },
      });
    };

    const apiScript = document.createElement("script");
    apiScript.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(apiScript);
  }

  // Backstop for the ENDED event: some browsers don't fire it reliably, so we
  // also treat "watched to ~98%" as complete.
  function startCompletionPoll() {
    if (completionPoll || videoEnded) return;
    completionPoll = setInterval(function () {
      if (!funnelPlayer || typeof funnelPlayer.getDuration !== "function") return;
      const dur = funnelPlayer.getDuration();
      const cur = funnelPlayer.getCurrentTime();
      if (dur > 0 && cur / dur >= 0.98) {
        markVideoEnded();
      }
    }, 1000);
  }

  function markVideoEnded() {
    if (videoEnded) return;
    videoEnded = true;
    if (completionPoll) {
      clearInterval(completionPoll);
      completionPoll = null;
    }
    updateBlueprintButton();

    // Once watched, fade out the mini-player (docked or expanded) to declutter.
    const outer = document.getElementById("funnel-video-outer");
    if (outer && (outer.classList.contains("docked") || outer.classList.contains("expanded"))) {
      outer.classList.add("done");
      setTimeout(function () { outer.style.display = "none"; }, 500);
    }
  }

  // ── VIDEO DOCKING ─────────────────────────────────────────────────────────
  // Once the visitor advances past the name step, shrink the video into a
  // corner so it keeps playing while they fill things out.
  function dockVideo() {
    if (videoEnded) return;
    const outer = document.getElementById("funnel-video-outer");
    if (outer && !outer.classList.contains("docked")) {
      outer.classList.add("docked");
    }
  }

  // Pop the docked mini-player out to a large, centred view so the visitor can
  // watch full size while they wait, then shrink it back to the corner.
  window.expandFunnelVideo = function () {
    const outer = document.getElementById("funnel-video-outer");
    if (!outer) return;
    outer.classList.remove("docked");
    outer.classList.add("expanded");
  };

  window.collapseFunnelVideo = function () {
    const outer = document.getElementById("funnel-video-outer");
    if (!outer || videoEnded) return;
    outer.classList.remove("expanded");
    outer.classList.add("docked");
  };

  // ── FINAL CTA (blueprint submit) ──────────────────────────────────────────
  // Shown once an income is picked; unlocked only after the video plays through.
  function updateBlueprintButton() {
    const btn = document.getElementById("blueprint-submit");
    const hint = document.getElementById("video-lock-hint");
    if (!btn) return;

    if (!incomeSelected) {
      btn.style.display = "none";
      if (hint) hint.style.display = "none";
      return;
    }

    btn.style.display = "block";
    if (videoEnded) {
      btn.classList.remove("cta-btn--locked");
      if (hint) hint.style.display = "none";
    } else {
      btn.classList.add("cta-btn--locked");
      if (hint) hint.style.display = "block";
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
          document.getElementById("industry-continue").style.display = "block";
          document.getElementById("industry-other").focus();
        } else {
          otherWrap.style.display = "none";
          formData.industryOther = "";
          btn.classList.add("selected");
          setTimeout(function () { goToStep(5); }, 220);
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
        formData.incomeValue = opt.value;
        formData.intent = opt.intent;
        formData.recruiting_season = opt.score;

        // Visual feedback, then reveal the final CTA (which stays locked until
        // the intro video has played through).
        document.querySelectorAll("#income-options .option-btn").forEach(function (b) {
          b.classList.remove("selected");
        });
        btn.classList.add("selected");

        incomeSelected = true;
        updateBlueprintButton();
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
    // Any forward move means they're filling out the form — dock the video.
    if (n >= 2) dockVideo();
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
    // Guard: never submit until an income is chosen and the video is finished.
    if (!incomeSelected || !videoEnded) return;

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
      const payload = Object.assign({}, formData);
      // Other industry always scores red regardless of income
      if (payload.industry === "other") {
        payload.recruiting_season = "red";
      }
      // Send the typed value so GHL shows the real industry name
      if (payload.industry === "other" && payload.industryOther) {
        payload.industry = payload.industryOther;
      }
      delete payload.industryOther;


      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {
        // Silently continue — don't block the user on a network error
      });
    }

    var page;
    if (formData.incomeValue === "under_100k") {
      // Under-$100k leads don't qualify for a call — send them to the
      // video-tutorial thank-you page instead of the booking calendar.
      page = CONFIG.routing.offerPageUnqualified;
    } else if (formData.intent === "high") {
      page = CONFIG.routing.offerPage;
    } else {
      page = CONFIG.routing.offerPageLowIntent;
    }
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
