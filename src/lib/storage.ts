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
  let currentRank = RANKS[0];
  let nextRank = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
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

  const range = nextRank.minXp - currentRank.minXp;
  const inLevel = Math.max(0, xp - currentRank.minXp);
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
  } catch {}
}

export function addXpAndProgress(
  earnedXp: number,
  mode: 'pointage' | 'master' | 'silhouette',
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

  savePlayerStats(current);

  // Sync with authenticated student session and Supabase Cloud
  syncGameStatsWithCloud(current, mode, score, correctCount, questionCount);

  if (leveledUp) {
    soundManager.playFanfare();
    triggerCelebration();
  }

  return { stats: current, leveledUp, newBadges };
}

// Automatically sync student progress with persistent session & Supabase Cloud
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.isAuthenticated && parsed?.user) {
        const masteredCount = Object.values(stats.departmentStats || {}).filter(
          (d) => d.correct >= 1
        ).length;
        const accuracy = stats.totalQuestions > 0
          ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
          : 85;

        parsed.user.xp = stats.xp;
        parsed.user.level = stats.level;
        parsed.user.streak = stats.streak;
        parsed.user.masteredDeptsCount = masteredCount;
        parsed.user.accuracy = accuracy;

        localStorage.setItem('geo_io_auth_session_v2', JSON.stringify(parsed));
        window.dispatchEvent(new CustomEvent('geo_io_profile_updated', { detail: parsed.user }));

        // Async sync to Supabase Cloud if configured
        if (isSupabaseConfigured && supabase) {
          const client = supabase;
          (async () => {
            try {
              await client
                .from('profiles')
                .update({
                  xp: stats.xp,
                  level: stats.level,
                  streak: stats.streak,
                  mastered_depts: masteredCount,
                  accuracy: accuracy,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', parsed.user.id);

              await client
                .from('scores')
                .insert({
                  user_id: parsed.user.id,
                  mode: mode,
                  score: score,
                  accuracy: questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 100,
                });
            } catch {}
          })();
        }
      }
    }
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
