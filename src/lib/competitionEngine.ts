import type { DailyMission, CosmeticReward } from '../types/competition';
import type { GameModeType } from '../types/game';

const MODES: GameModeType[] = ['clic_carte', 'qcm', 'silhouette', 'enquete_logique'];

function parisParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function getParisCompetitionKeys(date = new Date()) {
  const parts = parisParts(date);
  const dayKey = `${parts.year}-${parts.month}-${parts.day}`;
  const noonUtc = new Date(`${dayKey}T12:00:00Z`);
  const weekdayLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
  }).format(noonUtc);
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekdayLabel);
  const offset = weekday === 0 ? 6 : weekday - 1;
  noonUtc.setUTCDate(noonUtc.getUTCDate() - offset);
  const monday = parisParts(noonUtc);
  return {
    dayKey,
    weekKey: `${monday.year}-${monday.month}-${monday.day}`,
  };
}

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = Math.imul(31, result) + value.charCodeAt(index) | 0;
  }
  return Math.abs(result);
}

export function getDailyModes(dayKey: string): [GameModeType, GameModeType] {
  const first = hash(dayKey) % MODES.length;
  return [MODES[first], MODES[(first + 1 + (hash(`${dayKey}:pair`) % 3)) % MODES.length]];
}

export function buildDailyMissions(dayKey: string, completedIds: string[] = []): DailyMission[] {
  const [firstMode, secondMode] = getDailyModes(dayKey);
  const completed = new Set(completedIds);
  const definitions: Omit<DailyMission, 'completed'>[] = [
    {
      id: `${dayKey}:participation`,
      kind: 'participation',
      title: 'Échauffement officiel',
      description: 'Termine les 5 questions de la première sélection.',
      points: 20,
      mode: firstMode,
      slot: 1,
    },
    {
      id: `${dayKey}:precision`,
      kind: 'precision',
      title: 'Objectif 80 %',
      description: 'Atteins au moins 4 bonnes réponses sur 5.',
      points: 35,
      mode: firstMode,
      slot: 1,
    },
    {
      id: `${dayKey}:variety`,
      kind: 'variety',
      title: 'Double spécialité',
      description: 'Atteins 80 % dans la seconde sélection du jour.',
      points: 45,
      mode: secondMode,
      slot: 2,
    },
  ];
  return definitions.map((mission) => ({ ...mission, completed: completed.has(mission.id) }));
}

export function missionAwards(dayKey: string, slot: 1 | 2, correct: number, total: number) {
  if (total !== 5 || correct < 0 || correct > total) return [];
  const accuracy = correct / total;
  if (slot === 1) {
    return [
      `${dayKey}:participation`,
      ...(accuracy >= 0.8 ? [`${dayKey}:precision`] : []),
    ];
  }
  return accuracy >= 0.8 ? [`${dayKey}:variety`] : [];
}

export const WEEKLY_REWARD_LEVELS = [200, 400, 600] as const;

export function buildRewards(points: number): CosmeticReward[] {
  return [
    { id: 'weekly-badge', kind: 'badge', label: 'Explorateur de la semaine', unlocked: points >= 200 },
    { id: 'weekly-title', kind: 'title', label: 'Cartographe régulier', unlocked: points >= 400 },
    { id: 'weekly-frame', kind: 'frame', label: 'Cadre Grand Tour', unlocked: points >= 600 },
  ];
}

export function nextRewardAt(points: number) {
  return WEEKLY_REWARD_LEVELS.find((threshold) => points < threshold) ?? null;
}
