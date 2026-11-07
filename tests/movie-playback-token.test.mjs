import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMoviePlaybackToken, verifyMoviePlaybackToken } from '../src/lib/movie-playback-token.ts';

test('playback tokens require a configured secret and reject tampering', async () => {
  const previous = process.env.MOVIE_PLAYBACK_SECRET;
  try {
    delete process.env.MOVIE_PLAYBACK_SECRET;
    await assert.rejects(createMoviePlaybackToken('movie', 'user'), /MOVIE_PLAYBACK_SECRET/);
    process.env.MOVIE_PLAYBACK_SECRET = 'test-secret-that-is-long-enough-for-playback';
    const token = await createMoviePlaybackToken('movie', 'user');
    assert.deepEqual(await verifyMoviePlaybackToken(token), { movieId: 'movie', userId: 'user' });
    process.env.MOVIE_PLAYBACK_SECRET = 'a-different-secret-long-enough-for-playback';
    await assert.rejects(verifyMoviePlaybackToken(token));
  } finally {
    if (previous === undefined) delete process.env.MOVIE_PLAYBACK_SECRET;
    else process.env.MOVIE_PLAYBACK_SECRET = previous;
  }
});
