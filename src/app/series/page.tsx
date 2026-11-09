import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import MediaSection from '@/components/MediaSection';
import { getGenreCatalog } from '@/lib/genre-catalog';

export const dynamic = 'force-dynamic';

export default async function SeriesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [series, genres] = await Promise.all([prisma.media.findMany({
    where: { userId: session.userId, type: 'TV_SERIES' },
    orderBy: { createdAt: 'desc' }
  }), getGenreCatalog()]);

  return <MediaSection title="Mis Series" defaultType="TV_SERIES" medias={series} genres={genres} />;
}
