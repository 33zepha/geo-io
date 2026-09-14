import type { GameModeType } from './game';

export type DailyMissionKind = 'participation' | 'precision' | 'variety';

export interface DailyMission {
  id: string;
  kind: DailyMissionKind;
  title: string;
  description: string;
  points: 20 | 35 | 45;
  mode: GameModeType;
  slot: 1 | 2;
  completed: boolean;
}

export interface MissionStreak {
  days: number;
  jokerAvailable: boolean;
  jokerUsedThisWeek: boolean;
}

export interface CosmeticReward {
  id: string;
  kind: 'badge' | 'title' | 'frame' | 'medal';
  label: string;
  unlocked: boolean;
}

export interface WeeklyStanding {
  rank: number;
  userId: string;
  pseudo: string;
  avatarId: string;
  points: number;
  missionsCompleted: number;
  accuracy: number;
  reachedAt: string;
}

export interface CompetitionOverview {
  enabled: boolean;
  preview: boolean;
  dayKey: string;
  weekKey: string;
  seed: string;
  dailyPoints: number;
  weeklyPoints: number;
  weeklyRank: number | null;
  nextRewardAt: number | null;
  missions: DailyMission[];
  streak: MissionStreak;
  rewards: CosmeticReward[];
}

export interface OfficialAttempt {
  id: string;
  dayKey: string;
  mode: GameModeType;
  slot: 1 | 2;
  seed: string;
  status: 'started' | 'completed';
}

export interface OfficialAnswer {
  questionId: string;
  answerCode: string | null;
}

export interface CompetitionUpdate {
  awardedPoints: number;
  newlyCompletedMissionIds: string[];
  overview: CompetitionOverview;
}
