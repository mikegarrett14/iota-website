// =============================================================================
// POST /api/apply — relays the /apply application to GHL's inbound webhook.
// The browser posts here so the webhook URL never reaches the page. The repo is
// public, so the URL lives in the Netlify env var GHL_WEBHOOK_URL, not in code.
//
// Step 1 is sent when the applicant gives their phone number, step 2 when their
// video has uploaded. Both carry the phone number so GHL matches one contact.
// The applicant never sees a failure: we always answer 200, retry once, and log.
// =============================================================================

const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL || '';

const AGE_RANGES = ['18 to 21', '22 to 27', '28 to 35', '36 or older'];
const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const text = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Builds the exact payload GHL receives, in the documented field order.
// Returns null when the request doesn't hold a valid step.
function buildPayload(b) {
  const base = { client: text(b.client, 100), source: text(b.source, 100), submitted_at: new Date().toISOString() };
  const phone = text(b.phone, 20);
  if (!/^\+1[2-9]\d{2}[2-9]\d{6}$/.test(phone)) return null;
  const first_name = text(b.first_name, 80);
  const last_name = text(b.last_name, 80);
  if (!first_name || !last_name) return null;

  if (b.step === 1) {
    const age_range = text(b.age_range);
    const city = text(b.city, 100);
    const state = text(b.state, 2).toUpperCase();
    if (!AGE_RANGES.includes(age_range) || !city || !STATES.includes(state)) return null;
    return { step: 1, first_name, last_name, age_range, city, state, phone, ...base };
  }

  if (b.step === 2) {
    const start_date = text(b.start_date, 10);
    const full_time_travel = text(b.full_time_travel);
    const competed = text(b.competed, 500);
    const hardest_commitment = text(b.hardest_commitment, 500);
    const video_url = text(b.video_url, 500);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date) || !['Yes', 'No'].includes(full_time_travel)) return null;
    if (!competed || !hardest_commitment || !/^https:\/\//.test(video_url)) return null;
    return { step: 2, phone, first_name, last_name, start_date, full_time_travel, competed,
      hardest_commitment, video_url, ...base };
  }
  return null;
}

async function post(payload) {
  try {
    const res = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) return null;
    return 'HTTP ' + res.status + ' ' + (await res.text()).slice(0, 300);
  } catch (e) {
    return String(e && e.message || e);
  }
}

export default async (req) => {
  const ok = () => Response.json({ ok: true });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const payload = buildPayload(body || {});
  if (!payload) {
    console.error('[apply] rejected invalid step', JSON.stringify(body).slice(0, 2000));
    return Response.json({ ok: false }, { status: 400 });
  }

  // Logged in full so a lost submission can be re-sent by hand from the
  // Netlify function logs.
  if (!GHL_WEBHOOK_URL) {
    console.error('[apply] GHL_WEBHOOK_URL is not set; not sent', JSON.stringify(payload));
    return ok();
  }
  const first = await post(payload);
  if (!first) return ok();
  console.warn('[apply] GHL webhook failed, retrying once', first);
  await new Promise((r) => setTimeout(r, 1000));
  const second = await post(payload);
  if (second) console.error('[apply] GHL webhook failed twice', first, '|', second, JSON.stringify(payload));
  return ok();
};

export const config = { path: '/api/apply' };
