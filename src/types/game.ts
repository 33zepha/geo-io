export type GameModeType = 'clic_carte' | 'qcm' | 'enquete_logique' | 'silhouette';

export type GameDifficulty = 'debutant' | 'intermediaire' | 'expert';

export type GameSubject = 'tous' | 'departements' | 'regions' | 'villes_prefectures';

export interface GameSettings {
  mode: GameModeType;
  difficulty: GameDifficulty;
  subject?: GameSubject;
  questionCount: number;
  regionCode?: string;
}

export interface MapClickTarget {
  id: string;
  code: string; // department code or region code
  name: string;
  prefecture?: string;
  regionName?: string;
  prompt: string;
  subPrompt?: string;
  hint?: string;
}

export interface QcmQuestion {
  id: string;
  title: string;
  subtitle?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  targetCode: string;
  relatedCodes?: string[];
  contextTag?: string;
}

export interface EnqueteClue {
  label: string;
  text: string;
  category: 'physique' | 'amenagement' | 'urbain' | 'terroir';
}

export interface EnqueteTerritoire {
  id: string;
  targetCode: string;
  targetName: string;
  regionName: string;
  prefecture: string;
  clues: EnqueteClue[];
  explanation: string;
}

export interface RoundResult {
  title: string;
  targetName: string;
  targetCode: string;
  isCorrect: boolean;
  scoreEarned: number;
  explanation?: string;
  userAnswer?: string;
}

export interface GameSessionSummary {
  mode: GameModeType;
  subject?: GameSubject;
  totalRounds: number;
  correctCount: number;
  accuracyPercent: number;
  totalScore: number;
  grade: string;
  results: RoundResult[];
}
