import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import MediaSection from '@/components/MediaSection';

export const dynamic = 'force-dynamic';

export default async function GamesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const games = await prisma.media.findMany({
    where: { userId: session.userId, type: 'VIDEO_GAME' },
    orderBy: { createdAt: 'desc' }
  });

  return <MediaSection title="My Video Games" defaultType="VIDEO_GAME" medias={games} />;
}
