// Lives outside netlify/functions because Netlify deploys every file in that folder as a function.
import { describe, expect, it, vi } from 'vitest';

const mem = new Map<string, unknown>();
vi.mock('@netlify/blobs', () => ({
  getStore: () => ({
    get: async (k: string) => mem.get(k) ?? null,
    setJSON: async (k: string, v: unknown) => void mem.set(k, v),
  }),
}));
const { default: handler } = await import('../netlify/functions/cloud.mts');

const url = (code: string) => `https://example.test/api/cloud?code=${code}`;

describe('cloud save function', () => {
  it('rejects bad codes', async () => {
    expect((await handler(new Request(url('short')))).status).toBe(400);
    expect((await handler(new Request(url('ABCDEFGH10')))).status).toBe(400); // 1 and 0 aren't in the alphabet
  });

  it('stores and returns a save', async () => {
    expect((await handler(new Request(url('ABCDEFGHJK')))).status).toBe(404);
    const put = await handler(new Request(url('ABCDEFGHJK'), { method: 'PUT', body: JSON.stringify({ save: { stars: { 1: 3 }, savedAt: 5 } }) }));
    expect(put.status).toBe(200);
    const got = await handler(new Request(url('abcde-fghjk')));
    expect(got.status).toBe(200);
    const body = await got.json();
    expect(body.save.stars).toEqual({ 1: 3 });
    expect(body.savedAt).toBe(5);
  });

  it('refuses junk and huge bodies', async () => {
    expect((await handler(new Request(url('ABCDEFGHJK'), { method: 'PUT', body: 'nope' }))).status).toBe(400);
    expect((await handler(new Request(url('ABCDEFGHJK'), { method: 'PUT', body: JSON.stringify({ save: [] }) }))).status).toBe(400);
    expect((await handler(new Request(url('ABCDEFGHJK'), { method: 'PUT', body: 'x'.repeat(200_000) }))).status).toBe(413);
    expect((await handler(new Request(url('ABCDEFGHJK'), { method: 'DELETE' }))).status).toBe(405);
  });
});
