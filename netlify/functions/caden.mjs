// =============================================================================
// POST /api/caden — Caden Musselman's webinar registrations (/caden) and
// post-webinar survey (/caden/survey).
//
// Caden isn't on GoHighLevel, so this relays to a free Google Sheet instead:
// the sheet's Apps Script web app (campaigns/caden/sheet-apps-script.gs)
// appends the row and emails Caden. The repo is public, so the web-app URL and
// its shared token live in Netlify env vars, not in code:
//   CADEN_SHEET_URL    the Apps Script web-app /exec URL
//   CADEN_SHEET_TOKEN  must match TOKEN in the Apps Script
// The visitor never sees a failure: we always answer 200, retry once, and log
// the full payload so a lost row can be re-entered by hand.
// =============================================================================

const SHEET_URL = process.env.CADEN_SHEET_URL || '';
const SHEET_TOKEN = process.env.CADEN_SHEET_TOKEN || '';

const text = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function buildPayload(b) {
  const phone = text(b.phone, 20);
  const first_name = text(b.first_name, 80);
  const last_name = text(b.last_name, 80);
  if (!/^\+1[2-9]\d{2}[2-9]\d{6}$/.test(phone) || !first_name || !last_name) return null;
  const base = { first_name, last_name, phone, submitted_at: new Date().toISOString() };

  if (b.type === 'registration') {
    const email = text(b.email, 200);
    const summers = text(b.summers, 3);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !['0', '1', '2', '3+'].includes(summers)) return null;
    return { type: 'registration', ...base, email, summers, company: text(b.company, 120),
      source: text(b.source, 200), webinar: text(b.webinar, 40) };
  }
  if (b.type === 'survey') {
    const rating = text(b.rating, 2);
    if (!/^(10|[1-9])$/.test(rating)) return null;
    return { type: 'survey', ...base, rating, best: text(b.best, 1000), next: text(b.next, 1000),
      meet: text(b.meet, 100) };
  }
  return null;
}

async function post(payload) {
  try {
    // Apps Script answers /exec with a 302 to the result; fetch follows it.
    const res = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: SHEET_TOKEN, ...payload }),
      signal: AbortSignal.timeout(8000)
    });
    const body = (await res.text()).slice(0, 300);
    if (res.ok && body.includes('"ok":true')) return null;
    return 'HTTP ' + res.status + ' ' + body;
  } catch (e) {
    return String((e && e.message) || e);
  }
}

export default async (req) => {
  const ok = () => Response.json({ ok: true });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const payload = buildPayload(body || {});
  if (!payload) {
    console.error('[caden] rejected invalid submission', JSON.stringify(body).slice(0, 2000));
    return Response.json({ ok: false }, { status: 400 });
  }

  if (!SHEET_URL) {
    console.error('[caden] CADEN_SHEET_URL is not set; not sent', JSON.stringify(payload));
    return ok();
  }
  const first = await post(payload);
  if (!first) return ok();
  console.warn('[caden] sheet failed, retrying once', first);
  await new Promise((r) => setTimeout(r, 1000));
  const second = await post(payload);
  if (second) console.error('[caden] sheet failed twice', first, '|', second, JSON.stringify(payload));
  return ok();
};

export const config = { path: '/api/caden' };
