import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { createMovieService } from '../scripts/movie-service-http.mjs';

test('only permits the configured origin and authorized playback', async () => {
  const origin = 'https://psj-psi.vercel.app';
  let playing = false;
  let available = false;
  const server = createMovieService({
    origins: new Set([origin]),
    expectedHost: () => `127.0.0.1:${server.address().port}`,
    verify: async (issuer, token) => issuer === origin && token === 'valid' ? '1' : null,
    synchronize: async () => {},
    findMovie: async id => id === '1' ? { title: 'Movie' } : null,
    files: { play: async () => { playing = true; return available; } },
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/play`;
  const headers = { origin, 'content-type': 'application/json' };
  try {
    const preflight = await fetch(url, { method: 'OPTIONS', headers });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
    assert.equal(preflight.headers.get('access-control-allow-private-network'), 'true');
    const denied = await fetch(url, { method: 'POST', headers: { ...headers, origin: 'https://evil.example' }, body: JSON.stringify({ token: 'valid' }) });
    assert.equal(denied.status, 403);
    const invalid = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ token: 'invalid' }) });
    assert.equal(invalid.status, 401);
    assert.equal(playing, false);
    const missing = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ token: 'valid' }) });
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error, 'pelicula no disponible');
    available = true;
    const success = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ token: 'valid' }) });
    assert.equal(success.status, 200);
    assert.equal((await success.json()).success, true);
  } finally {
    server.close();
    await once(server, 'close');
  }
});
