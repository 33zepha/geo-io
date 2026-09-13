'use client';

import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../../types/geo';
import { soundManager } from '../../lib/audio';
import { getRankForXp } from '../../lib/storage';
import { useAuth } from '../../lib/authContext';
import { getAvatarById } from '../../data/avatars';
import { Compass, Flame, Volume2, VolumeX, User, Map, Trophy, MapPin } from 'lucide-react';

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
    const onProfileUpdate = () => {
      // Re-trigger re-render
    };
    window.addEventListener('geo_io_profile_updated', onProfileUpdate);
    return () => window.removeEventListener('geo_io_profile_updated', onProfileUpdate);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    soundManager.setEnabled(next);
    setSoundEnabled(next);
    if (next) soundManager.playClick(440);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-clay-border/70 bg-white/90 backdrop-blur-md shrink-0">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 h-14 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand & Logo */}
        <button
          onClick={() => {
            soundManager.playClick(400);
            onResetToHome();
          }}
          className="flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta group-hover:bg-terracotta group-hover:text-white transition-colors duration-150">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-clay">
              Geo<span className="text-terracotta">.io</span>
            </span>
          </div>
        </button>

        {/* Center Navigation Tabs */}
        <div className="flex items-center p-0.5 sm:p-1 bg-creme-100/90 rounded-xl border border-clay-border/80 text-xs font-semibold">
          <button
            onClick={() => {
              soundManager.playClick(440);
              onTabChange('quiz');
            }}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-white text-clay shadow-xs font-bold border border-clay-border/40'
                : 'text-clay-muted hover:text-clay'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-terracotta shrink-0" />
            <span className="hidden sm:inline">Quiz & Défis</span>
            <span className="sm:hidden text-[11px]">Quiz</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick(460);
              onTabChange('mastery');
            }}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'mastery'
                ? 'bg-white text-clay shadow-xs font-bold border border-clay-border/40'
                : 'text-clay-muted hover:text-clay'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-sage-dark shrink-0" />
            <span className="hidden sm:inline">Carte de Maîtrise</span>
            <span className="sm:hidden text-[11px]">Carte</span>
            {masteredCount > 0 && (
              <span className="ml-0.5 text-[10px] px-1 py-0.2 rounded-full bg-sage-light text-sage-dark font-bold hidden xs:inline">
                {masteredCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundManager.playClick(470);
              onTabChange('ranking');
            }}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'ranking'
                ? 'bg-white text-clay shadow-xs font-bold border border-clay-border/40'
                : 'text-clay-muted hover:text-clay'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">Classement L1</span>
            <span className="sm:hidden text-[11px]">Podium</span>
          </button>
        </div>

        {/* Right Section: Streak, Level, Sound & Profile */}
        <div className="flex items-center gap-1 sm:gap-2 text-xs font-medium shrink-0">
          {/* Daily Streak */}
          <div
            className="hidden xs:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-honey-light border border-honey/30 text-honey-dark font-bold cursor-default"
            title={`${stats.streak} jour(s) de suite`}
          >
            <Flame className="w-3.5 h-3.5 fill-honey text-honey" />
            <span className="text-[11px] sm:text-xs">{stats.streak} j</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-white hover:bg-creme-100 border border-clay-border text-clay-muted hover:text-clay transition cursor-pointer"
            title={soundEnabled ? 'Couper le son' : 'Activer le son'}
            aria-label={soundEnabled ? 'Couper le son' : 'Activer le son'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-clay" />
            ) : (
              <VolumeX className="w-4 h-4 text-clay-subtle" />
            )}
          </button>

          {/* Profile & Avatar Trigger */}
          <button
            onClick={() => {
              soundManager.playClick(500);
              onOpenProfile();
            }}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white hover:bg-creme-100 border border-clay-border text-clay transition cursor-pointer shadow-2xs"
            title="Mon profil et promotion"
          >
            {userAvatar ? (
              <span className="text-base sm:text-lg">{userAvatar.emoji}</span>
            ) : (
              <User className="w-4 h-4 text-clay-muted" />
            )}

            <div className="hidden sm:flex flex-col text-left leading-tight min-w-0 max-w-[100px]">
              <span className="font-display font-extrabold text-clay text-xs truncate">
                {user?.pseudo || 'Mon Profil'}
              </span>
              <span className="text-[10px] text-terracotta font-mono font-bold">
                Nv. {rankInfo.level}
              </span>
            </div>

            {user?.favoriteDept && (
              <span className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono font-bold text-[10px] border border-amber-300">
                {user.favoriteDept}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Subtle Level Progress Line */}
      <div 
        className="w-full h-[2px] bg-clay-border/40 overflow-hidden"
        title={`Progression vers le niveau ${rankInfo.level + 1} : ${rankInfo.progressPercent}%`}
      >
        <div
          className="h-full bg-terracotta transition-all duration-500 ease-out"
          style={{ width: `${rankInfo.progressPercent}%` }}
        />
      </div>
    </header>
  );
};
