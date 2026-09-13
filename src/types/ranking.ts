import { UserProfile } from './auth';

export type RankingPeriod = 'all_time' | 'weekly';
export type RankingCategory = 'composite' | 'pointage' | 'mastery';

export interface LeaderboardEntry {
  rank: number;
  user: UserProfile;
  excellenceScore: number;
  totalXp: number;
  weeklyXp: number;
  masteredCount: number;
  accuracy: number;
  pointageHighScore: number;
}
