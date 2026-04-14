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
    guidePreviewImageUrl: "", // e.g. "https://drive.google.com/uc?id=YOUR_FILE_ID"

    // VSL video embed on the high-intent page
    vslVideoEmbedUrl: "", // e.g. "https://drive.google.com/file/d/YOUR_FILE_ID/preview"

    // Welcome video embed on the low-intent course page
    courseWelcomeVideoUrl: "", // e.g. "https://drive.google.com/file/d/YOUR_FILE_ID/preview"

    // Individual module video URLs — add one per module in order
    moduleVideoUrls: [
      "", // Module 01
      "", // Module 02
      "", // Module 03
      "", // Module 04
      "", // Module 05
      "", // Module 06
      "", // Module 07
      "", // Module 08
      "", // Module 09
      "", // Module 10
      "", // Module 11
      "", // Module 12
    ],

    // Downloadable guide PDF
    guidePdfUrl: "", // e.g. "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID"
  },

  // ── FORMS & INTEGRATIONS ────────────────────────────────────────────────────
  integrations: {
    // GoHighLevel or Google Sheets webhook — receives form submissions
    // Leave empty to skip form POST (data still saved to localStorage)
    formWebhookUrl: "https://services.leadconnectorhq.com/hooks/vh0unPPuSGxsLHZhmf83/webhook-trigger/46b01681-73af-4690-87c6-48ac75d85d6a",

    // Calendar embed URL (Calendly, GoHighLevel, etc.)
    // Pasted directly into an <iframe> on the high-intent page
    calendarEmbedUrl: "",
  },

  // ── QUALIFICATION ROUTING ───────────────────────────────────────────────────
  routing: {
    // Income options shown in Step 4 of the form.
    // intent: "high" → high-intent page | intent: "low" → low-intent page
    incomeOptions: [
      { label: "Under $100k/year",    value: "under_100k",  intent: "low"  },
      { label: "$100k – $250k/year",  value: "100k_250k",   intent: "low"  },
      { label: "$250k – $500k/year",  value: "250k_500k",   intent: "low"  },
      { label: "$500k – $750k/year",  value: "500k_750k",   intent: "high" },
      { label: "$750k – $1M/year",    value: "750k_1m",     intent: "high" },
      { label: "$1M+/year",           value: "1m_plus",     intent: "high" },
    ],

    highIntentPage: "high-intent.html",
    lowIntentPage:  "low-intent.html",
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
