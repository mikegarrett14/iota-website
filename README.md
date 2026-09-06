# Iota Media — Website

Lead generation funnel for Iota Media. Built to run multiple ad campaigns from the same codebase.

---

## Structure

```
campaigns/
  main/               ← The primary campaign (duplicate for new campaigns)
    config.js         ← ALL settings, asset URLs, and endpoints live here
    index.html        ← Landing page with multi-step qualification form
    high-intent.html  ← VSL + booking page (for $500k+/year leads)
    low-intent.html   ← School Community course page (for under $500k leads)
shared/
  styles.css          ← All shared styles (edit for global design changes)
  funnel.js           ← Form logic, routing, and submission (rarely needs editing)
```

---

## How to drop in a new asset

All asset URLs live in `campaigns/main/config.js`. Open that file and find the `assets` section.

### Google Drive assets

1. Upload your file to Google Drive
2. Right-click → Share → set to "Anyone with the link"
3. Copy the file ID from the URL (the long string between `/d/` and `/view`)
4. Paste the full URL into `config.js` using the format shown in the comments

**Image** (guide preview):
```
https://drive.google.com/uc?id=YOUR_FILE_ID
```

**Video** (VSL or course videos):
```
https://drive.google.com/file/d/YOUR_FILE_ID/preview
```

**PDF** (guide download):
```
https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
```

---

## How to connect a form

In `config.js`, set `integrations.formWebhookUrl` to your GoHighLevel or Google Sheets webhook URL. The form will POST JSON to that endpoint on submission. No other changes needed.

---

## How to add a calendar

In `config.js`, set `integrations.calendarEmbedUrl` to your Calendly or GoHighLevel calendar embed URL. It will automatically appear on the high-intent page when a lead clicks "Book a Strategy Call."

---

## How to run a second campaign

1. Duplicate the `campaigns/main/` folder (e.g., `campaigns/life-insurance/`)
2. Open `config.js` in the new folder and update:
   - Asset URLs for the new campaign's videos/images/guide
   - Form webhook URL if using a separate pipeline
   - Income options or routing logic if different
3. Edit the HTML files for any headline or copy changes specific to that campaign
4. Point your ad traffic to `campaigns/life-insurance/index.html`

The `shared/` folder is used by all campaigns — changes there affect every campaign.

---

## How to edit copy

- **Headlines, body text, CTAs**: edit directly in the HTML files
- **Form options** (income ranges, service types, recruiting model): edit `config.js` → `routing.incomeOptions` and `formOptions`
- **Module titles and descriptions** on the course page: edit the `MODULES` array at the bottom of `low-intent.html`
- **Coaching call details**: edit the HTML directly in `low-intent.html` in the CTA panel section

---

## Form flow

The main form at `campaigns/main/index.html` has 6 steps:

1. Name (first + last)
2. Email
3. Phone
4. Industry (tap to select — auto-advances)
5. Team size (tap to select — auto-advances)
6. Annual income (tap to select — reveals the submit button)

The door-to-door guide funnel has no team-size step and scores on income alone.
Any campaign can drop the step by removing `routing.teamSizeOptions` from its
`config.js` (or the `#team-size-options` container from its HTML).

---

## Qualification logic

The lead colour is sent to GHL as `recruiting_season` and decides the destination page.

| Annual income | 10+ active reps | Under 10 active reps |
|---|---|---|
| Under $200k | 🔴 red | 🔴 red |
| $200k - $500k | 🟡 yellow | 🔴 red |
| $500k - $750k | 🟢 green | 🟢 green |
| $750k+ | 🟢 green | 🟢 green |

The rep-count gate only applies below $500k — the $500k+ bands qualify on income alone.

Option labels in this campaign use plain hyphens, not en dashes, so exact-match
filters in GHL are safe to type by hand. The door-to-door guide config still uses
en dashes in its labels — don't "fix" those without checking the GHL data first.

| Colour | Path |
|---|---|
| 🔴 red | `offer-unqualified.html` — blueprint + video tutorial, no calendar |
| 🟡 yellow | `offer.html` — VSL + booking calendar |
| 🟢 green | `offer.html` — VSL + booking calendar |

A few extra rules:

- **Industry = "Other"** forces `recruiting_season: "red"` in the webhook payload only.
  It does not change which page the lead lands on.
- **`intent` follows the score, not the income band**, because
  `routing.intentFollowsScore` is set in this campaign's config: red posts `"low"`,
  yellow and green post `"high"`. So `intent: "high"` always means "this lead got
  the booking calendar", which is what the GHL workflow branches on. Campaigns
  without that flag (the D2D guide) keep the income band's own `intent`.
- To change the bands or colours, edit `config.js` → `routing.incomeOptions` and
  `routing.teamSizeOptions`. The rep gate itself lives in `computeLeadScore()` in
  `shared/funnel.js`.

---

## GoHighLevel webhook

On form submission, the following JSON is POSTed to the webhook at `config.js` → `integrations.formWebhookUrl`:

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "phone": "5551234567",
  "industry": "Roofing",
  "team_size": "25 - 49 reps",
  "teamSizeValue": "25_49",
  "incomeLabel": "$500k - $750k/year",
  "incomeValue": "500k_750k",
  "intent": "high",
  "recruiting_season": "green"
}
```

### GHL field mapping

| JSON field | GHL contact property |
|---|---|
| `firstName` | First Name (standard) |
| `lastName` | Last Name (standard) |
| `email` | Email (standard) |
| `phone` | Phone (standard) |
| `industry` | `{{ contact.industry }}` — text field |
| `team_size` | `{{ contact.team_size }}` — text field (must be created in GHL) |
| `incomeLabel` | `{{ contact.income_label }}` — dropdown field |
| `intent` | `{{ contact.intent }}` — text field (`"high"` or `"low"`) |
| `recruiting_season` | `{{ contact.recruiting_season }}` — text field, holds the lead colour |

`recruiting_season` is a repurposed field: it carries `red` / `yellow` / `green`, not a
season. The main funnel no longer sends `orange` — the door-to-door guide funnel still does.

---

## Rules

- All settings (URLs, endpoints, form options) live in `config.js` — never edit `funnel.js` for routine changes
- To add a new campaign, duplicate the `campaigns/main/` folder and update the new `config.js`
- Changes to `shared/styles.css` affect all campaigns
