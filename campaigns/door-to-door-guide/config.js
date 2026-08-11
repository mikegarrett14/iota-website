/**
 * IOTA MEDIA — Campaign Configuration
 * CAMPAIGN: Door-to-Door "End of Summer Content Guide"
 *
 * Lead magnet funnel (cloned from campaigns/main) that gives away the free
 * End-of-Summer Content Guide — how to film yourself on the doors + 40 viral
 * scripts. Qualified leads (orange / yellow / green) are then routed to a
 * done-for-you "we'll make all your content for you" page (qualify.html);
 * unqualified leads (red / under $100k) get the guide only (guide.html).
 *
 * This file controls all asset URLs, form endpoints, routing logic, and
 * option lists. Edit here first before touching HTML files.
 *
 * ─── GOOGLE DRIVE ASSET URLS ─────────────────────────────────────────────────
 * PDFs:    Share file → "Anyone with link" → copy ID from URL
 *          Use: https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CONFIG = {

  // ── ASSETS ──────────────────────────────────────────────────────────────────
  assets: {
    // Guide cover image (optional). Not rendered on the landing page right now —
    // the landing is form-first with no intro video. Drop a cover here if you
    // later want to show one above the form.
    guidePreviewImageUrl: "/shared/content-guide-preview.jpg",

    // Intro video is intentionally DISABLED for this campaign. With this left
    // empty, funnel.js skips the watch-to-unlock gate and the "Send me the free
    // guide" button unlocks as soon as an income band is chosen.
    funnelVideoEmbedUrl: "",

    // ⬇️ REPLACE ME — the actual End-of-Summer Content Guide PDF.
    // Drop the file at /shared/end-of-summer-content-guide.pdf, OR paste a
    // Google Drive download link:
    //   https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
    guidePdfUrl: "/shared/end-of-summer-content-guide.pdf",
  },

  // ── FORMS & INTEGRATIONS ────────────────────────────────────────────────────
  integrations: {
    // GoHighLevel webhook — receives the opt-in form submissions for THIS
    // campaign (dedicated "D2D Content Guide — Opt-In" workflow, tagged
    // separately so these never mix with the blueprint funnel's leads).
    formWebhookUrl: "https://services.leadconnectorhq.com/hooks/m815cyhHHAW2XchGWmPu/webhook-trigger/b6fd49e8-2a95-4db7-903b-a5f301df175c",

    // Booking calendar embedded on the qualify (done-for-you) page.
    // Uses the existing door-to-door content-call calendar.
    calendarEmbedUrl: "https://system.iotacompany.com/widget/booking/tL1EmCuMwhwkWzqkWoFy",
  },

  // ── ROUTING ─────────────────────────────────────────────────────────────────
  routing: {
    // Income options shown in Step 5 of the form (SAME bands as the main funnel).
    incomeOptions: [
      { label: "Under $100k/year",    value: "under_100k", intent: "low",  score: "red"    },
      { label: "$100k – $250k/year",  value: "100k_250k",  intent: "low",  score: "orange" },
      { label: "$250k – $500k/year",  value: "250k_500k",  intent: "low",  score: "yellow" },
      { label: "$500k – $750k/year",  value: "500k_750k",  intent: "high", score: "green"  },
      { label: "$750k – $1M/year",    value: "750k_1m",    intent: "high", score: "green"  },
      { label: "$1M+/year",           value: "1m_plus",    intent: "high", score: "green"  },
    ],

    // Orange / yellow / green all land on the SAME done-for-you qualify page.
    // (Both the high- and low-intent routes point here on purpose, so the
    // shared routing logic in funnel.js needs no changes.)
    offerPage: "/campaigns/door-to-door-guide/qualify.html",
    offerPageLowIntent: "/campaigns/door-to-door-guide/qualify.html",

    // Under-$100k (red) leads don't qualify for done-for-you — they just get
    // the guide.
    offerPageUnqualified: "/campaigns/door-to-door-guide/guide.html",
  },

  // ── FORM OPTION LISTS ────────────────────────────────────────────────────────
  formOptions: {
    serviceOptions: [
      "Door-to-door sales",
      "Life insurance",
      "Both",
      "Other",
    ],
    recruitingOptions: [
      "Year-round",
      "Seasonal (e.g., summer)",
      "Just getting started",
    ],
  },

};
