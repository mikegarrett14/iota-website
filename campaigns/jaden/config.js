/* =============================================================================
   JADEN PONTO — blitz recruiting page (iotacompany.com/join/jaden)
   Everything Jaden will change lives here. Anything still in [brackets] shows
   highlighted on the page while `draft` is true, so nothing unconfirmed goes
   live by accident.
   ============================================================================= */

window.JADEN = {

  draft: true,           // true = yellow "draft" bar + highlighted [blanks]

  name: "Jaden Ponto",
  firstName: "Jaden",
  instagram: "rev.ponto",

  // How reps get paid, shown in "how you get started".
  pay: "Commission on every deal you sign, paid within 14 days",

  // ── Video ──────────────────────────────────────────────────────────────────
  // YouTube ID or URL, Drive file URL, or direct .mp4. null = placeholder box.
  vsl: null,
  vertical: true,

  // Photo for the "Hi, I'm Jaden" section (path or URL). null = placeholder.
  photo: null,

  // ── Booking ────────────────────────────────────────────────────────────────
  // GHL booking widget URL. Set the calendar's post-booking redirect to
  // https://www.iotacompany.com/join/jaden/booked so bookings are tracked.
  calendar: "",

  // GHL inbound-webhook URL that receives every application (qualified or
  // not), so the texts can follow up with people who never book. Empty = the
  // answers only travel to GHL as calendar prefill.
  webhook: "",

  // ── Qualification knockouts ────────────────────────────────────────────────
  // Answers that end the application with a polite "not right now".
  knockouts: {
    age: ["under-18"],
    status: ["college"],          // Jaden: no full-time college students
    commission: ["need-hourly"]
  },

  pixelId: null          // Meta pixel override; null = IOTA pixel
};
