export type GeoCategory = 
  | 'physique' 
  | 'amenagement' 
  | 'economique' 
  | 'urbaine' 
  | 'littoral_drom' 
  | 'geopolitique';

export type AcademicLevel = 'Licence 1' | 'Licence 2' | 'Licence 3 / Concours';

export interface Department {
  code: string;
  name: string;
  prefecture: string;
  subPrefectures: string[];
  regionCode: string;
  regionName: string;
  population: number;
  density: number; // hab/km²
  area: number; // km²
  relief: string;
  hydrography: string[];
  specialties: string[];
  academicFact: string; // Fait marquant niveau universitaire
}

export interface Region {
  code: string;
  name: string;
  prefecture: string;
  departments: string[];
  description: string;
  color: string;
}

export interface LicenceQuestion {
  id: string;
  category: GeoCategory;
  difficulty: AcademicLevel;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  keyConcept: string;
  relatedDepartmentCodes?: string[];
  relatedRegion?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PlayerStats {
  xp: number;
  level: number;
  rankTitle: string;
  streak: number;
  lastPlayedDate: string;
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  highScorePointage: number;
  highScoreMaster: number;
  highScoreSilhouette: number;
  unlockedBadges: string[];
  departmentStats: Record<string, { correct: number; attempts: number }>;
}

export type ActiveGameTab = 
  | 'pointage_eclair' 
  | 'master_licence' 
  | 'silhouette' 
  | 'atlas' 
  | 'arene_compet';
