/* =============================================================================
   CLIENT RECRUITING PAGES — one entry per client
   Served at iotacompany.com/join/<slug>. Each slug also needs its two lines in
   /_redirects (the page and its /booked confirmation).

   Fields
     name       Client's full name — used in the page <title> and footer.
     firstName  How the page refers to them ("Book a call with Brenton").
     title      The headline above the video.
     subtitle   One line under the headline. Optional.
     vsl        The client's own video: a YouTube ID, a YouTube / Shorts / Drive
                URL, or a direct .mp4 URL. Leave null to show DEFAULT_VSL until
                they film one.
     vertical   true if the video was filmed on a phone (9:16).
     calendar   Their booking link, as they'd paste it anywhere else:
                  Calendly        https://calendly.com/<user>/<event>
                  GHL calendar    https://<widget host>/widget/booking/<id>
                  Google Calendar https://calendar.google.com/calendar/appointments/schedules/<id>
                For GHL and Google calendars, set the calendar's post-booking
                redirect to https://www.iotacompany.com/join/<slug>/booked so the
                booking is tracked. Calendly bookings are caught on the page.
     pixelId    Optional Meta pixel override. Defaults to the IOTA pixel.
   ============================================================================= */

window.JOIN_DEFAULT_VSL = {
  // The generic "before you book" video, used until a client films their own.
  // TODO: swap in the default video once it's filmed (script: https://claude.ai/artifact/A3Xo7Jd64nhYoFCH5TFAXQ#default).
  vsl: null,
  vertical: true
};

window.JOIN_CLIENTS = {

  brenton: {
    name: "Brenton Clark",
    firstName: "Brenton",
    title: "Join Brenton's Sales Team",
    subtitle: "Watch the video, then grab a time below to see if you're a fit.",
    vsl: "8XbqGyPs3yU",   // "Brenton Clark VSL" on the IOTA Media YouTube
    vertical: false,      // filmed 16:9
    // GHL "Brenton Clark - Sales Team Interview" (IOTA Media sub-account),
    // hosted by Brenton's user; redirects to /join/brenton/booked on booking.
    calendar: "https://system.iotacompany.com/widget/booking/psxVohjCe7PKw2ZpXsld"
  },

  summer: {
    name: "Summer Newman",
    firstName: "Summer",
    title: "Join Summer's Sales Team",
    subtitle: "Watch the video, then grab a time below to see if you're a fit.",
    vsl: null,            // TODO: Summer's filmed VSL (YouTube link or ID)
    vertical: true,
    calendar: ""          // TODO: Summer's booking link
  }

};
