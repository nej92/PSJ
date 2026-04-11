import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import MediaSection from '@/components/MediaSection';

export const dynamic = 'force-dynamic';

export default async function AnimesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const animes = await prisma.media.findMany({
    where: { userId: session.userId, type: 'ANIME' },
    orderBy: { createdAt: 'desc' }
  });

  return <MediaSection title="My Animes" defaultType="ANIME" medias={animes} />;
}
