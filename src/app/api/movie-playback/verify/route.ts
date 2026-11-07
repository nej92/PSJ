import { prisma } from '@/lib/prisma';
import { verifyMoviePlaybackToken } from '@/lib/movie-playback-token';

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ') || authorization.length > 4096) {
    return Response.json({ error: 'Autorización inválida.' }, { status: 401 });
  }
  let claims: { movieId: string; userId: string };
  try {
    claims = await verifyMoviePlaybackToken(authorization.slice(7));
  } catch {
    return Response.json({ error: 'Autorización inválida o vencida.' }, { status: 401 });
  }
  const movie = await prisma.media.findFirst({
    where: { id: claims.movieId, userId: claims.userId, type: 'MOVIE' },
    select: { id: true },
  });
  if (!movie) return Response.json({ error: 'Película no encontrada.' }, { status: 404 });
  return Response.json({ movieId: movie.id }, { headers: { 'Cache-Control': 'no-store' } });
}
