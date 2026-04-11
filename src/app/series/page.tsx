import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import MediaSection from '@/components/MediaSection';

export const dynamic = 'force-dynamic';

export default async function SeriesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const series = await prisma.media.findMany({
    where: { userId: session.userId, type: 'TV_SERIES' },
    orderBy: { createdAt: 'desc' }
  });

  return <MediaSection title="My TV Series" defaultType="TV_SERIES" medias={series} />;
}
