/** Pure anti-spam heuristics (no I/O) so they can be unit tested. */

export type SpamVerdict = { spam: boolean; reason?: string };

/** Minimum considerate fill time for a project enquiry, in milliseconds. */
export const MIN_FILL_TIME_MS = 2500;

export function honeypotTrap(honeypot: string | undefined, startedAt: number | undefined, now = Date.now()): SpamVerdict {
  if (honeypot && honeypot.trim().length > 0) {
    return { spam: true, reason: 'honeypot' };
  }
  if (typeof startedAt === 'number') {
    const elapsed = now - startedAt;
    // Nothing faster than this is a human typing a project brief.
    if (elapsed >= 0 && elapsed < MIN_FILL_TIME_MS) return { spam: true, reason: 'too-fast' };
  }
  return { spam: false };
}

export function looksLikeLinkSpam(message: string): boolean {
  const links = (message.match(/https?:\/\//gi) ?? []).length;
  const hasCyrillic = /[\u0400-\u04FF]/.test(message);
  const knownSpam = /\b(viagra|casino|crypto giveaway|seo backlinks|guest post offer)\b/i.test(message);
  return links > 4 || hasCyrillic || knownSpam;
}
