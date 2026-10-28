import { describe, expect, it } from 'vitest';
import { cn, estimateReadingMinutes, slugify, titleCase, truncate } from '@/src/lib/utils';

describe('slugify', () => {
  it('creates lowercase hyphenated slugs', () => {
    expect(slugify('Shopify Store Design & Build')).toBe('shopify-store-design-build');
    expect(slugify("  Priya's Café  ")).toBe('priyas-cafe');
    expect(slugify('---')).toBe('');
  });
});

describe('cn', () => {
  it('keeps custom display sizes alongside text colours', () => {
    // Regression: tailwind-merge previously treated text-display-md as a colour.
    expect(cn('text-display-md text-white')).toBe('text-display-md text-white');
    expect(cn('text-white text-ink')).toBe('text-ink');
  });
});

describe('status + formatting helpers', () => {
  it('title-cases enum values', () => {
    expect(titleCase('SOCIAL_MEDIA_MANAGEMENT')).toBe('Social Media Management');
  });

  it('estimates reading time with a one-minute floor', () => {
    expect(estimateReadingMinutes('short text')).toBe(1);
    expect(estimateReadingMinutes(wordRepeats(440))).toBe(2);
  });

  it('truncates with an ellipsis', () => {
    expect(truncate('a'.repeat(200), 20)).toHaveLength(20);
  });
});

function wordRepeats(n: number) {
  return Array.from({ length: n }, () => 'word').join(' ');
}
