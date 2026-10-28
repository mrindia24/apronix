import { describe, expect, it } from 'vitest';
import { escapeHtml, renderMarkdown } from '@/src/lib/markdown';

describe('renderMarkdown', () => {
  it('renders headings with stable slug ids and builds a table of contents', () => {
    const { html, toc } = renderMarkdown('## First section\n\nText\n\n### Sub section\n\nMore text');
    expect(html).toContain('<h2 id="first-section"');
    expect(html).toContain('<h3 id="sub-section"');
    expect(toc).toEqual([
      { id: 'first-section', text: 'First section', level: 2 },
      { id: 'sub-section', text: 'Sub section', level: 3 },
    ]);
  });

  it('de-duplicates heading ids', () => {
    const { toc } = renderMarkdown('## Setup\n\n## Setup\n\n## Setup');
    expect(toc.map((t) => t.id)).toEqual(['setup', 'setup-2', 'setup-3']);
  });

  it('escapes raw HTML so content cannot inject markup', () => {
    const { html } = renderMarkdown('Hello <script>alert("xss")</script> world');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes attribute-breaking characters in link text', () => {
    const { html } = renderMarkdown('[click "here"](https://example.com)');
    expect(html).toContain('&quot;here&quot;');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });

  it('does not allow javascript: URLs', () => {
    const { html } = renderMarkdown('[bad](javascript:alert(1))');
    expect(html).not.toContain('href="javascript:');
  });

  it('renders ordered lists, blockquotes, tables and task lists', () => {
    const md = [
      '1. First',
      '2. Second',
      '',
      '> A quote',
      '',
      '| A | B |',
      '| --- | --- |',
      '| 1 | 2 |',
      '',
      '- [x] done',
      '- [ ] todo',
    ].join('\n');
    const { html } = renderMarkdown(md);
    expect(html).toContain('<ol');
    expect(html).toContain('<blockquote');
    expect(html).toContain('<table');
    expect(html).toContain('✓');
  });

  it('renders fenced code blocks as escaped pre/code', () => {
    const { html } = renderMarkdown('```ts\nconst x = "<b>";\n```');
    expect(html).toContain('<pre');
    expect(html).toContain('&lt;b&gt;');
  });

  it('escapes ampersands and quotes', () => {
    expect(escapeHtml(`<a href="x">&'"`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&quot;');
  });
});
