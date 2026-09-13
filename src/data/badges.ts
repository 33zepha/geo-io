import { Badge } from '../types/geo';

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'Premier Pas d\'Arpenteur',
    description: 'Termine ta toute première session de jeu.',
    icon: '🧭',
    rarity: 'common',
  },
  {
    id: 'sharp_shooter',
    title: 'Viseur Géodésique',
    description: 'Réalise un sans-faute de 5 départements d\'affilée en mode Pointage Éclair.',
    icon: '🎯',
    rarity: 'rare',
  },
  {
    id: 'academic_laureate',
    title: 'Lauréat de Licence Géo',
    description: 'Obtiens 100% de bonnes réponses sur une série de Master Licence.',
    icon: '🎓',
    rarity: 'epic',
  },
  {
    id: 'streak_3d',
    title: 'Gardien du Méridien',
    description: 'Maintiens une série active de 3 jours d\'apprentissage.',
    icon: '🔥',
    rarity: 'rare',
  },
  {
    id: 'drom_conqueror',
    title: 'Amiral des Cinq Océans',
    description: 'Identifie avec succès l\'ensemble des 5 DROM.',
    icon: '🌊',
    rarity: 'rare',
  },
  {
    id: 'silhouette_oracle',
    title: 'Oracle des Silhouettes',
    description: 'Trouve 5 formes isolées sans jamais utiliser d\'indice.',
    icon: '👁️',
    rarity: 'epic',
  },
  {
    id: 'ign_director',
    title: 'Agrégé du Territoire',
    description: 'Atteins le rang suprême du jeu (Niveau 10+).',
    icon: '👑',
    rarity: 'legendary',
  },
];
