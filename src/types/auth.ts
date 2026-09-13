export interface UserProfile {
  id: string;
  email?: string;
  pseudo: string;
  avatarId: string;
  favoriteDept?: string; // e.g. '29', '75', '69'
  university?: string;   // e.g. 'Paris 1 Panthéon-Sorbonne'
  level: number;
  xp: number;
  streak: number;
  masteredDeptsCount: number;
  accuracy: number;
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AvatarItem {
  id: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  accentColor: string;
  bgGradient: string;
}
