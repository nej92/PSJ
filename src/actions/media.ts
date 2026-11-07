'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { normalizeText } from '@/lib/normalize';
import { revalidatePath } from 'next/cache';
import { movieFiles, movieFolderKey } from '@/lib/movie-files';

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
  const genre = formData.get('genre') ? normalizeText(formData.get('genre') as string) : null;
  const actor = formData.get('actor') ? formData.get('actor') as string : null;
  const director = formData.get('director') ? formData.get('director') as string : null;
  const developer = formData.get('developer') ? formData.get('developer') as string : null;

  if (!title || !type) return { error: 'Title and type are required' };

  try {
    if (type === 'MOVIE') {
      if (await checkFolderCollision(title)) {
        return { error: 'Otro título utiliza el mismo nombre de carpeta. Elige un título diferente.' };
      }
      await movieFiles.ensureDirectory(title);
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
        genre,
        actor,
        director,
        developer
      }
    });

    revalidatePath('/');
    return { success: true };
  } catch (e) {
    console.error('Error al agregar contenido:', e);
    return { error: 'No se pudo agregar el contenido ni preparar su carpeta. Revisa el título y los permisos.' };
  }
}

export async function playMovieAction(id: string) {
  const session = await getSession();
  if (!session) return { error: 'Debes iniciar sesión para reproducir una película.' };
  try {
    const movie = await prisma.media.findFirst({
      where: { id, userId: session.userId, type: 'MOVIE' },
      select: { title: true },
    });
    if (!movie) return { error: 'No se encontró la película.' };
    if (!await movieFiles.play(movie.title)) return { error: 'pelicula no disponible' };
    return { success: true };
  } catch (error) {
    console.error('Error al reproducir la película:', error);
    return { error: 'No se pudo abrir la película. Comprueba la carpeta y BS.Player.' };
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
  const genre = formData.get('genre') ? normalizeText(formData.get('genre') as string) : null;
  const actor = formData.get('actor') ? formData.get('actor') as string : null;
  const director = formData.get('director') ? formData.get('director') as string : null;
  const developer = formData.get('developer') ? formData.get('developer') as string : null;

  if (!title) return { error: 'Title is required' };

  let renamed = false;
  let oldTitle: string | undefined;
  try {
    const media = await prisma.media.findFirst({
      where: { id, userId: session.userId },
      select: { title: true, type: true },
    });
    if (!media) return { error: 'No se encontró el contenido.' };
    if (media.type === 'MOVIE' && media.title !== title) {
      if (await checkFolderCollision(title, id)) {
        return { error: 'Otro título utiliza el mismo nombre de carpeta. Elige un título diferente.' };
      }
      const otherMovies = await prisma.media.findMany({
        where: { type: 'MOVIE', id: { not: id } },
        select: { title: true },
      });
      if (otherMovies.some(movie => movieFolderKey(movie.title) === movieFolderKey(media.title))) {
        return { error: 'La carpeta está compartida con otra película y no puede renombrarse automáticamente.' };
      }
      oldTitle = media.title;
      renamed = await movieFiles.renameDirectory(oldTitle, title);
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
        genre,
        actor,
        director,
        developer
      }
    });

    if (updated.count !== 1) throw new Error('No se encontró el contenido al guardarlo.');
  } catch (e) {
    console.error('Error al actualizar contenido:', e);
    if (renamed && oldTitle) {
      try {
        await movieFiles.renameDirectory(title, oldTitle);
      } catch (rollbackError) {
        console.error('No se pudo restaurar la carpeta de la película:', rollbackError);
        return { error: 'No se guardó el cambio y no se pudo restaurar la carpeta. Revisa las carpetas manualmente.' };
      }
    }
    return { error: e instanceof Error && e.message.startsWith('Ya existe una carpeta')
      ? e.message
      : 'No se pudo guardar el contenido o renombrar su carpeta. Revisa el título y los permisos.' };
  }
  revalidatePath('/');
  return { success: true };
}
