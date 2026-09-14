import type { GameModeType, MapClickTarget, QcmQuestion, EnqueteTerritoire } from '../types/game';
import type { SilhouetteRound } from './modesEngine';
import {
  createSeededRandom,
  generateEnquetes,
  generateMapClickTargets,
  generateQcmQuestions,
  generateSilhouetteRounds,
} from './modesEngine';

export type OfficialChallengeItems =
  | { mode: 'clic_carte'; items: MapClickTarget[] }
  | { mode: 'qcm'; items: QcmQuestion[] }
  | { mode: 'silhouette'; items: SilhouetteRound[] }
  | { mode: 'enquete_logique'; items: EnqueteTerritoire[] };

export function officialSeed(dayKey: string, slot: 1 | 2, mode: GameModeType) {
  return `${dayKey}:${slot}:${mode}:v1`;
}

export function buildOfficialChallenge(
  dayKey: string,
  slot: 1 | 2,
  mode: GameModeType
): OfficialChallengeItems {
  const random = createSeededRandom(officialSeed(dayKey, slot, mode));
  if (mode === 'clic_carte') {
    return { mode, items: generateMapClickTargets('intermediaire', 5, undefined, random) };
  }
  if (mode === 'qcm') {
    return { mode, items: generateQcmQuestions('intermediaire', 5, undefined, random) };
  }
  if (mode === 'silhouette') {
    return { mode, items: generateSilhouetteRounds(5, undefined, 'intermediaire', random) };
  }
  return { mode, items: generateEnquetes(5, 'intermediaire', undefined, random) };
}

export function officialAnswerKey(dayKey: string, slot: 1 | 2, mode: GameModeType) {
  const challenge = buildOfficialChallenge(dayKey, slot, mode);
  if (challenge.mode === 'clic_carte') {
    return new Map(challenge.items.map((item) => [item.id, item.code]));
  }
  if (challenge.mode === 'qcm') {
    return new Map(challenge.items.map((item) => [item.id, item.options[item.correctIndex]]));
  }
  if (challenge.mode === 'silhouette') {
    return new Map(
      challenge.items.map((item, index) => [`silhouette-${item.targetDept.code}-${index}`, item.targetDept.code])
    );
  }
  return new Map(challenge.items.map((item) => [item.id, item.targetCode]));
}
