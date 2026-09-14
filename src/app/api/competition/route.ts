import { getOverview, getWeeklyStandings } from '@/lib/competitionServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const [overview, standings] = await Promise.all([getOverview(request), getWeeklyStandings(request)]);
    return Response.json({ overview, standings }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Competition overview error:', error);
    return Response.json({ error: 'Competition unavailable' }, { status: 503 });
  }
}
