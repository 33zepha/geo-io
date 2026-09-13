import { LeaderboardEntry, RankingCategory, RankingPeriod } from '../types/ranking';
import { UserProfile } from '../types/auth';
import { supabase, isSupabaseConfigured } from './supabase';

export function calculateExcellenceScore(
  xp: number,
  masteredCount: number,
  accuracy: number
): number {
  return Math.round(xp + masteredCount * 100 + accuracy * 20);
}

// Realistic student seed pool for university cohort benchmarking
const SEED_STUDENTS: Omit<LeaderboardEntry, 'rank'>[] = [
  {
    user: {
      id: 'stud_1',
      pseudo: 'Jeanne_Sorbonne',
      avatarId: 'vague',
      favoriteDept: '29',
      university: 'Paris 1 Panthéon-Sorbonne',
      level: 9,
      xp: 5420,
      streak: 14,
      masteredDeptsCount: 88,
      accuracy: 94,
      createdAt: '2025-01-10T10:00:00Z',
    },
    excellenceScore: 5420 + 88 * 100 + 94 * 20, // 16,100
    totalXp: 5420,
    weeklyXp: 1850,
    masteredCount: 88,
    accuracy: 94,
    pointageHighScore: 1850,
  },
  {
    user: {
      id: 'stud_2',
      pseudo: 'Lucas_Carto',
      avatarId: 'volcan',
      favoriteDept: '63',
      university: 'Univ. Lyon 2 Lumière',
      level: 8,
      xp: 4210,
      streak: 9,
      masteredDeptsCount: 76,
      accuracy: 91,
      createdAt: '2025-01-12T10:00:00Z',
    },
    excellenceScore: 4210 + 76 * 100 + 91 * 20, // 13,630
    totalXp: 4210,
    weeklyXp: 1420,
    masteredCount: 76,
    accuracy: 91,
    pointageHighScore: 1650,
  },
  {
    user: {
      id: 'stud_3',
      pseudo: 'Camille_Bordeaux',
      avatarId: 'vigne',
      favoriteDept: '33',
      university: 'Univ. Bordeaux Montaigne',
      level: 7,
      xp: 3450,
      streak: 8,
      masteredDeptsCount: 68,
      accuracy: 89,
      createdAt: '2025-01-14T10:00:00Z',
    },
    excellenceScore: 3450 + 68 * 100 + 89 * 20, // 12,030
    totalXp: 3450,
    weeklyXp: 1100,
    masteredCount: 68,
    accuracy: 89,
    pointageHighScore: 1400,
  },
  {
    user: {
      id: 'stud_4',
      pseudo: 'Maxime_Alsace',
      avatarId: 'chateau',
      favoriteDept: '67',
      university: 'Univ. de Strasbourg',
      level: 6,
      xp: 2650,
      streak: 6,
      masteredDeptsCount: 52,
      accuracy: 86,
      createdAt: '2025-01-15T10:00:00Z',
    },
    excellenceScore: 2650 + 52 * 100 + 86 * 20, // 9,570
    totalXp: 2650,
    weeklyXp: 850,
    masteredCount: 52,
    accuracy: 86,
    pointageHighScore: 1200,
  },
  {
    user: {
      id: 'stud_5',
      pseudo: 'Léa_Méditerranée',
      avatarId: 'soleil',
      favoriteDept: '13',
      university: 'Aix-Marseille Université',
      level: 6,
      xp: 2310,
      streak: 5,
      masteredDeptsCount: 48,
      accuracy: 88,
      createdAt: '2025-01-16T10:00:00Z',
    },
    excellenceScore: 2310 + 48 * 100 + 88 * 20, // 8,870
    totalXp: 2310,
    weeklyXp: 720,
    masteredCount: 48,
    accuracy: 88,
    pointageHighScore: 1150,
  },
  {
    user: {
      id: 'stud_6',
      pseudo: 'Antoine_Breizh',
      avatarId: 'caravelle',
      favoriteDept: '35',
      university: 'Univ. Rennes 2',
      level: 5,
      xp: 1950,
      streak: 4,
      masteredDeptsCount: 42,
      accuracy: 84,
      createdAt: '2025-01-17T10:00:00Z',
    },
    excellenceScore: 1950 + 42 * 100 + 84 * 20, // 7,830
    totalXp: 1950,
    weeklyXp: 640,
    masteredCount: 42,
    accuracy: 84,
    pointageHighScore: 980,
  },
  {
    user: {
      id: 'stud_7',
      pseudo: 'Romain_Alpin',
      avatarId: 'alpin',
      favoriteDept: '38',
      university: 'Univ. Grenoble Alpes',
      level: 5,
      xp: 1680,
      streak: 3,
      masteredDeptsCount: 36,
      accuracy: 82,
      createdAt: '2025-01-18T10:00:00Z',
    },
    excellenceScore: 1680 + 36 * 100 + 82 * 20, // 6,920
    totalXp: 1680,
    weeklyXp: 510,
    masteredCount: 36,
    accuracy: 82,
    pointageHighScore: 910,
  },
  {
    user: {
      id: 'stud_8',
      pseudo: 'Sarah_Flandres',
      avatarId: 'lion',
      favoriteDept: '59',
      university: 'Univ. de Lille',
      level: 4,
      xp: 1250,
      streak: 3,
      masteredDeptsCount: 29,
      accuracy: 85,
      createdAt: '2025-01-19T10:00:00Z',
    },
    excellenceScore: 1250 + 29 * 100 + 85 * 20, // 5,850
    totalXp: 1250,
    weeklyXp: 460,
    masteredCount: 29,
    accuracy: 85,
    pointageHighScore: 820,
  },
  {
    user: {
      id: 'stud_9',
      pseudo: 'Thomas_Pyrénées',
      avatarId: 'aigle',
      favoriteDept: '31',
      university: 'Univ. Toulouse Jean Jaurès',
      level: 3,
      xp: 890,
      streak: 2,
      masteredDeptsCount: 21,
      accuracy: 79,
      createdAt: '2025-01-20T10:00:00Z',
    },
    excellenceScore: 890 + 21 * 100 + 79 * 20, // 4,570
    totalXp: 890,
    weeklyXp: 380,
    masteredCount: 21,
    accuracy: 79,
    pointageHighScore: 710,
  },
  {
    user: {
      id: 'stud_10',
      pseudo: 'Clara_Gascogne',
      avatarId: 'foret',
      favoriteDept: '40',
      university: "Univ. de Pau et des Pays de l'Adour",
      level: 2,
      xp: 450,
      streak: 2,
      masteredDeptsCount: 14,
      accuracy: 76,
      createdAt: '2025-01-21T10:00:00Z',
    },
    excellenceScore: 450 + 14 * 100 + 76 * 20, // 3,370
    totalXp: 450,
    weeklyXp: 280,
    masteredCount: 14,
    accuracy: 76,
    pointageHighScore: 550,
  },
];

export function getLeaderboardEntries(
  currentUser: UserProfile | null,
  period: RankingPeriod = 'all_time',
  category: RankingCategory = 'composite',
  searchQuery = ''
): {
  entries: LeaderboardEntry[];
  top3: LeaderboardEntry[];
  rest: LeaderboardEntry[];
  userEntry: LeaderboardEntry | null;
} {
  const pool = [...SEED_STUDENTS];

  // If current user is logged in, insert or update their entry in the pool
  if (currentUser) {
    const userExcellence = calculateExcellenceScore(
      currentUser.xp,
      currentUser.masteredDeptsCount,
      currentUser.accuracy || 85
    );

    pool.push({
      user: currentUser,
      excellenceScore: userExcellence,
      totalXp: currentUser.xp,
      weeklyXp: Math.round(currentUser.xp * 0.45),
      masteredCount: currentUser.masteredDeptsCount,
      accuracy: currentUser.accuracy || 85,
      pointageHighScore: Math.round(currentUser.xp * 0.35),
    });
  }

  // Sort based on category and period
  pool.sort((a, b) => {
    if (category === 'pointage') {
      return b.pointageHighScore - a.pointageHighScore;
    }
    if (category === 'mastery') {
      return b.masteredCount - a.masteredCount;
    }
    if (period === 'weekly') {
      return b.weeklyXp - a.weeklyXp;
    }
    // Default: Composite Excellence Score
    return b.excellenceScore - a.excellenceScore;
  });

  // Assign ranks
  const ranked: LeaderboardEntry[] = pool.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  // Filter if searchQuery
  const filtered = searchQuery
    ? ranked.filter(
        (e) =>
          e.user.pseudo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.user.university &&
            e.user.university.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : ranked;

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);
  const userEntry = currentUser
    ? ranked.find((e) => e.user.id === currentUser.id) || null
    : null;

  return {
    entries: filtered,
    top3,
    rest,
    userEntry,
  };
}

/**
 * Charge le classement dynamique depuis Supabase avec synchronisation des vrais étudiants de la promo
 */
export async function fetchLiveLeaderboardEntries(
  currentUser: UserProfile | null,
  period: RankingPeriod = 'all_time',
  category: RankingCategory = 'composite',
  searchQuery = ''
): Promise<{
  entries: LeaderboardEntry[];
  top3: LeaderboardEntry[];
  rest: LeaderboardEntry[];
  userEntry: LeaderboardEntry | null;
}> {
  let pool: Omit<LeaderboardEntry, 'rank'>[] = [];

  // 1. Récupération des profils réels Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50);

      if (!error && profiles && profiles.length > 0) {
        pool = profiles.map((p) => {
          const user: UserProfile = {
            id: p.id,
            pseudo: p.pseudo || 'Étudiant',
            avatarId: p.avatar_id || 'boussole',
            favoriteDept: p.favorite_dept || '75',
            university: p.university || '',
            level: p.level || 1,
            xp: p.xp || 0,
            streak: p.streak || 1,
            masteredDeptsCount: p.mastered_depts || 0,
            accuracy: p.accuracy || 85,
            createdAt: p.created_at || new Date().toISOString(),
          };
          const excellence = calculateExcellenceScore(user.xp, user.masteredDeptsCount, user.accuracy);
          return {
            user,
            excellenceScore: excellence,
            totalXp: user.xp,
            weeklyXp: Math.round(user.xp * 0.45),
            masteredCount: user.masteredDeptsCount,
            accuracy: user.accuracy,
            pointageHighScore: Math.round(user.xp * 0.35),
          };
        });
      }
    } catch (e) {
      console.warn('Live leaderboard fetch notice:', e);
    }
  }

  // 2. Si moins de 8 étudiants réels sont inscrits, compléter avec des étudiants benchmarks pour le podium
  if (pool.length < 8) {
    const existingIds = new Set(pool.map((p) => p.user.id));
    for (const seed of SEED_STUDENTS) {
      if (!existingIds.has(seed.user.id)) {
        pool.push(seed);
      }
    }
  }

  // 3. Injecter ou mettre à jour l'étudiant connecté avec son XP le plus frais
  if (currentUser) {
    const userExcellence = calculateExcellenceScore(
      currentUser.xp,
      currentUser.masteredDeptsCount,
      currentUser.accuracy || 85
    );
    const userEntryData = {
      user: currentUser,
      excellenceScore: userExcellence,
      totalXp: currentUser.xp,
      weeklyXp: Math.round(currentUser.xp * 0.45),
      masteredCount: currentUser.masteredDeptsCount,
      accuracy: currentUser.accuracy || 85,
      pointageHighScore: Math.round(currentUser.xp * 0.35),
    };

    const existingIdx = pool.findIndex((p) => p.user.id === currentUser.id);
    if (existingIdx >= 0) {
      pool[existingIdx] = userEntryData;
    } else {
      pool.push(userEntryData);
    }
  }

  // 4. Tri selon la catégorie et période
  pool.sort((a, b) => {
    if (category === 'pointage') return b.pointageHighScore - a.pointageHighScore;
    if (category === 'mastery') return b.masteredCount - a.masteredCount;
    if (period === 'weekly') return b.weeklyXp - a.weeklyXp;
    return b.excellenceScore - a.excellenceScore;
  });

  // 5. Attribution des rangs
  const ranked: LeaderboardEntry[] = pool.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  const filtered = searchQuery
    ? ranked.filter(
        (e) =>
          e.user.pseudo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.user.university &&
            e.user.university.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : ranked;

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);
  const userEntry = currentUser
    ? ranked.find((e) => e.user.id === currentUser.id) || null
    : null;

  return {
    entries: filtered,
    top3,
    rest,
    userEntry,
  };
}
