'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { destroyCurrentSession, requireUser } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { hashPassword, verifyPassword } from '@/src/lib/auth';
import { z } from 'zod';
import type { ActionState } from '@/src/lib/actions/types';

export async function signOutAction() {
  await destroyCurrentSession();
  redirect('/admin/login');
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Enter your current password.'),
    newPassword: z
      .string()
      .min(12, 'Use at least 12 characters.')
      .regex(/[A-Z]/, 'Include an uppercase letter.')
      .regex(/[a-z]/, 'Include a lowercase letter.')
      .regex(/[0-9]/, 'Include a number.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let user;
  try {
    user = await requireUser('EDITOR');
  } catch {
    return { ok: false, message: 'You must be signed in.' };
  }

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || 'form';
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: 'Please check the form.', errors };
  }

  const record = await prisma.adminUser.findUnique({ where: { id: user.id } });
  if (!record) return { ok: false, message: 'Account not found.' };

  const valid = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
  if (!valid) {
    return { ok: false, message: 'Current password is incorrect.', errors: { currentPassword: 'Incorrect password.' } };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  // Invalidate every other session for this user.
  await prisma.adminSession.deleteMany({ where: { userId: user.id } });

  revalidatePath('/admin/settings');
  return { ok: true, message: 'Password updated. Other sessions have been signed out — please sign in again shortly.' };
}
