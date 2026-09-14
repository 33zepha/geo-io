'use client';

import type { CompetitionOverview, CompetitionUpdate, OfficialAnswer, OfficialAttempt, WeeklyStanding } from '../types/competition';
import { supabase } from './supabase';

async function headers() {
  const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
  const result: Record<string, string> = { 'Content-Type': 'application/json' };
  if (data.session?.access_token) result.Authorization = `Bearer ${data.session.access_token}`;
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mobilePreview') === '1') {
    result['x-geo-mobile-preview'] = '1';
  }
  return result;
}

export async function fetchCompetition(trackView = false): Promise<{ overview: CompetitionOverview; standings: WeeklyStanding[] }> {
  const requestHeaders = await headers();
  if (trackView) requestHeaders['x-geo-track-view'] = '1';
  const response = await fetch('/api/competition', { headers: requestHeaders, cache: 'no-store' });
  if (!response.ok) throw new Error('Impossible de charger les missions.');
  return response.json();
}

export async function beginOfficialAttempt(slot: 1 | 2): Promise<OfficialAttempt> {
  const response = await fetch('/api/competition/attempt', { method: 'POST', headers: await headers(), body: JSON.stringify({ action: 'start', slot }) });
  if (!response.ok) throw new Error('Impossible de démarrer la mission officielle.');
  return (await response.json()).attempt;
}

export async function submitOfficialAttempt(attemptId: string, answers: OfficialAnswer[]): Promise<CompetitionUpdate> {
  const response = await fetch('/api/competition/attempt', { method: 'POST', headers: await headers(), body: JSON.stringify({ action: 'complete', attemptId, answers }) });
  if (!response.ok) throw new Error('Le serveur a refusé ce résultat.');
  const payload = await response.json();
  const awardedPoints = payload.overview.missions
    .filter((mission: CompetitionOverview['missions'][number]) => payload.result.fresh.includes(mission.id))
    .reduce((total: number, mission: CompetitionOverview['missions'][number]) => total + mission.points, 0);
  return { awardedPoints, newlyCompletedMissionIds: payload.result.fresh, overview: payload.overview };
}
