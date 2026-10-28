'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/src/lib/prisma';
import { requireUser } from '@/src/lib/auth';
import { LEAD_STATUSES } from '@/src/lib/validation';
import { retryLeadNotification } from '@/src/lib/leads';
import type { ActionState } from '@/src/lib/actions/types';
import type { LeadStatus } from '@prisma/client';

export async function updateLeadStatusAction(formData: FormData) {
  await requireUser('EDITOR');
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!id || !LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) return;

  await prisma.lead
    .update({ where: { id }, data: { status: status as LeadStatus } })
    .catch(() => null);

  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath('/admin');
}

export async function addLeadNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireUser('EDITOR');
  } catch {
    return { ok: false, message: 'You must be signed in.' };
  }

  const leadId = String(formData.get('leadId') ?? '');
  const body = String(formData.get('body') ?? '').trim();

  if (!leadId) return { ok: false, message: 'Missing lead.' };
  if (body.length < 2) {
    return { ok: false, message: 'Write a note first.', errors: { body: 'Note cannot be empty.' } };
  }

  try {
    await prisma.leadNote.create({
      data: { leadId, authorId: user.id, body: body.slice(0, 2000) },
    });
  } catch (error) {
    console.error('[lead:note]', error);
    return { ok: false, message: 'Could not save the note.' };
  }

  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true, message: 'Note added.' };
}

export async function retryLeadEmailAction(formData: FormData) {
  await requireUser('ADMIN');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await retryLeadNotification(id);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath('/admin/leads');
}

export async function deleteLeadAction(formData: FormData) {
  await requireUser('SUPER_ADMIN');
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await prisma.lead.delete({ where: { id } }).catch(() => null);
  revalidatePath('/admin/leads');
}
