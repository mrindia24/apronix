import { describe, expect, it } from 'vitest';
import { breadcrumbSchema, buildMetadata, faqSchema, organizationSchema } from '@/src/lib/seo';

describe('buildMetadata', () => {
  it('builds absolute canonical URLs and Open Graph data', () => {
    const meta = buildMetadata({ title: 'Services', description: 'Our services', path: '/services' });
    expect(meta.alternates?.canonical).toMatch(/\/services$/);
    expect(meta.openGraph?.title).toBe('Services');
    expect(meta.robots).toMatchObject({ index: true, follow: true });
  });

  it('never emits a canonical URL with a trailing root slash', () => {
    const meta = buildMetadata({ title: 'Home', description: 'x', path: '/' });
    expect(String(meta.alternates?.canonical).endsWith('/')).toBe(false);
  });

  it('marks noindex pages correctly', () => {
    const meta = buildMetadata({ title: 'Hidden', description: 'x', path: '/x', noindex: true });
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });

  it('truncates long descriptions', () => {
    const meta = buildMetadata({ title: 't', description: 'a'.repeat(400), path: '/x' });
    expect((meta.description as string).length).toBeLessThanOrEqual(160);
  });

  it('honours a canonical override', () => {
    const meta = buildMetadata({
      title: 't',
      description: 'd',
      path: '/blog/x',
      canonicalOverride: 'https://elsewhere.example/article',
    });
    expect(meta.alternates?.canonical).toBe('https://elsewhere.example/article');
  });
});

describe('structured data', () => {
  it('describes the organisation without invented rating data', () => {
    const schema = organizationSchema() as Record<string, unknown>;
    expect(schema['@type']).toBe('Organization');
    expect(JSON.stringify(schema)).not.toMatch(/aggregateRating|reviewCount/);
  });

  it('orders breadcrumb positions from 1', () => {
    const schema = breadcrumbSchema([
      { name: 'Home', href: '/' },
      { name: 'Blog', href: '/blog' },
    ]) as { itemListElement: { position: number }[] };
    expect(schema.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });

  it('returns null FAQ schema when there are no questions', () => {
    expect(faqSchema([])).toBeNull();
  });
});
