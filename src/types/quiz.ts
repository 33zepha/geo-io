export type QuizTheme = 
  | 'prefectures' 
  | 'departements' 
  | 'regions' 
  | 'reliefs_fleuves' 
  | 'licence_geo' 
  | 'grand_mix';

export type QuizFormat = 'sprint_10' | 'standard_20' | 'survival_3_lives';

export interface QuizConfig {
  theme: QuizTheme;
  regionScope: string; // 'all' or regionCode e.g. '84', '53', etc.
  format: QuizFormat;
}

export interface QuizQuestion {
  id: string;
  theme: QuizTheme;
  title: string;
  subtitle?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  targetDepartmentCode?: string;
  relatedDepartmentCodes?: string[];
  contextTag: string; // e.g. "Préfecture", "Numéro", "Relief"
}

export interface AnswerRecord {
  question: QuizQuestion;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface QuizSessionSummary {
  config: QuizConfig;
  totalQuestions: number;
  correctAnswers: number;
  accuracyPercent: number;
  maxStreak: number;
  score: number;
  grade: string;
  records: AnswerRecord[];
  completedAt: string;
}
