import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import MediaCard from '@/components/MediaCard';
import Link from 'next/link';
import { Film, Tv, Gamepad2, Wand2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();
  if (!session) redirect('/login');

  const recentMedia = await prisma.media.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 12
  });

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  return (
    <div className="fade-in">
      <div style={{marginBottom: '3rem', marginTop: '2rem'}}>
        <h1 className="section-title" style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>Welcome back, {user?.name || 'User'}!</h1>
        <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem'}}>Manage your personal catalog of Movies, TV Series, Games, and Animes.</p>
      </div>

      <div style={{display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap'}}>
        <Link href="/animes" className="btn btn-primary" style={{flex: 1, minWidth: '250px', padding: '2rem 1rem', fontSize: '1.2rem', justifyContent: 'center', flexDirection: 'column', gap: '1rem'}}>
          <Wand2 size={32} />
          Animes
        </Link>
        <Link href="/games" className="btn btn-primary" style={{flex: 1, minWidth: '250px', padding: '2rem 1rem', fontSize: '1.2rem', justifyContent: 'center', flexDirection: 'column', gap: '1rem'}}>
          <Gamepad2 size={32} />
          Games
        </Link>
        <Link href="/movies" className="btn btn-primary" style={{flex: 1, minWidth: '250px', padding: '2rem 1rem', fontSize: '1.2rem', justifyContent: 'center', flexDirection: 'column', gap: '1rem'}}>
          <Film size={32} />
          Movies
        </Link>
        <Link href="/series" className="btn btn-primary" style={{flex: 1, minWidth: '250px', padding: '2rem 1rem', fontSize: '1.2rem', justifyContent: 'center', flexDirection: 'column', gap: '1rem'}}>
          <Tv size={32} />
          TV Series
        </Link>
      </div>

      <div>
        <h2 className="section-title" style={{marginBottom: '1.5rem'}}>Recently Added</h2>
        {recentMedia.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', backgroundColor: 'var(--surface)', borderRadius: '8px'}}>
            <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>You haven't added any media yet.</p>
            <Link href="/movies" className="btn btn-primary">Start adding items</Link>
          </div>
        ) : (
          <div className="media-grid">
            {recentMedia.map(media => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
