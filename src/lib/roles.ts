import type { Role } from '@prisma/client';

/**
 * Role hierarchy used for authorisation. Kept dependency-free so it can be unit
 * tested and imported anywhere (server checks live in src/lib/auth.ts).
 */
export const ROLE_RANK: Record<Role, number> = {
  EDITOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export type SessionUserLike = { role: Role } | null | undefined;

export function hasRole(user: SessionUserLike, minimum: Role): boolean {
  if (!user) return false;
  return ROLE_RANK[user.role] >= ROLE_RANK[minimum];
}

export const ADMIN_NAV_PERMISSIONS: Record<string, Role> = {
  '/admin': 'EDITOR',
  '/admin/leads': 'EDITOR',
  '/admin/portfolio': 'EDITOR',
  '/admin/blog': 'EDITOR',
  '/admin/services': 'EDITOR',
  '/admin/testimonials': 'EDITOR',
  '/admin/faqs': 'EDITOR',
  '/admin/media': 'EDITOR',
  '/admin/settings': 'ADMIN',
};
