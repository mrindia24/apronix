/**
 * Minimal, safe Markdown renderer for blog content.
 *
 * Design goals:
 *  - No dangerouslySetInnerHTML with user input: HTML in the source is escaped.
 *  - Predictable output for the subset of Markdown our editor produces.
 *  - Extracts a table of contents from H2/H3 headings with stable ids.
 *
 * Supported: headings (#…####), paragraphs, bold, italic, inline code, links,
 * unordered/ordered lists, blockquotes, fenced code blocks, horizontal rules,
 * tables and task lists.
 */

export type TocItem = { id: string; text: string; level: 2 | 3 };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'section';
}

function inline(raw: string): string {
  let out = escapeHtml(raw);

  // inline code first so its contents are not further formatted
  const codeSlots: string[] = [];
  out = out.replace(/`([^`]+)`/g, (_m, code: string) => {
    codeSlots.push(code);
    return `\u0000CODE${codeSlots.length - 1}\u0000`;
  });

  // links: [text](https://…)
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*|mailto:[^\s)]+)\)/g,
    (_m, text: string, href: string) => {
      const external = /^https?:\/\//.test(href);
      const attrs = external ? ' rel="noopener noreferrer nofollow" target="_blank"' : '';
      return `<a href="${href}"${attrs} class="text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand">${text}</a>`;
    },
  );

  out = out
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');

  out = out.replace(/\u0000CODE(\d+)\u0000/g, (_m, i: string) => {
    const code = escapeHtml(codeSlots[Number(i)] ?? '');
    return `<code class="rounded bg-ink-line/70 px-1.5 py-0.5 font-mono text-[0.85em] text-white/90">${code}</code>`;
  });

  return out;
}

export function renderMarkdown(markdown: string): { html: string; toc: TocItem[] } {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  const toc: TocItem[] = [];
  const usedIds = new Map<string, number>();

  let i = 0;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(' ');
    out.push(`<p class="mt-4 text-[1.0625rem] leading-[1.75] text-mute-onLight">${inline(text)}</p>`);
    paragraph = [];
  };

  const headingId = (text: string) => {
    const base = slugifyHeading(text);
    const count = usedIds.get(base) ?? 0;
    usedIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  while (i < lines.length) {
    const line = lines[i]!;

    // fenced code
    if (/^```/.test(line)) {
      const lang = line.replace(/^```/, '').trim();
      const block: string[] = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i]!)) {
        block.push(lines[i]!);
        i += 1;
      }
      i += 1;
      out.push(
        `<pre class="mt-5 overflow-x-auto rounded-xl2 border border-black/10 bg-ink p-4 text-sm leading-relaxed text-white/90"><code>${
          lang ? `<span class="mb-2 block text-[11px] uppercase tracking-widest text-white/40">${escapeHtml(lang)}</span>` : ''
        }${escapeHtml(block.join('\n'))}</code></pre>`,
      );
      continue;
    }

    // table
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|?$/.test(lines[i + 1]!)) {
      flushParagraph();
      const headerCells = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i]!)) {
        rows.push(splitRow(lines[i]!));
        i += 1;
      }
      out.push(
        `<div class="mt-5 overflow-x-auto rounded-xl2 border border-black/10"><table class="w-full border-collapse text-left text-sm"><thead class="bg-[#F4F5F7]"><tr>${headerCells
          .map(
            (c) =>
              `<th scope="col" class="border-b border-black/10 px-4 py-3 font-semibold text-ink">${inline(c)}</th>`,
          )
          .join('')}</tr></thead><tbody>${rows
          .map(
            (r) =>
              `<tr class="odd:bg-white even:bg-[#FAFBFC]">${r
                .map((c) => `<td class="border-b border-black/5 px-4 py-3 text-mute-onLight">${inline(c)}</td>`)
                .join('')}</tr>`,
          )
          .join('')}</tbody></table></div>`,
      );
      continue;
    }

    // headings
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1]!.length;
      const text = heading[2]!.trim();
      const id = headingId(text);
      if (level === 2) {
        toc.push({ id, text, level: 2 });
        out.push(
          `<h2 id="${id}" class="mt-10 scroll-mt-28 text-[1.6rem] font-bold leading-tight tracking-[-0.02em] text-ink">${inline(text)}</h2>`,
        );
      } else if (level === 3) {
        toc.push({ id, text, level: 3 });
        out.push(
          `<h3 id="${id}" class="mt-8 scroll-mt-28 text-[1.25rem] font-semibold leading-snug text-ink">${inline(text)}</h3>`,
        );
      } else if (level === 1) {
        out.push(
          `<h2 id="${id}" class="mt-10 scroll-mt-28 text-[1.75rem] font-bold leading-tight text-ink">${inline(text)}</h2>`,
        );
      } else {
        out.push(
          `<h4 id="${id}" class="mt-6 text-[1.05rem] font-semibold text-ink">${inline(text)}</h4>`,
        );
      }
      i += 1;
      continue;
    }

    // horizontal rule
    if (/^(\*\*\*|---|___)\s*$/.test(line)) {
      flushParagraph();
      out.push('<hr class="my-10 border-black/10" />');
      i += 1;
      continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      flushParagraph();
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i]!)) {
        quote.push(lines[i]!.replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(
        `<blockquote class="mt-6 rounded-r-xl2 border-l-4 border-brand bg-[#FFF4F4] px-5 py-4 text-[1.05rem] italic leading-relaxed text-ink">${inline(
          quote.join(' '),
        )}</blockquote>`,
      );
      continue;
    }

    // unordered list (supports task items)
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      flushParagraph();
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i]!)) {
        const itemText = lines[i]!.replace(/^\s*([-*+]|\d+\.)\s+/, '');
        const task = itemText.match(/^\[( |x|X)\]\s+(.*)$/);
        if (task) {
          const checked = task[1]!.toLowerCase() === 'x';
          items.push(
            `<li class="flex gap-2"><span aria-hidden="true" class="mt-[3px] inline-flex h-4 w-4 flex-none items-center justify-center rounded border ${
              checked ? 'border-brand bg-brand text-white' : 'border-black/25'
            } text-[10px]">${checked ? '✓' : ''}</span><span>${inline(task[2]!)}</span></li>`,
          );
        } else {
          items.push(`<li class="pl-1 marker:text-brand">${inline(itemText)}</li>`);
        }
        i += 1;
      }
      const listClass = ordered
        ? 'mt-4 list-decimal space-y-2 pl-5 text-[1.0625rem] leading-[1.7] text-mute-onLight'
        : 'mt-4 list-disc space-y-2 pl-5 text-[1.0625rem] leading-[1.7] text-mute-onLight';
      out.push(`<${ordered ? 'ol' : 'ul'} class="${listClass}">${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }

    // blank line
    if (line.trim() === '') {
      flushParagraph();
      i += 1;
      continue;
    }

    paragraph.push(line.trim());
    i += 1;
  }

  flushParagraph();
  return { html: out.join('\n'), toc };
}

function splitRow(line: string): string[] {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}
