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

  const recentMovies = await prisma.media.findMany({
    where: { userId: session.userId, type: 'MOVIE', videoAddedAt: { not: null } },
    orderBy: [{ videoAddedAt: 'desc' }, { createdAt: 'desc' }],
    take: 12
  });

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  return (
    <div className="fade-in">
      <div style={{marginBottom: '3rem', marginTop: '2rem'}}>
        <h1 className="section-title" style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>¡Bienvenido de nuevo, {user?.name || 'Usuario'}!</h1>
        <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem'}}>Administra tu catálogo personal de Películas, Series, Juegos y Animes.</p>
      </div>

      <div style={{display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap'}}>
        <Link href="/animes" className="btn btn-primary" style={{flex: 1, minWidth: '250px', padding: '2rem 1rem', fontSize: '1.2rem', justifyContent: 'center', flexDirection: 'column', gap: '1rem'}}>
          <Wand2 size={32} />
          Animes
        </Link>
        <Link href="/games" className="btn btn-primary" style={{flex: 1, minWidth: '250px', padding: '2rem 1rem', fontSize: '1.2rem', justifyContent: 'center', flexDirection: 'column', gap: '1rem'}}>
          <Gamepad2 size={32} />
          Videojuegos
        </Link>
        <Link href="/movies" className="btn btn-primary" style={{flex: 1, minWidth: '250px', padding: '2rem 1rem', fontSize: '1.2rem', justifyContent: 'center', flexDirection: 'column', gap: '1rem'}}>
          <Film size={32} />
          Películas
        </Link>
        <Link href="/series" className="btn btn-primary" style={{flex: 1, minWidth: '250px', padding: '2rem 1rem', fontSize: '1.2rem', justifyContent: 'center', flexDirection: 'column', gap: '1rem'}}>
          <Tv size={32} />
          Series
        </Link>
      </div>

      <div>
        <h2 className="section-title" style={{marginBottom: '1.5rem'}}>Películas agregadas recientemente para ver</h2>
        {recentMovies.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', backgroundColor: 'var(--surface)', borderRadius: '8px'}}>
            <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>Aún no hay películas con archivos de vídeo disponibles.</p>
            <Link href="/movies" className="btn btn-primary">Ver mis películas</Link>
          </div>
        ) : (
          <div className="media-grid">
            {recentMovies.map(media => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
