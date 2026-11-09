import { prisma } from '@/lib/prisma';
import type { GenreCatalog } from '@/lib/genres';

export async function getGenreCatalog(): Promise<GenreCatalog> {
  const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });
  return {
    screen: genres.filter(genre => genre.category === 'SCREEN').map(genre => genre.name),
    game: genres.filter(genre => genre.category === 'GAME').map(genre => genre.name),
  };
}
