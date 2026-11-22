// Cloud save: keeps a copy of the save online under a secret 10-letter code, so progress
// follows the player to another phone or computer. Served by netlify/functions/cloud.mts.
import { migrate, type SaveData } from './save';

const API = '/api/cloud';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newCode(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
}

/** ABCDE-FGHJK, easier to read out and type. */
export const prettyCode = (code: string) => `${code.slice(0, 5)}-${code.slice(5)}`;
export const cleanCode = (typed: string) => typed.toUpperCase().replace(/[^A-Z0-9]/g, '');
export const validCode = (code: string) => /^[A-HJ-NP-Z2-9]{10}$/.test(code);

/** Called with the cloud's copy when it turned out to be newer than the one being uploaded. */
let onStale: ((remote: SaveData) => void) | null = null;
export const whenCloudIsNewer = (cb: (remote: SaveData) => void) => (onStale = cb);

export async function upload(save: SaveData): Promise<boolean> {
  if (!save.cloud) return false;
  try {
    const res = await fetch(`${API}?code=${save.cloud}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ save }),
      keepalive: true,
    });
    if (res.status === 409) {
      // Another device saved more recently: hand its copy back so the game can merge the two.
      const body = (await res.json().catch(() => null)) as { save?: unknown } | null;
      if (body?.save && onStale) {
        const remote = migrate(body.save);
        remote.cloud = save.cloud;
        onStale(remote);
      }
      return false;
    }
    return res.ok;
  } catch {
    return false;
  }
}

/** The cloud copy for a code: a save, 'missing' if nothing is stored there, or null when offline. */
export async function download(code: string): Promise<SaveData | 'missing' | null> {
  try {
    const res = await fetch(`${API}?code=${code}`, { cache: 'no-store' });
    if (res.status === 404) return 'missing';
    if (!res.ok) return null;
    const body = (await res.json()) as { save?: unknown };
    const data = migrate(body.save);
    data.cloud = code;
    return data;
  } catch {
    return null;
  }
}

/** Uploads when the game goes to the background, and every minute while playing if anything changed. */
export function startAutoSync(get: () => SaveData): void {
  let last = '';
  const push = () => {
    const s = get();
    if (!s.cloud) return;
    const now = JSON.stringify(s);
    if (now === last) return;
    last = now;
    void upload(s);
  };
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && push());
  window.addEventListener('pagehide', push);
  window.setInterval(push, 60_000);
}

export const progressOf = (s: SaveData) => ({
  levels: Object.values(s.stars).filter((n) => n > 0).length,
  stars: Object.values(s.stars).reduce((a, b) => a + b, 0),
});
