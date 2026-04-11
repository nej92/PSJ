import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import MediaSection from '@/components/MediaSection';

export const dynamic = 'force-dynamic';

export default async function MoviesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const movies = await prisma.media.findMany({
    where: { userId: session.userId, type: 'MOVIE' },
    orderBy: { createdAt: 'desc' }
  });

  return <MediaSection title="My Movies" defaultType="MOVIE" medias={movies} />;
}
