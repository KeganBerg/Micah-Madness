// Cloud save for Micah Madness. A player's save is stored under a random cloud code
// (like a password) in Netlify Blobs. GET reads it, PUT replaces it. No accounts, no emails.
import { getStore } from '@netlify/blobs';

const CODE = /^[A-HJ-NP-Z2-9]{10}$/; // no 0/O, 1/I lookalikes
const MAX_BYTES = 100_000;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const code = (url.searchParams.get('code') ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!CODE.test(code)) return json(400, { error: 'bad code' });
  const store = getStore('micah-saves');

  if (req.method === 'GET') {
    const entry = await store.get(code, { type: 'json' });
    return entry ? json(200, entry) : json(404, { error: 'not found' });
  }

  if (req.method === 'PUT') {
    const text = await req.text();
    if (text.length > MAX_BYTES) return json(413, { error: 'too big' });
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return json(400, { error: 'bad json' });
    }
    const save = (body as { save?: unknown })?.save;
    if (!save || typeof save !== 'object' || Array.isArray(save)) return json(400, { error: 'no save' });
    const savedAt = Number((save as { savedAt?: unknown }).savedAt) || Date.now();
    // Never let an older copy (a phone left open in the background) overwrite newer progress.
    // The game merges the copy sent back here with its own and uploads the result.
    const current = (await store.get(code, { type: 'json' })) as { save?: unknown; savedAt?: number } | null;
    if (current && Number(current.savedAt) > savedAt) return json(409, { error: 'stale', ...current });
    await store.setJSON(code, { save, savedAt, updatedAt: Date.now() });
    return json(200, { ok: true, savedAt });
  }

  return json(405, { error: 'method not allowed' });
};

export const config = { path: '/api/cloud' };
