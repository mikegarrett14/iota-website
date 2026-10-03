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

  // ── The next blitz ─────────────────────────────────────────────────────────
  blitz: {
    // ISO start time for the countdown. null hides the timer.
    // TODO: real date. This one is a placeholder so the mock shows a timer.
    start: "2026-11-02T08:00:00-08:00",
    dates:    "[Nov 2–6]",
    city:     "[City, State]",
    days:     "[5]",
    spots:    "[12]",
    product:  "[solar / pest control]",
    day:      "[meet at 11, train, then knock until dark]",
    housing:  "[Housing covered / you cover your own room]",
    travel:   "[You get yourself there / we carpool from OC]",
    pay:      "[Commission on every deal you sign, paid within X days]"
  },

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
    commission: ["need-hourly"],
    travel: ["cant-travel"]
  },

  pixelId: null          // Meta pixel override; null = IOTA pixel
};
