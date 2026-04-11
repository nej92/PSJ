'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function addMediaAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const type = formData.get('type') as string;
  const title = formData.get('title') as string;
  const releaseYear = formData.get('releaseYear') ? parseInt(formData.get('releaseYear') as string, 10) : null;
  const coverImage = formData.get('coverImage') as string || null;
  const rating = formData.get('rating') ? parseInt(formData.get('rating') as string, 10) : null;
  const isFavorite = formData.get('isFavorite') === 'on';
  const toWatch = formData.get('toWatch') === 'on';
  const genre = formData.get('genre') as string || null;

  if (!title || !type) return { error: 'Title and type are required' };

  try {
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
        genre
      }
    });

    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to add media' };
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
  const genre = formData.get('genre') as string || null;

  if (!title) return { error: 'Title is required' };

  try {
    await prisma.media.updateMany({
      where: { id, userId: session.userId },
      data: {
        title,
        releaseYear,
        coverImage,
        rating,
        isFavorite,
        toWatch,
        genre
      }
    });

    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to update media' };
  }
}
