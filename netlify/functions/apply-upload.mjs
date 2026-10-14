// =============================================================================
// POST /api/apply/upload — signs a Cloudinary upload for the /apply video.
// The browser then sends the file straight to Cloudinary in 20 MB chunks (a
// Netlify function can't take a 300 MB body), and gets back the video URL.
// The API secret stays here; the page only ever sees a one-off signature.
//
// Netlify env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
// CLOUDINARY_API_SECRET. CLOUDINARY_API_BASE is only for local testing.
// =============================================================================

import { createHash } from 'node:crypto';

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || '';
const KEY = process.env.CLOUDINARY_API_KEY || '';
const SECRET = process.env.CLOUDINARY_API_SECRET || '';
const API_BASE = process.env.CLOUDINARY_API_BASE || 'https://api.cloudinary.com/v1_1';
const FOLDER = 'apply-videos';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!CLOUD || !KEY || !SECRET) {
    console.error('[apply-upload] Cloudinary env vars are not set');
    return Response.json({ ok: false }, { status: 503 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  // Cloudinary signs the alphabetised params, then the secret: sha1 hex.
  const signature = createHash('sha1').update(`folder=${FOLDER}&timestamp=${timestamp}${SECRET}`).digest('hex');
  return Response.json({
    ok: true,
    upload_url: `${API_BASE}/${CLOUD}/video/upload`,
    api_key: KEY,
    folder: FOLDER,
    timestamp,
    signature
  });
};

export const config = { path: '/api/apply/upload' };
