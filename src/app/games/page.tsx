import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import MediaSection from '@/components/MediaSection';
import { getGenreCatalog } from '@/lib/genre-catalog';

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [games, genres] = await Promise.all([prisma.media.findMany({
    where: { userId: session.userId, type: 'VIDEO_GAME' },
    orderBy: { createdAt: 'desc' }
  }), getGenreCatalog()]);

  return <MediaSection title="Mis Videojuegos" defaultType="VIDEO_GAME" medias={games} genres={genres} />;
}
