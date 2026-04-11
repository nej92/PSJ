'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function registerAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password) return { error: 'Email and password required' };

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: 'User already exists' };

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    await createSession(user.id);
  } catch (e) {
    return { error: 'Internal server error' };
  }
  redirect('/');
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Email and password required' };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { error: 'Invalid credentials' };
    }

    await createSession(user.id);
  } catch(e) {
    return { error: 'Internal server error' };
  }
  redirect('/');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
