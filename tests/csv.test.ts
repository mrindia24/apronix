import { describe, expect, it } from 'vitest';
import { csvCell, toCsv } from '@/src/lib/csv';

describe('csvCell', () => {
  it('quotes values containing commas, quotes or newlines', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('he said "hi"')).toBe('"he said ""hi"""');
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"');
  });

  it('neutralises spreadsheet formula injection', () => {
    expect(csvCell('=cmd|calc')).toBe("'=cmd|calc");
    expect(csvCell('+91987')).toBe("'+91987");
    expect(csvCell('@import')).toBe("'@import");
  });

  it('handles null and dates', () => {
    expect(csvCell(null)).toBe('');
    expect(csvCell(undefined)).toBe('');
    expect(csvCell(new Date('2026-01-02T00:00:00.000Z'))).toBe('2026-01-02T00:00:00.000Z');
  });
});

describe('toCsv', () => {
  it('builds a header row plus data rows', () => {
    const csv = toCsv(['Name', 'Email'], [['Priya, R', 'p@x.com']]);
    expect(csv).toBe('Name,Email\n"Priya, R",p@x.com\n');
  });
});
