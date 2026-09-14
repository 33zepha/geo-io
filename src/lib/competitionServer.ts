import { createClient } from '@supabase/supabase-js';
import type { GameModeType } from '../types/game';
import type { CompetitionOverview, OfficialAnswer, WeeklyStanding } from '../types/competition';
import {
  buildDailyMissions,
  buildRewards,
  getDailyModes,
  getParisCompetitionKeys,
  missionAwards,
  nextRewardAt,
} from './competitionEngine';
import { officialAnswerKey, officialSeed } from './officialChallenge';

interface PreviewPlayerState {
  completed: string[];
  points: number;
  streak: number;
  attempts: Map<string, { dayKey: string; slot: 1 | 2; mode: GameModeType }>;
}

const globalPreview = globalThis as typeof globalThis & { __geoCompetitionPreview?: PreviewPlayerState };

function previewState() {
  if (!globalPreview.__geoCompetitionPreview) {
    globalPreview.__geoCompetitionPreview = { completed: [], points: 0, streak: 2, attempts: new Map() };
  }
  return globalPreview.__geoCompetitionPreview;
}

export function isPreviewRequest(request: Request) {
  return process.env.NODE_ENV === 'development' && request.headers.get('x-geo-mobile-preview') === '1';
}

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function competitionEnabled(userId: string | null, preview: boolean) {
  if (preview) return true;
  if (process.env.COMPETITION_ENABLED === 'true') return true;
  const previewUsers = (process.env.COMPETITION_PREVIEW_USER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean);
  return Boolean(userId && previewUsers.includes(userId));
}

export async function authenticatedUserId(request: Request) {
  if (isPreviewRequest(request)) return 'mobile-preview';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!url || !anon || !token) return null;
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user?.id ?? null;
}

function makeOverview(
  completed: string[],
  weeklyPoints: number,
  streakDays: number,
  rank: number | null,
  preview: boolean,
  jokerUsed = false,
  earnedRewards: Array<{ reward_id: string; reward_kind: string; label: string }> = []
): CompetitionOverview {
  const { dayKey, weekKey } = getParisCompetitionKeys();
  const missions = buildDailyMissions(dayKey, completed);
  return {
    enabled: true,
    preview,
    dayKey,
    weekKey,
    seed: officialSeed(dayKey, 1, getDailyModes(dayKey)[0]),
    dailyPoints: missions.filter((mission) => mission.completed).reduce((sum, mission) => sum + mission.points, 0),
    weeklyPoints,
    weeklyRank: rank,
    nextRewardAt: nextRewardAt(weeklyPoints),
    missions,
    streak: { days: streakDays, jokerAvailable: !jokerUsed, jokerUsedThisWeek: jokerUsed },
    rewards: [
      ...buildRewards(weeklyPoints),
      ...earnedRewards
        .filter((reward) => !['weekly-badge', 'weekly-title', 'weekly-frame'].includes(reward.reward_id))
        .map((reward) => ({ id: reward.reward_id, kind: reward.reward_kind as 'badge' | 'title' | 'frame' | 'medal', label: reward.label, unlocked: true })),
    ],
  };
}

export async function getOverview(request: Request): Promise<CompetitionOverview> {
  if (isPreviewRequest(request)) {
    const state = previewState();
    return makeOverview(state.completed, state.points, state.streak, 4, true);
  }
  const userId = await authenticatedUserId(request);
  if (!competitionEnabled(userId, false)) {
    return { ...makeOverview([], 0, 0, null, false), enabled: false };
  }
  const db = serverClient();
  if (!db) return { ...makeOverview([], 0, 0, null, false), enabled: false };
  const { dayKey, weekKey } = getParisCompetitionKeys();
  const previousWeek = new Date(`${weekKey}T12:00:00Z`);
  previousWeek.setUTCDate(previousWeek.getUTCDate() - 7);
  await db.rpc('finalize_competition_week', { target_week: previousWeek.toISOString().slice(0, 10) });
  const [completionsResult, streakResult, standingsResult, rewardsResult] = await Promise.all([
    userId
      ? db.from('competition_mission_completions').select('mission_id, points').eq('user_id', userId).eq('day_key', dayKey)
      : Promise.resolve({ data: [], error: null }),
    userId
      ? db.from('competition_streaks').select('days, joker_week_key, joker_used').eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    db.from('competition_weekly_leaderboard').select('*').eq('week_key', weekKey).order('rank'),
    userId
      ? db.from('competition_rewards').select('reward_id, reward_kind, label').eq('user_id', userId).order('awarded_at', { ascending: false }).limit(12)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const standings = standingsResult.data ?? [];
  const own = userId ? standings.find((row) => row.user_id === userId) : null;
  if (userId && request.headers.get('x-geo-track-view') === '1') {
    void db.from('competition_events').insert({ user_id: userId, event_type: 'missions_viewed', day_key: dayKey }).then(() => undefined);
  }
  return makeOverview(
    (completionsResult.data ?? []).map((row) => row.mission_id),
    Number(own?.points ?? 0),
    Number(streakResult.data?.days ?? 0),
    own ? Number(own.rank) : null,
    false,
    Boolean(streakResult.data?.joker_week_key === weekKey && streakResult.data?.joker_used),
    rewardsResult.data ?? []
  );
}

export async function getWeeklyStandings(request: Request): Promise<WeeklyStanding[]> {
  if (isPreviewRequest(request)) {
    const state = previewState();
    const samples: Array<[string, string, number, number, number]> = [
      ['julie_geo', 'vague', 465, 12, 91],
      ['MaxAtlas', 'alpin', 410, 11, 88],
      ['LinaCarto', 'vigne', 360, 10, 86],
      ['MobilePreview', 'boussole', state.points, state.completed.length, 80],
    ];
    return samples
      .sort((a, b) => b[2] - a[2])
      .map((row, index) => ({ rank: index + 1, userId: row[0], pseudo: row[0], avatarId: row[1], points: row[2], missionsCompleted: row[3], accuracy: row[4], reachedAt: new Date().toISOString() }));
  }
  const db = serverClient();
  const userId = await authenticatedUserId(request);
  if (!db || !competitionEnabled(userId, false)) return [];
  const { weekKey } = getParisCompetitionKeys();
  const { data, error } = await db.from('competition_weekly_leaderboard').select('*').eq('week_key', weekKey).order('rank');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    rank: Number(row.rank), userId: row.user_id, pseudo: row.pseudo, avatarId: row.avatar_id,
    points: Number(row.points), missionsCompleted: Number(row.missions_completed), accuracy: Number(row.accuracy), reachedAt: row.reached_at,
  }));
}

export async function startAttempt(request: Request, slot: 1 | 2) {
  const userId = await authenticatedUserId(request);
  if (!userId) throw new Error('AUTH_REQUIRED');
  if (!competitionEnabled(userId, isPreviewRequest(request))) throw new Error('COMPETITION_DISABLED');
  const { dayKey, weekKey } = getParisCompetitionKeys();
  const mode = getDailyModes(dayKey)[slot - 1];
  const id = crypto.randomUUID();
  if (isPreviewRequest(request)) {
    previewState().attempts.set(id, { dayKey, slot, mode });
    return { id, dayKey, mode, slot, seed: officialSeed(dayKey, slot, mode), status: 'started' as const };
  }
  const db = serverClient();
  if (!db) throw new Error('COMPETITION_NOT_CONFIGURED');
  const { error } = await db.from('competition_attempts').insert({ id, user_id: userId, day_key: dayKey, week_key: weekKey, slot, mode, seed: officialSeed(dayKey, slot, mode) });
  if (error) throw error;
  await db.from('competition_events').insert({ user_id: userId, event_type: 'attempt_started', day_key: dayKey });
  return { id, dayKey, mode, slot, seed: officialSeed(dayKey, slot, mode), status: 'started' as const };
}

export async function completeAttempt(request: Request, attemptId: string, answers: OfficialAnswer[]) {
  const userId = await authenticatedUserId(request);
  if (!userId) throw new Error('AUTH_REQUIRED');
  const db = serverClient();
  let attempt: { dayKey: string; slot: 1 | 2; mode: GameModeType } | null = null;
  if (isPreviewRequest(request)) {
    attempt = previewState().attempts.get(attemptId) ?? null;
  } else if (db) {
    const { data, error } = await db.from('competition_attempts').select('day_key, slot, mode, status').eq('id', attemptId).eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (data?.status === 'completed') throw new Error('ATTEMPT_ALREADY_COMPLETED');
    if (data) attempt = { dayKey: data.day_key, slot: data.slot as 1 | 2, mode: data.mode as GameModeType };
  }
  if (!attempt || answers.length !== 5) throw new Error('INVALID_ATTEMPT');
  const key = officialAnswerKey(attempt.dayKey, attempt.slot, attempt.mode);
  const seen = new Set<string>();
  let correct = 0;
  for (const answer of answers) {
    if (!key.has(answer.questionId) || seen.has(answer.questionId)) throw new Error('INVALID_ANSWER_SET');
    seen.add(answer.questionId);
    if (key.get(answer.questionId) === answer.answerCode) correct += 1;
  }
  const awardedIds = missionAwards(attempt.dayKey, attempt.slot, correct, 5);
  if (isPreviewRequest(request)) {
    const state = previewState();
    const fresh = awardedIds.filter((id) => !state.completed.includes(id));
    state.completed.push(...fresh);
    state.points += buildDailyMissions(attempt.dayKey).filter((mission) => fresh.includes(mission.id)).reduce((sum, mission) => sum + mission.points, 0);
    state.attempts.delete(attemptId);
    return { correct, fresh };
  }
  if (!db) throw new Error('COMPETITION_NOT_CONFIGURED');
  const definitions = buildDailyMissions(attempt.dayKey);
  const rows = awardedIds.map((missionId) => {
    const mission = definitions.find((item) => item.id === missionId)!;
    return { user_id: userId, mission_id: missionId, day_key: attempt!.dayKey, week_key: getParisCompetitionKeys(new Date(`${attempt!.dayKey}T12:00:00Z`)).weekKey, mode: attempt!.mode, points: mission.points, accuracy: correct * 20 };
  });
  const { data: inserted, error: completionError } = rows.length
    ? await db.from('competition_mission_completions').upsert(rows, { onConflict: 'user_id,mission_id', ignoreDuplicates: true }).select('mission_id')
    : { data: [], error: null };
  if (completionError) throw completionError;
  const fresh = (inserted ?? []).map((row) => row.mission_id);
  await Promise.all([
    db.from('competition_attempts').update({ status: 'completed', correct_count: correct, total_questions: 5, answers, completed_at: new Date().toISOString() }).eq('id', attemptId).eq('user_id', userId),
    fresh.length ? db.from('competition_events').insert({ user_id: userId, event_type: 'mission_completed', day_key: attempt.dayKey }) : Promise.resolve(),
  ]);
  return { correct, fresh };
}
