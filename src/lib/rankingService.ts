import { LeaderboardEntry } from '../types/ranking';
import { UserProfile } from '../types/auth';
import { supabase, isSupabaseConfigured } from './supabase';

export function calculateExcellenceScore(
  xp: number,
  masteredCount: number,
  accuracy: number
): number {
  return Math.round(xp + masteredCount * 100 + accuracy * 20);
}

export async function fetchLiveLeaderboardEntries(): Promise<{
  entries: LeaderboardEntry[];
  top3: LeaderboardEntry[];
  rest: LeaderboardEntry[];
}> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Configuration Supabase manquante.');
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, pseudo, avatar_id, level, xp, streak, mastered_depts, accuracy, created_at')
    .limit(100);

  if (error) throw error;

  // Soft-ban column may not exist yet — ignore failures and keep ranking up.
  let bannedIds = new Set<string>();
  const { data: bannedRows, error: bannedError } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_banned', true);
  if (!bannedError && bannedRows) {
    bannedIds = new Set(bannedRows.map((row) => row.id as string));
  }

  const ranked: LeaderboardEntry[] = (profiles ?? [])
    .filter((profile) => !bannedIds.has(profile.id))
    .map((profile) => {
      const user: UserProfile = {
        id: profile.id,
        pseudo: profile.pseudo,
        avatarId: profile.avatar_id ?? 'boussole',
        level: Number(profile.level ?? 1),
        xp: Number(profile.xp ?? 0),
        streak: Number(profile.streak ?? 0),
        masteredDeptsCount: Number(profile.mastered_depts ?? 0),
        accuracy: Number(profile.accuracy ?? 0),
        createdAt: profile.created_at ?? '',
      };

      return {
        rank: 0,
        user,
        excellenceScore: calculateExcellenceScore(
          user.xp,
          user.masteredDeptsCount,
          user.accuracy
        ),
        totalXp: user.xp,
        masteredCount: user.masteredDeptsCount,
        accuracy: user.accuracy,
      };
    })
    .sort((a, b) => b.excellenceScore - a.excellenceScore)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return {
    entries: ranked,
    top3: ranked.slice(0, 3),
    rest: ranked.slice(3),
  };
}
