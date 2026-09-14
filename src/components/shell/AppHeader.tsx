'use client';

import React, { useEffect, useState } from 'react';
import { PlayerStats } from '../../types/geo';
import { soundManager } from '../../lib/audio';
import { getRankForXp } from '../../lib/storage';
import { useAuth } from '../../lib/authContext';
import { getAvatarById } from '../../data/avatars';
import { Crosshair, Flame, Map, Trophy, User, Volume2, VolumeX } from 'lucide-react';

interface AppHeaderProps {
  stats: PlayerStats;
  activeTab: 'quiz' | 'mastery' | 'ranking';
  onTabChange: (tab: 'quiz' | 'mastery' | 'ranking') => void;
  onOpenProfile: () => void;
  onResetToHome: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  stats,
  activeTab,
  onTabChange,
  onOpenProfile,
  onResetToHome,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { user } = useAuth();
  const rankInfo = getRankForXp(stats.xp);
  const userAvatar = user ? getAvatarById(user.avatarId) : null;

  const masteredCount = Object.values(stats.departmentStats || {}).filter(
    (s) => s.attempts >= 2 && s.correct / s.attempts >= 0.7
  ).length;

  useEffect(() => {
    setSoundEnabled(soundManager.isEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    soundManager.setEnabled(next);
    setSoundEnabled(next);
    if (next) soundManager.playClick(440);
  };

  return (
    <header className="safe-top sticky top-0 z-40 w-full shrink-0 border-b border-clay-border/70 bg-white/95 shadow-[0_4px_18px_rgba(92,70,48,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-1.5 px-2 sm:h-[3.75rem] sm:px-5">
        {/* Brand & Logo */}
        <button
          onClick={() => {
            soundManager.playClick(400);
            onResetToHome();
          }}
          className="group flex shrink-0 items-center rounded-lg px-1 py-1 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-terracotta/40"
          title="Retour à l'accueil"
          aria-label="Geo.io — retour à l'accueil"
        >
          <div>
            <span className="font-display text-lg font-extrabold tracking-[-0.04em] text-clay transition-colors group-hover:text-terracotta-dark sm:text-xl">
              Geo<span className="text-terracotta">.io</span>
            </span>
            <span className="hidden text-[8px] font-bold uppercase tracking-[0.16em] text-clay-subtle md:block">
              Géographie
            </span>
          </div>
        </button>

        {/* Center Navigation Tabs */}
        <nav
          className="flex min-w-0 items-center gap-0.5 rounded-2xl border border-clay-border/80 bg-creme-100/90 p-1 text-xs font-semibold shadow-inner"
          aria-label="Navigation principale"
        >
          <button
            onClick={() => {
              soundManager.playClick(440);
              onTabChange('quiz');
            }}
            aria-current={activeTab === 'quiz' ? 'page' : undefined}
            aria-label="Quiz et défis"
            title="Quiz et défis"
            className={`pressable relative flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl px-2 outline-none transition-all duration-200 md:px-3.5 ${
              activeTab === 'quiz'
                ? 'bg-white font-bold text-clay shadow-xs ring-1 ring-clay-border/60'
                : 'text-clay-muted hover:bg-white/60 hover:text-clay focus-visible:ring-2 focus-visible:ring-terracotta/30'
            }`}
          >
            <Crosshair className="h-4 w-4 shrink-0 text-terracotta" strokeWidth={2.2} />
            <span className="hidden md:inline">Quiz & Défis</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick(460);
              onTabChange('mastery');
            }}
            aria-current={activeTab === 'mastery' ? 'page' : undefined}
            aria-label="Carte de maîtrise"
            title="Carte de maîtrise"
            className={`pressable relative flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl px-2 outline-none transition-all duration-200 md:px-3.5 ${
              activeTab === 'mastery'
                ? 'bg-white font-bold text-clay shadow-xs ring-1 ring-clay-border/60'
                : 'text-clay-muted hover:bg-white/60 hover:text-clay focus-visible:ring-2 focus-visible:ring-sage/30'
            }`}
          >
            <Map className="h-4 w-4 shrink-0 text-sage-dark" strokeWidth={2.2} />
            <span className="hidden md:inline">Carte de maîtrise</span>
            {masteredCount > 0 && (
              <span className="hidden rounded-full bg-sage-light px-1.5 py-0.5 text-[9px] font-extrabold text-sage-dark lg:inline">
                {masteredCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundManager.playClick(470);
              onTabChange('ranking');
            }}
            aria-current={activeTab === 'ranking' ? 'page' : undefined}
            aria-label="Classement de la promotion"
            title="Classement de la promotion"
            className={`pressable relative flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl px-2 outline-none transition-all duration-200 md:px-3.5 ${
              activeTab === 'ranking'
                ? 'bg-white font-bold text-clay shadow-xs ring-1 ring-clay-border/60'
                : 'text-clay-muted hover:bg-white/60 hover:text-clay focus-visible:ring-2 focus-visible:ring-honey/30'
            }`}
          >
            <Trophy className="h-4 w-4 shrink-0 text-honey-dark" strokeWidth={2.2} />
            <span className="hidden md:inline">Classement L1</span>
          </button>
        </nav>

        {/* Right Section: Streak, Level, Sound & Profile */}
        <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium">
          {/* Daily Streak */}
          <div
            className="hidden h-10 items-center gap-1.5 rounded-xl border border-honey/25 bg-honey-light px-2.5 font-bold text-honey-dark lg:flex"
            title={`${stats.streak} jour(s) de suite`}
          >
            <Flame className="h-4 w-4 fill-honey text-honey" />
            <span>{stats.streak} j</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="pressable flex h-10 w-10 items-center justify-center rounded-xl border border-clay-border bg-white text-clay-muted outline-none transition hover:border-clay-darkborder hover:bg-creme-100 hover:text-clay focus-visible:ring-2 focus-visible:ring-terracotta/30"
            title={soundEnabled ? 'Couper le son' : 'Activer le son'}
            aria-label={soundEnabled ? 'Couper le son' : 'Activer le son'}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-clay" strokeWidth={2.1} />
            ) : (
              <VolumeX className="h-4 w-4 text-clay-subtle" strokeWidth={2.1} />
            )}
          </button>

          {/* Profile & Avatar Trigger */}
          <button
            onClick={() => {
              soundManager.playClick(500);
              onOpenProfile();
            }}
            className="pressable flex h-10 items-center gap-2 rounded-xl border border-clay-border bg-white px-2 text-clay outline-none transition hover:border-terracotta/30 hover:bg-terracotta-light focus-visible:ring-2 focus-visible:ring-terracotta/30 sm:px-2.5"
            title="Mon profil et promotion"
            aria-label="Ouvrir mon profil"
          >
            {userAvatar ? (
              <span className="text-lg leading-none" aria-hidden="true">{userAvatar.emoji}</span>
            ) : (
              <User className="h-4 w-4 text-clay-muted" />
            )}

            <div className="hidden min-w-0 max-w-[100px] flex-col text-left leading-tight lg:flex">
              <span className="truncate font-display text-xs font-extrabold text-clay">
                {user?.pseudo || 'Mon Profil'}
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wide text-terracotta">
                Nv. {rankInfo.level}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Subtle Level Progress Line */}
      <div
        className="h-[2px] w-full overflow-hidden bg-clay-border/35"
        title={`Progression vers le niveau ${rankInfo.level + 1} : ${rankInfo.progressPercent}%`}
      >
        <div
          className="h-full bg-terracotta transition-[width] duration-500 ease-soft"
          style={{ width: `${rankInfo.progressPercent}%` }}
        />
      </div>
    </header>
  );
};
