import 'dotenv/config';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { movieFiles } from '../src/lib/movie-files.ts';
import { MovieFolderSync } from './movie-folder-sync.mjs';
import { createMovieService } from './movie-service-http.mjs';

if (process.platform !== 'win32' || !process.env.LOCALAPPDATA) {
  throw new Error('El servicio debe ejecutarse en la PC Windows donde están las películas.');
}

const origins = new Set(['https://psj-psi.vercel.app', 'http://localhost:3000']);
const prisma = new PrismaClient();
const sync = new MovieFolderSync(movieFiles, 'D:\\peliculas', path.join(process.env.LOCALAPPDATA, 'PSJ', 'movie-folders.json'));
let currentSync = Promise.resolve();

function synchronize() {
  const task = currentSync.then(async () => {
    const movies = await prisma.media.findMany({
      where: { type: 'MOVIE' },
      select: { id: true, title: true, videoAddedAt: true },
      orderBy: { id: 'asc' },
    });
    await sync.sync(movies);
    for (const movie of movies) {
      const videoAddedAt = await movieFiles.latestVideoAddedAt(movie.title);
      if (movie.videoAddedAt?.getTime() !== videoAddedAt?.getTime()) {
        await prisma.media.update({
          where: { id: movie.id },
          data: { videoAddedAt },
        });
      }
    }
  });
  currentSync = task.catch(() => {});
  return task;
}

const server = createMovieService({
  origins,
  expectedHost: () => '127.0.0.1:43125',
  synchronize,
  files: movieFiles,
  findMovie: id => prisma.media.findFirst({
    where: { id, type: 'MOVIE' },
    select: { title: true },
  }),
  async verify(origin, token) {
    const verification = await fetch(`${origin}/api/movie-playback/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
    if (verification.status === 401 || verification.status === 404) return null;
    if (!verification.ok) throw new Error(`El sitio no pudo verificar la autorización (HTTP ${verification.status}).`);
    const { movieId } = await verification.json();
    if (typeof movieId !== 'string') throw new Error('Respuesta de autorización inválida.');
    return movieId;
  },
});

server.listen(43125, '127.0.0.1', () => {
  console.log('Servicio local de películas activo en 127.0.0.1:43125.');
  synchronize().then(() => console.log('Carpetas sincronizadas.')).catch(error => console.error('Error de sincronización:', error));
});

const timer = setInterval(() => {
  synchronize().catch(error => console.error('Error de sincronización:', error));
}, 30000);

function shutdown() {
  clearInterval(timer);
  server.close(() => {
    prisma.$disconnect().then(() => process.exit(0)).catch(error => {
      console.error('Error al cerrar la base de datos:', error);
      process.exit(1);
    });
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
