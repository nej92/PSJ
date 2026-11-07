import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { movieFiles, movieFolderKey } from '../src/lib/movie-files.ts';

if (process.platform !== 'win32') {
  throw new Error('La sincronización debe ejecutarse en el equipo Windows que contiene D:\\peliculas.');
}

const prisma = new PrismaClient();
try {
  const movies = await prisma.media.findMany({
    where: { type: 'MOVIE' },
    select: { title: true },
  });
  const titles = new Map();
  for (const { title } of movies) {
    const key = movieFolderKey(title);
    const previous = titles.get(key);
    if (previous !== undefined && previous !== title) {
      throw new Error(`Los títulos "${previous}" y "${title}" corresponden a la misma carpeta.`);
    }
    titles.set(key, title);
  }
  for (const title of titles.values()) {
    await movieFiles.ensureDirectory(title);
  }
  console.log(`Carpetas preparadas: ${titles.size}.`);
} catch (error) {
  console.error('No se pudieron preparar las carpetas de películas:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
