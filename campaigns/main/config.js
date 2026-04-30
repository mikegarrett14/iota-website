/**
 * IOTA MEDIA — Campaign Configuration
 *
 * This file controls all asset URLs, form endpoints, routing logic,
 * and option lists. Edit here first before touching HTML files.
 *
 * ─── TO CREATE A NEW CAMPAIGN ────────────────────────────────────────────────
 * 1. Duplicate the entire `campaigns/main/` folder
 * 2. Rename it (e.g., `campaigns/life-insurance/`)
 * 3. Update this config.js with the new campaign's assets and endpoints
 * 4. Edit the HTML files for any copy changes specific to that campaign
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── GOOGLE DRIVE ASSET URLS ─────────────────────────────────────────────────
 * Images:  Share file → "Anyone with link" → copy ID from URL
 *          Use: https://drive.google.com/uc?id=YOUR_FILE_ID
 *
 * Videos:  Share file → "Anyone with link" → copy ID from URL
 *          Use: https://drive.google.com/file/d/YOUR_FILE_ID/preview
 *
 * PDFs:    Share file → "Anyone with link" → copy ID from URL
 *          Use: https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CONFIG = {

  // ── ASSETS ──────────────────────────────────────────────────────────────────
  assets: {
    // Guide preview image shown on the landing page above the form
    // Replace YOUR_FILE_ID with the Google Drive file ID
    guidePreviewImageUrl: "/shared/blueprint-preview.jpg",

    // VSL video embed on the high-intent offer page
    vslVideoEmbedUrl: "https://www.youtube.com/embed/lsV2p_lCG_8?autoplay=1&mute=1",

    // VSL video embed on the low-intent offer page
    lowIntentVslVideoEmbedUrl: "https://www.youtube.com/embed/lsV2p_lCG_8?autoplay=1&mute=1",

    // Downloadable guide PDF
    guidePdfUrl: "https://docs.google.com/document/d/1MXRKkJmVvLZ2Da4atpfWf4tjdiMbJ0z-l_IBdFFWupk/export?format=pdf",
  },

  // ── FORMS & INTEGRATIONS ────────────────────────────────────────────────────
  integrations: {
    // GoHighLevel or Google Sheets webhook — receives form submissions
    // Leave empty to skip form POST (data still saved to localStorage)
    formWebhookUrl: "https://services.leadconnectorhq.com/hooks/m815cyhHHAW2XchGWmPu/webhook-trigger/90212619-297c-46e1-93ed-81afc56c19a1",

    // Calendar embed URL (Calendly, GoHighLevel, etc.)
    // Pasted directly into an <iframe> on the high-intent page
    calendarEmbedUrl: "",
  },

  // ── ROUTING ─────────────────────────────────────────────────────────────────
  routing: {
    // Income options shown in Step 4 of the form.
    // All options route to the same offer page.
    incomeOptions: [
      { label: "Under $100k/year",    value: "under_100k", intent: "low"  },
      { label: "$100k – $250k/year",  value: "100k_250k",  intent: "low"  },
      { label: "$250k – $500k/year",  value: "250k_500k",  intent: "low"  },
      { label: "$500k – $750k/year",  value: "500k_750k",  intent: "low"  },
      { label: "$750k – $1M/year",    value: "750k_1m",    intent: "high" },
      { label: "$1M+/year",           value: "1m_plus",    intent: "high" },
    ],

    offerPage: "/campaigns/main/offer.html",
    offerPageLowIntent: "/campaigns/main/offer-low-intent.html",
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
