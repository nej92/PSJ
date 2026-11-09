'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { movieFolderKey } from '@/lib/movie-files';
import { createMoviePlaybackToken } from '@/lib/movie-playback-token';
import { genreCategory, resolveSelectedGenres } from '@/lib/genres';

async function selectedGenres(formData: FormData, type: string, previous: string | null = null) {
  const category = genreCategory(type);
  if (!category) return { error: 'Tipo de contenido inválido.' };
  const catalog = await prisma.genre.findMany({ where: { category }, select: { name: true } });
  return resolveSelectedGenres(formData.getAll('genre'), catalog.map(genre => genre.name), previous);
}

async function checkFolderCollision(title: string, excludeId?: string) {
  const key = movieFolderKey(title);
  const movies = await prisma.media.findMany({
    where: { type: 'MOVIE', ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { title: true },
  });
  return movies.some(movie => movieFolderKey(movie.title) === key && movie.title !== title);
}

export async function addMediaAction(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const type = formData.get('type') as string;
  const title = formData.get('title') as string;
  const releaseYear = formData.get('releaseYear') ? parseInt(formData.get('releaseYear') as string, 10) : null;
  const coverImage = formData.get('coverImage') as string || null;
  const rating = formData.get('rating') ? parseInt(formData.get('rating') as string, 10) : null;
  const isFavorite = formData.get('isFavorite') === 'on';
  const toWatch = formData.get('toWatch') === 'on';
  const actor = formData.get('actor') ? formData.get('actor') as string : null;
  const director = formData.get('director') ? formData.get('director') as string : null;
  const developer = formData.get('developer') ? formData.get('developer') as string : null;

  if (!title || !type) return { error: 'Title and type are required' };

  try {
    const genres = await selectedGenres(formData, type);
    if (genres.error) return { error: genres.error };
    if (type === 'MOVIE') {
      if (await checkFolderCollision(title)) {
        return { error: 'Otro título utiliza el mismo nombre de carpeta. Elige un título diferente.' };
      }
    }
    await prisma.media.create({
      data: {
        userId: session.userId,
        type,
        title,
        releaseYear,
        coverImage,
        rating,
        isFavorite,
        toWatch,
        genre: genres.genre,
        actor,
        director,
        developer
      }
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (e) {
    console.error('Error al agregar contenido:', e);
    return { error: 'No se pudo agregar el contenido. Revisa el título y vuelve a intentarlo.' };
  }
}

export async function authorizeMoviePlaybackAction(id: string) {
  const session = await getSession();
  if (!session) return { error: 'Debes iniciar sesión para reproducir una película.' };
  if (!process.env.MOVIE_PLAYBACK_SECRET || process.env.MOVIE_PLAYBACK_SECRET.length < 32) {
    return { error: 'Configura MOVIE_PLAYBACK_SECRET en el servidor con al menos 32 caracteres.' };
  }
  try {
    const movie = await prisma.media.findFirst({
      where: { id, userId: session.userId, type: 'MOVIE' },
      select: { id: true },
    });
    if (!movie) return { error: 'No se encontró la película.' };
    return { token: await createMoviePlaybackToken(movie.id, session.userId) };
  } catch (error) {
    console.error('Error al autorizar la película:', error);
    return { error: 'No se pudo autorizar la reproducción. Comprueba la configuración del servidor.' };
  }
}

export async function deleteMediaAction(id: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  await prisma.media.deleteMany({
    where: { id, userId: session.userId }
  });

  revalidatePath('/');
  return { success: true };
}

export async function toggleFavoriteAction(id: string, isFavorite: boolean) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  await prisma.media.updateMany({
    where: { id, userId: session.userId },
    data: { isFavorite }
  });

  revalidatePath('/');
  return { success: true };
}

export async function toggleWatchAction(id: string, toWatch: boolean) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  await prisma.media.updateMany({
    where: { id, userId: session.userId },
    data: { toWatch }
  });

  revalidatePath('/');
  return { success: true };
}

export async function updateMediaAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const title = formData.get('title') as string;
  const releaseYear = formData.get('releaseYear') ? parseInt(formData.get('releaseYear') as string, 10) : null;
  const coverImage = formData.get('coverImage') as string || null;
  const rating = formData.get('rating') ? parseInt(formData.get('rating') as string, 10) : null;
  const isFavorite = formData.get('isFavorite') === 'on';
  const toWatch = formData.get('toWatch') === 'on';
  const actor = formData.get('actor') ? formData.get('actor') as string : null;
  const director = formData.get('director') ? formData.get('director') as string : null;
  const developer = formData.get('developer') ? formData.get('developer') as string : null;

  if (!title) return { error: 'Title is required' };

  try {
    const media = await prisma.media.findFirst({
      where: { id, userId: session.userId },
      select: { title: true, type: true, genre: true },
    });
    if (!media) return { error: 'No se encontró el contenido.' };
    const genres = await selectedGenres(formData, media.type, media.genre);
    if (genres.error) return { error: genres.error };
    if (media.type === 'MOVIE' && media.title !== title) {
      if (await checkFolderCollision(title, id)) {
        return { error: 'Otro título utiliza el mismo nombre de carpeta. Elige un título diferente.' };
      }
    }
    const updated = await prisma.media.updateMany({
      where: { id, userId: session.userId },
      data: {
        title,
        releaseYear,
        coverImage,
        rating,
        isFavorite,
        toWatch,
        genre: genres.genre,
        actor,
        director,
        developer
      }
    });

    if (updated.count !== 1) throw new Error('No se encontró el contenido al guardarlo.');
  } catch (e) {
    console.error('Error al actualizar contenido:', e);
    return { error: 'No se pudo guardar el contenido. Revisa el título y vuelve a intentarlo.' };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}
