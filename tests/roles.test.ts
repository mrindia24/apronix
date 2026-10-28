import { describe, expect, it } from 'vitest';
import { hasRole } from '@/src/lib/roles';

describe('hasRole', () => {
  it('denies anonymous access', () => {
    expect(hasRole(null, 'EDITOR')).toBe(false);
  });

  it('enforces the role hierarchy', () => {
    expect(hasRole({ role: 'EDITOR' }, 'EDITOR')).toBe(true);
    expect(hasRole({ role: 'EDITOR' }, 'ADMIN')).toBe(false);
    expect(hasRole({ role: 'ADMIN' }, 'EDITOR')).toBe(true);
    expect(hasRole({ role: 'ADMIN' }, 'SUPER_ADMIN')).toBe(false);
    expect(hasRole({ role: 'SUPER_ADMIN' }, 'ADMIN')).toBe(true);
  });
});
