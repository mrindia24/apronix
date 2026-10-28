import { describe, expect, it } from 'vitest';
import { honeypotTrap, looksLikeLinkSpam, MIN_FILL_TIME_MS } from '@/src/lib/spam-checks';

describe('honeypotTrap', () => {
  it('flags a filled honeypot', () => {
    expect(honeypotTrap('bot-value', Date.now() - 10_000).spam).toBe(true);
  });

  it('flags submissions completed faster than a human could type', () => {
    const now = 1_000_000;
    expect(honeypotTrap('', now - 500, now).spam).toBe(true);
  });

  it('allows a normal submission', () => {
    const now = 1_000_000;
    expect(honeypotTrap('', now - MIN_FILL_TIME_MS - 1, now).spam).toBe(false);
  });

  it('allows submissions with no timing information', () => {
    expect(honeypotTrap('', undefined).spam).toBe(false);
  });
});

describe('looksLikeLinkSpam', () => {
  it('flags link-heavy messages', () => {
    expect(looksLikeLinkSpam('a http://a.com b http://b.com c http://c.com d http://d.com e http://e.com')).toBe(true);
  });

  it('flags known spam keywords', () => {
    expect(looksLikeLinkSpam('Great offer on casino bonuses')).toBe(true);
  });

  it('allows a normal project enquiry with one link', () => {
    expect(looksLikeLinkSpam('Our site is https://brightleaf.in and it is slow on mobile devices.')).toBe(false);
  });
});
