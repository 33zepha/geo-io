import { PlayerStats } from '../types/geo';
import confetti from 'canvas-confetti';
import { soundManager } from './audio';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'geo_io_player_stats_v2';

export const RANKS = [
  { level: 1, title: 'Arpenteur Curieux', minXp: 0 },
  { level: 2, title: 'Explorateur de Bocage', minXp: 200 },
  { level: 3, title: 'Guide des Terroirs', minXp: 500 },
  { level: 4, title: 'Topographe Averti', minXp: 900 },
  { level: 5, title: 'Amoureux des Régions', minXp: 1400 },
  { level: 6, title: 'Cartographe Itinérant', minXp: 2000 },
  { level: 7, title: 'Connaisseur de l\'Hexagone', minXp: 2800 },
  { level: 8, title: 'Maître du Territoire', minXp: 3800 },
  { level: 9, title: 'Docteur ès Géographie', minXp: 5000 },
  { level: 10, title: 'Agrégé Solaire de France', minXp: 7000 },
];

export function getRankForXp(xp: number): {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const safeXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (safeXp >= RANKS[i].minXp) {
      currentRank = RANKS[i];
      nextRank = RANKS[i + 1] || {
        level: currentRank.level + 1,
        title: 'Sommité Géographique',
        minXp: currentRank.minXp + 3000,
      };
    } else {
      break;
    }
  }

  const range = Math.max(1, nextRank.minXp - currentRank.minXp);
  const inLevel = Math.max(0, safeXp - currentRank.minXp);
  const progressPercent = Math.min(100, Math.round((inLevel / range) * 100));

  return {
    level: currentRank.level,
    title: currentRank.title,
    currentLevelXp: inLevel,
    nextLevelXp: range,
    progressPercent,
  };
}

export const DEFAULT_STATS: PlayerStats = {
  xp: 0,
  level: 1,
  rankTitle: 'Arpenteur Curieux',
  streak: 1,
  lastPlayedDate: '2025-01-01',
  totalGames: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  highScorePointage: 0,
  highScoreMaster: 0,
  highScoreSilhouette: 0,
  unlockedBadges: [],
  departmentStats: {},
};

export function loadPlayerStats(): PlayerStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;

    const parsed = JSON.parse(raw) as PlayerStats;
    const rankInfo = getRankForXp(parsed.xp);
    parsed.level = rankInfo.level;
    parsed.rankTitle = rankInfo.title;

    return parsed;
  } catch {
    return DEFAULT_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent('geo_io_stats_updated', { detail: stats }));
  } catch {}
}

/**
 * Hydrate local progress from the cloud profile after login.
 * Prevents a fresh browser (0 XP) from overwriting a high cloud score on the next game sync.
 */
export function hydrateLocalStatsFromCloud(profile: {
  xp: number;
  level: number;
  streak: number;
  masteredDeptsCount: number;
  accuracy: number;
}): PlayerStats {
  const local = loadPlayerStats();
  const cloudXp = Math.max(0, Number(profile.xp) || 0);
  const mergedXp = Math.max(local.xp || 0, cloudXp);
  const rankInfo = getRankForXp(mergedXp);

  const merged: PlayerStats = {
    ...local,
    xp: mergedXp,
    level: Math.max(local.level || 1, profile.level || 1, rankInfo.level),
    rankTitle: rankInfo.title,
    streak: Math.max(local.streak || 1, profile.streak || 1),
    totalCorrect: local.totalCorrect || 0,
    totalQuestions: local.totalQuestions || 0,
  };

  // If cloud accuracy exists and local has no history, seed a plausible ratio.
  if ((merged.totalQuestions || 0) === 0 && profile.accuracy > 0) {
    merged.totalQuestions = 20;
    merged.totalCorrect = Math.round((20 * Math.min(100, profile.accuracy)) / 100);
  }

  savePlayerStats(merged);
  return merged;
}

export function addXpAndProgress(
  earnedXp: number,
  mode: 'pointage' | 'master' | 'silhouette' | 'qcm' | 'enquete',
  score: number,
  correctCount: number,
  questionCount: number,
  deptFeedback?: { code: string; isCorrect: boolean }[]
): { stats: PlayerStats; leveledUp: boolean; newBadges: string[] } {
  const current = loadPlayerStats();
  const oldRank = getRankForXp(current.xp);
  const newXp = current.xp + earnedXp;
  const newRank = getRankForXp(newXp);

  const leveledUp = newRank.level > oldRank.level;
  const newBadges: string[] = [];

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  if (current.lastPlayedDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (current.lastPlayedDate === yesterday) {
      current.streak += 1;
    } else {
      current.streak = 1;
    }
    current.lastPlayedDate = today;
  }

  current.xp = newXp;
  current.level = newRank.level;
  current.rankTitle = newRank.title;
  current.totalGames += 1;
  current.totalCorrect += correctCount;
  current.totalQuestions += questionCount;

  // Track department mastery
  if (deptFeedback) {
    for (const item of deptFeedback) {
      if (!current.departmentStats[item.code]) {
        current.departmentStats[item.code] = { correct: 0, attempts: 0 };
      }
      current.departmentStats[item.code].attempts += 1;
      if (item.isCorrect) {
        current.departmentStats[item.code].correct += 1;
      }
    }
  }


  // High scores by mode family
  if (mode === 'pointage') {
    current.highScorePointage = Math.max(current.highScorePointage || 0, score);
  } else if (mode === 'silhouette') {
    current.highScoreSilhouette = Math.max(current.highScoreSilhouette || 0, score);
  } else {
    // qcm / enquete / master share the "master" high score slot
    current.highScoreMaster = Math.max(current.highScoreMaster || 0, score);
  }

  // Lightweight badge unlocks
  const unlock = (id: string) => {
    if (!current.unlockedBadges.includes(id)) {
      current.unlockedBadges.push(id);
      newBadges.push(id);
    }
  };
  if (current.totalGames >= 1) unlock('first_step');
  if (current.streak >= 3) unlock('streak_3d');
  if (mode === 'silhouette' && correctCount >= 5 && correctCount === questionCount) {
    unlock('silhouette_oracle');
  }
  if (mode === 'pointage' && correctCount >= 5 && correctCount === questionCount) {
    unlock('sharp_shooter');
  }
  if (newRank.level >= 10) unlock('ign_director');

  savePlayerStats(current);

  // Sync with authenticated student session and Supabase Cloud
  syncGameStatsWithCloud(current, mode, score, correctCount, questionCount);

  if (leveledUp) {
    soundManager.playFanfare();
    triggerCelebration();
  }

  return { stats: current, leveledUp, newBadges };
}

// Sync student progress to session + Supabase — NEVER lower cloud XP from a fresh device.
function syncGameStatsWithCloud(
  stats: PlayerStats,
  mode: string,
  score: number,
  correctCount: number,
  questionCount: number
): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem('geo_io_auth_session_v2');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed?.isAuthenticated || !parsed?.user?.id) return;

    const masteredCount = Object.values(stats.departmentStats || {}).filter(
      (d) => d.correct >= 1
    ).length;
    const accuracy =
      stats.totalQuestions > 0
        ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
        : Number(parsed.user.accuracy) || 85;

    // Keep the best known XP in the local auth cache (cloud may still be higher until fetch).
    const sessionXp = Math.max(Number(parsed.user.xp) || 0, stats.xp || 0);
    const sessionLevel = Math.max(Number(parsed.user.level) || 1, stats.level || 1);
    const sessionStreak = Math.max(Number(parsed.user.streak) || 1, stats.streak || 1);
    const sessionMastered = Math.max(
      Number(parsed.user.masteredDeptsCount) || 0,
      masteredCount
    );

    parsed.user.xp = sessionXp;
    parsed.user.level = sessionLevel;
    parsed.user.streak = sessionStreak;
    parsed.user.masteredDeptsCount = sessionMastered;
    parsed.user.accuracy = Math.max(Number(parsed.user.accuracy) || 0, accuracy);

    localStorage.setItem('geo_io_auth_session_v2', JSON.stringify(parsed));
    window.dispatchEvent(new CustomEvent('geo_io_profile_updated', { detail: parsed.user }));

    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;
    const userId = parsed.user.id as string;

    void (async () => {
      try {
        const { data: cloudRow, error: cloudError } = await client
          .from('profiles')
          .select('xp, level, streak, mastered_depts, accuracy')
          .eq('id', userId)
          .maybeSingle();

        // If we cannot read the cloud floor, refuse to write progress fields.
        // Treating a failed/missing read as xp=0 was wiping high scores.
        if (cloudError || !cloudRow) {
          console.warn('Game cloud sync aborted: cloud profile unread', cloudError);
          await client.from('scores').insert({
            user_id: userId,
            mode,
            score,
            accuracy: questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 100,
          });
          return;
        }

        const cloudXp = Math.max(0, Number(cloudRow.xp) || 0);
        const safeXp = Math.max(cloudXp, stats.xp || 0, sessionXp);
        const safeLevel = Math.max(
          Number(cloudRow.level) || 1,
          stats.level || 1,
          getRankForXp(safeXp).level
        );
        const safeStreak = Math.max(Number(cloudRow.streak) || 1, stats.streak || 1);
        const safeMastered = Math.max(
          Number(cloudRow.mastered_depts) || 0,
          masteredCount
        );
        const safeAccuracy = Math.max(
          Number(cloudRow.accuracy) || 0,
          accuracy
        );

        // Persist the merged floor back to local so the next game continues from cloud.
        if (safeXp > (stats.xp || 0)) {
          const mergedLocal = { ...stats, xp: safeXp, level: safeLevel, streak: safeStreak };
          const rank = getRankForXp(safeXp);
          mergedLocal.level = rank.level;
          mergedLocal.rankTitle = rank.title;
          savePlayerStats(mergedLocal);
        }

        // Only bump progress upward — never send a lower absolute XP payload.
        if (safeXp > cloudXp || safeMastered > Number(cloudRow.mastered_depts || 0) || safeAccuracy > Number(cloudRow.accuracy || 0)) {
          await client
            .from('profiles')
            .update({
              xp: safeXp,
              level: safeLevel,
              streak: safeStreak,
              mastered_depts: safeMastered,
              accuracy: safeAccuracy,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }

        await client.from('scores').insert({
          user_id: userId,
          mode,
          score,
          accuracy: questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 100,
        });
      } catch (error) {
        console.warn('Game cloud sync error:', error);
      }
    })();
  } catch (e) {
    console.warn('Game cloud sync error:', e);
  }
}

// Warm sunny celebration confetti (terracotta, honey, sage, cream)
export function triggerCelebration(): void {
  if (typeof window === 'undefined') return;
  try {
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#D96B43', '#E8A317', '#2F8F62', '#3B8AA8', '#FDF4F0'],
    });
  } catch {}
}
