import { SignJWT, jwtVerify } from 'jose';

function key() {
  const secret = process.env.MOVIE_PLAYBACK_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('MOVIE_PLAYBACK_SECRET debe tener al menos 32 caracteres.');
  }
  return new TextEncoder().encode(secret);
}

export async function createMoviePlaybackToken(movieId: string, userId: string) {
  return new SignJWT({ movieId, userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('psj-movie-playback')
    .setAudience('psj-local-player')
    .setIssuedAt()
    .setExpirationTime('1m')
    .sign(key());
}

export async function verifyMoviePlaybackToken(token: string) {
  const { payload } = await jwtVerify(token, key(), {
    algorithms: ['HS256'],
    issuer: 'psj-movie-playback',
    audience: 'psj-local-player',
  });
  if (typeof payload.movieId !== 'string' || typeof payload.userId !== 'string') {
    throw new Error('Autorización inválida.');
  }
  return { movieId: payload.movieId, userId: payload.userId };
}
