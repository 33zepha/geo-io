import { completeAttempt, startAttempt } from '@/lib/competitionServer';
import type { OfficialAnswer } from '@/types/competition';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'start' && (body.slot === 1 || body.slot === 2)) {
      return Response.json({ attempt: await startAttempt(request, body.slot) }, { status: 201 });
    }
    if (body.action === 'complete' && typeof body.attemptId === 'string' && Array.isArray(body.answers)) {
      const result = await completeAttempt(request, body.attemptId, body.answers as OfficialAnswer[]);
      return Response.json({ result, overview: await (await import('@/lib/competitionServer')).getOverview(request) });
    }
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    const status = message === 'AUTH_REQUIRED' ? 401 : message.includes('INVALID') || message.includes('COMPLETED') ? 409 : 503;
    return Response.json({ error: message }, { status });
  }
}
