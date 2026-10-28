import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getChatKnowledge } from '@/src/lib/chatbot';
import { answer } from '@/src/lib/chatbot-intents';
import { clientIp, memoryRateLimit } from '@/src/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  message: z.string().trim().min(1).max(500),
});

/**
 * POST /api/chat
 *
 * Keyword-matched answers built from published site content. No model, no
 * outbound calls, no API key — so it cannot hallucinate a service, a price or a
 * client result. Rate limited per IP to keep it from being used as a probe.
 */
export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const limit = memoryRateLimit(`chat:${ip}`, 30, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: 'Too many messages. Please wait a moment.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Please type a message.' }, { status: 422 });
  }

  const kb = await getChatKnowledge();
  const reply = answer(parsed.data.message, kb);

  return NextResponse.json({
    ok: true,
    reply: { text: reply.text, chips: reply.chips ?? [], links: reply.links ?? [] },
  });
}
