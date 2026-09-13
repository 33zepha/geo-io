'use client';

import React from 'react';
import { QuizConfig, QuizFormat, QuizTheme } from '../../types/quiz';
import { REGIONS } from '../../data/regions';
import { soundManager } from '../../lib/audio';
import { 
  Building2, 
  Hash, 
  Map, 
  Mountain, 
  GraduationCap, 
  Shuffle, 
  Zap, 
  Target, 
  Heart, 
  ArrowRight,
  Sun,
  Compass
} from 'lucide-react';

interface QuizConfigScreenProps {
  config: QuizConfig;
  onChangeConfig: (newConfig: QuizConfig) => void;
  onStartQuiz: () => void;
}

export const QuizConfigScreen: React.FC<QuizConfigScreenProps> = ({
  config,
  onChangeConfig,
  onStartQuiz,
}) => {
  const themes: {
    id: QuizTheme;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
    badgeColor: string;
  }[] = [
    {
      id: 'prefectures',
      title: 'Préfectures & Villes',
      description: 'Associe les chefs-lieux et grandes villes à leurs départements.',
      icon: <Building2 className="w-5 h-5 text-terracotta" />,
      badge: '101 Préfectures',
      badgeColor: 'bg-terracotta-light text-terracotta border-terracotta/20',
    },
    {
      id: 'departements',
      title: 'Numéros & Départements',
      description: 'Mémorise tous les codes géographiques officiels du 01 au 976.',
      icon: <Hash className="w-5 h-5 text-honey-dark" />,
      badge: '01 à 976',
      badgeColor: 'bg-honey-light text-honey-dark border-honey/20',
    },
    {
      id: 'regions',
      title: 'Régions & Rattachements',
      description: 'Connaître les 18 régions, leurs capitales et départements membres.',
      icon: <Map className="w-5 h-5 text-lagon" />,
      badge: '18 Régions',
      badgeColor: 'bg-lagon-light text-lagon border-lagon/20',
    },
    {
      id: 'reliefs_fleuves',
      title: 'Reliefs & Hydrographie',
      description: 'Les fleuves, confluences, massifs, vallées et points culminants.',
      icon: <Mountain className="w-5 h-5 text-sage" />,
      badge: 'Géographie Physique',
      badgeColor: 'bg-sage-light text-sage border-sage/20',
    },
    {
      id: 'licence_geo',
      title: 'Licence Géo & Territoires',
      description: 'Aménagement, géomorphologie, ZEE maritime et bassins d\'activités.',
      icon: <GraduationCap className="w-5 h-5 text-terracotta" />,
      badge: 'Niveau Universitaire',
      badgeColor: 'bg-terracotta-light text-terracotta border-terracotta/20',
    },
    {
      id: 'grand_mix',
      title: 'Grand Mix Hexagonal',
      description: 'Toutes les catégories combinées pour le grand tour de France.',
      icon: <Shuffle className="w-5 h-5 text-honey-dark" />,
      badge: 'Mix Complet',
      badgeColor: 'bg-honey-light text-honey-dark border-honey/20',
    },
  ];

  const formats: {
    id: QuizFormat;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'sprint_10',
      label: 'Sprint Express',
      sublabel: '10 questions rapides',
      icon: <Zap className="w-4 h-4 text-honey-dark" />,
    },
    {
      id: 'standard_20',
      label: 'Session Standard',
      sublabel: '20 questions complètes',
      icon: <Target className="w-4 h-4 text-lagon" />,
    },
    {
      id: 'survival_3_lives',
      label: 'Mode Survie',
      sublabel: '3 cœurs • Jusqu\'à l\'erreur',
      icon: <Heart className="w-4 h-4 text-coral" />,
    },
  ];

  const handleSelectTheme = (theme: QuizTheme) => {
    soundManager.playClick(440);
    onChangeConfig({ ...config, theme });
  };

  const handleSelectFormat = (format: QuizFormat) => {
    soundManager.playClick(480);
    onChangeConfig({ ...config, format });
  };

  const handleSelectRegion = (regionScope: string) => {
    soundManager.playClick(500);
    onChangeConfig({ ...config, regionScope });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Warm Sunny Hero Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-honey-light border border-honey/30 text-honey-dark text-xs font-display font-bold">
          <Sun className="w-4 h-4 text-honey fill-honey animate-spin" style={{ animationDuration: '12s' }} />
          <span>QUIZ GÉOGRAPHIQUE CONVIVIAL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-clay font-display tracking-tight">
          Prépare ton voyage géographique
        </h1>
        <p className="text-sm sm:text-base text-clay-muted max-w-xl mx-auto leading-relaxed">
          Choisis ta thématique favorite, cible ta région et lance ta partie pour devenir incollable sur l\'Hexagone et ses terroirs.
        </p>
      </div>

      {/* 1. Theme Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-display font-bold uppercase tracking-wider text-clay flex items-center gap-2">
            <span className="w-6 h-6 rounded-xl bg-terracotta text-white flex items-center justify-center text-xs font-mono font-bold">
              1
            </span>
            <span>Thématique au choix</span>
          </label>
          <span className="text-xs text-clay-subtle font-display font-medium">Sélectionne un mode</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {themes.map((t) => {
            const isSelected = config.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`p-4 rounded-3xl text-left border-2 transition-all duration-100 relative cursor-pointer btn-3d ${
                  isSelected
                    ? 'bg-white border-terracotta border-b-[5px] border-b-terracotta-dark shadow-md ring-2 ring-terracotta/20'
                    : 'bg-white/80 border-clay-border border-b-[4px] border-b-clay-darkborder hover:bg-white hover:border-clay-darkborder text-clay'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2.5 rounded-2xl bg-creme-100 border border-clay-border/80">
                    {t.icon}
                  </div>
                  <span className={`text-[11px] font-display font-bold px-2.5 py-0.5 rounded-lg border ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                </div>
                <div className="font-display font-bold text-base text-clay mb-1">{t.title}</div>
                <div className="text-xs text-clay-muted leading-snug">{t.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Scope & Format Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scope Selector */}
        <div className="space-y-3">
          <label className="text-xs font-display font-bold uppercase tracking-wider text-clay flex items-center gap-2">
            <span className="w-6 h-6 rounded-xl bg-terracotta text-white flex items-center justify-center text-xs font-mono font-bold">
              2
            </span>
            <span>Périmètre géographique</span>
          </label>
          <div className="bg-white border-2 border-clay-border border-b-[4px] border-b-clay-darkborder rounded-3xl p-4 space-y-2.5 shadow-soft">
            <select
              value={config.regionScope}
              onChange={(e) => handleSelectRegion(e.target.value)}
              className="w-full bg-creme-100 border-2 border-clay-border text-clay text-xs sm:text-sm font-semibold rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-terracotta transition cursor-pointer"
            >
              <option value="all">🇫🇷 France entière (101 départements & 18 régions)</option>
              {Object.values(REGIONS).map((r) => (
                <option key={r.code} value={r.code}>
                  📍 Région : {r.name} ({r.departments.length} dép.)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-clay-muted leading-relaxed px-1">
              {config.regionScope === 'all'
                ? 'Couvre l\'ensemble des territoires métropolitains et d\'outre-mer.'
                : `Entraînement focalisé sur la région ${REGIONS[config.regionScope]?.name}.`}
            </p>
          </div>
        </div>

        {/* Format Selector */}
        <div className="space-y-3">
          <label className="text-xs font-display font-bold uppercase tracking-wider text-clay flex items-center gap-2">
            <span className="w-6 h-6 rounded-xl bg-terracotta text-white flex items-center justify-center text-xs font-mono font-bold">
              3
            </span>
            <span>Format de jeu</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {formats.map((f) => {
              const isSelected = config.format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleSelectFormat(f.id)}
                  className={`p-3 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer btn-3d ${
                    isSelected
                      ? 'bg-white border-terracotta border-b-[5px] border-b-terracotta-dark shadow-sm ring-2 ring-terracotta/20 text-clay'
                      : 'bg-white/80 border-clay-border border-b-[4px] border-b-clay-darkborder hover:bg-white text-clay-muted'
                  }`}
                >
                  <div className="p-1 rounded-lg">{f.icon}</div>
                  <div className="text-xs font-display font-bold text-clay leading-tight">{f.label}</div>
                  <div className="text-[10px] text-clay-subtle font-medium">{f.sublabel}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            soundManager.playClick(520);
            onStartQuiz();
          }}
          className="w-full py-4.5 rounded-3xl bg-terracotta hover:bg-terracotta-hover border-b-[5px] border-b-terracotta-dark active:translate-y-[2px] active:border-b-2 text-white font-display font-extrabold text-lg shadow-lg shadow-terracotta/20 transition-all cursor-pointer flex items-center justify-center gap-3 btn-3d"
        >
          <span>Lancer l\'Expédition</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
