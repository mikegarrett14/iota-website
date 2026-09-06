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

    // Intro video shown on the landing page (above the form) instead of the
    // preview image. It autoplays muted, docks to a corner once the visitor
    // starts filling out the form, and the "Send me the free blueprint" button
    // stays locked until this video has played all the way through.
    funnelVideoEmbedUrl: "https://www.youtube.com/embed/p74u9cayZ5U?autoplay=1&mute=1",

    // VSL video embed on the high-intent offer page
    vslVideoEmbedUrl: "https://www.youtube.com/embed/2xSZJrCm15k?autoplay=1&mute=1",

    // VSL video embed on the low-intent offer page
    lowIntentVslVideoEmbedUrl: "https://www.youtube.com/embed/UTYkTG2WVsM?autoplay=1&mute=1",

    // Downloadable guide PDF
    guidePdfUrl: "/shared/instagram-recruiting-blueprint.pdf",
  },

  // ── FORMS & INTEGRATIONS ────────────────────────────────────────────────────
  integrations: {
    // GoHighLevel or Google Sheets webhook — receives form submissions
    // Leave empty to skip form POST (data still saved to localStorage)
    formWebhookUrl: "https://services.leadconnectorhq.com/hooks/m815cyhHHAW2XchGWmPu/webhook-trigger/90212619-297c-46e1-93ed-81afc56c19a1",

    // Calendar embed URL (Calendly, GoHighLevel, etc.)
    // Pasted directly into an <iframe> on the high-intent page
    calendarEmbedUrl: "https://system.iotacompany.com/widget/booking/CCB7nqri3v3VJY0tjzrB",
  },

  // ── ROUTING ─────────────────────────────────────────────────────────────────
  routing: {
    // Income options shown in the income step of the form.
    // `score` is the lead colour sent to GHL as `recruiting_season`.
    incomeOptions: [
      { label: "Under $200k/year",    value: "under_200k", intent: "low",  score: "red"    },
      { label: "$200k - $500k/year",  value: "200k_500k",  intent: "low",  score: "yellow" },
      { label: "$500k - $750k/year",  value: "500k_750k",  intent: "high", score: "green"  },
      { label: "$750k+/year",         value: "750k_plus",  intent: "high", score: "green"  },
    ],

    // Team size options shown in the step before income.
    // A team under 10 active reps drops the lead to red — but only below the
    // $500k bands, which score green on income alone regardless of team size.
    // Remove this list to drop the team-size step from a campaign entirely.
    teamSizeOptions: [
      { label: "Fewer than 10 reps", value: "under_10", meetsRepMinimum: false },
      { label: "10 - 24 reps",       value: "10_24",    meetsRepMinimum: true  },
      { label: "25 - 49 reps",       value: "25_49",    meetsRepMinimum: true  },
      { label: "50+ reps",           value: "50_plus",  meetsRepMinimum: true  },
    ],

    // Keep the `intent` sent to GHL in step with the lead score rather than the
    // raw income band: red posts "low", yellow and green post "high". Without
    // this a yellow lead reaches the booking calendar but still posts
    // intent: "low", so GHL workflows that branch on intent tag it wrong.
    intentFollowsScore: true,

    // Yellow and green both land here — VSL + booking calendar.
    offerPage: "/campaigns/main/offer.html",

    // Not reachable from the funnel any more: routing sends yellow to
    // offerPage, and this campaign has no orange band. The page is still
    // live for anything that links to it directly.
    offerPageLowIntent: "/campaigns/main/offer-low-intent.html",

    // Red leads don't qualify for a call — they get a blueprint with a
    // built-in video tutorial instead of the booking calendar.
    offerPageUnqualified: "/campaigns/main/offer-unqualified.html",
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
