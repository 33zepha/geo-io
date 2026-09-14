import { UserProfile } from './auth';

export interface LeaderboardEntry {
  rank: number;
  user: UserProfile;
  excellenceScore: number;
  totalXp: number;
  masteredCount: number;
  accuracy: number;
}
