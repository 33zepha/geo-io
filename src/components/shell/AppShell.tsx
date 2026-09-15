'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlayerStats } from '../../types/geo';
import { loadPlayerStats, DEFAULT_STATS } from '../../lib/storage';
import { AuthProvider, useAuth } from '../../lib/authContext';
import { AppHeader } from './AppHeader';
import { CartographicBackground } from './CartographicBackground';
import { ProfileModal } from '../profile/ProfileModal';
import { AuthModal } from '../auth/AuthModal';
import { GameHub } from '../game/GameHub';
import { MasteryMapScreen } from '../mastery/MasteryMapScreen';
import { LeaderboardScreen } from '../ranking/LeaderboardScreen';
import { Crosshair, Map, Trophy } from 'lucide-react';
import { soundManager } from '../../lib/audio';

const InnerAppShell: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [activeTab, setActiveTab] = useState<'quiz' | 'mastery' | 'ranking'>('quiz');
  const [catchUpCodes, setCatchUpCodes] = useState<string[] | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isGamePlaying, setIsGamePlaying] = useState(false);

  useEffect(() => {
    setStats(loadPlayerStats());
  }, [isProfileOpen, activeTab, resetKey]);

  useEffect(() => {
    const onStatsUpdated = () => setStats(loadPlayerStats());
    window.addEventListener('geo_io_stats_updated', onStatsUpdated);
    return () => window.removeEventListener('geo_io_stats_updated', onStatsUpdated);
  }, []);

  const handleResetToHome = () => {
    setIsGamePlaying(false);
    setActiveTab('quiz');
    setCatchUpCodes(null);
    setResetKey((prev) => prev + 1);
    setStats(loadPlayerStats());
  };

  const handleStartWeakPoints = (codes: string[]) => {
    setCatchUpCodes(codes);
    setActiveTab('quiz');
    setResetKey((prev) => prev + 1);
  };

  // 1. Loading splash screen while verifying persistent session
  if (isLoading) {
    return (
      <div className="relative flex h-[100dvh] w-screen select-none flex-col items-center justify-center overflow-hidden bg-[#FAF7F2] font-sans text-[#2C2623] safe-bottom safe-x">
        <CartographicBackground />
        <div className="relative z-10 flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/70 border border-clay-border/60 backdrop-blur-md shadow-soft animate-panel-in">
          <div className="w-12 h-12 rounded-2xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta text-2xl font-bold animate-pulse">
            🏛️
          </div>
          <div className="font-display font-black text-clay text-base tracking-wide">
            Geo.io • Promotion L1
          </div>
          <div className="text-xs text-clay-muted font-medium">
            Vérification de la session étudiante...
          </div>
        </div>
      </div>
    );
  }

  // 2. Mandatory Authentication Gate : access is strictly reserved to verified students
  if (!isAuthenticated) {
    return (
      <div className="relative flex h-[100dvh] w-screen select-none flex-col items-center justify-center overflow-hidden bg-[#FAF7F2] font-sans text-[#2C2623] safe-bottom safe-x">
        <CartographicBackground />
        <AuthModal
          isOpen={true}
          isMandatoryGate={true}
          onClose={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] w-screen select-none flex-col overflow-hidden bg-[#FAF7F2] font-sans text-[#2C2623] selection:bg-honey-soft selection:text-clay safe-bottom safe-x">
      {/* Subtle Clean Ambient Background */}
      <CartographicBackground />

      {/* Header */}
      <AppHeader
        stats={stats}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setIsGamePlaying(false);
          setActiveTab(tab);
          if (tab === 'quiz') setCatchUpCodes(null);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onResetToHome={handleResetToHome}
        hideMobile={isGamePlaying}
      />

      {/* Main Game Arena */}
      <main className={`relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col items-stretch justify-start overflow-hidden px-3 pt-2.5 md:items-center md:justify-center md:px-5 md:py-4 ${isGamePlaying ? 'pb-2.5' : 'pb-[4.75rem] md:pb-4'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab === 'quiz' ? `quiz-${resetKey}` : activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full min-h-0 w-full flex-col"
          >
            {activeTab === 'quiz' ? (
              <GameHub
                catchUpCodes={catchUpCodes}
                onClearCatchUp={() => setCatchUpCodes(null)}
                onPlayingChange={setIsGamePlaying}
              />
            ) : activeTab === 'mastery' ? (
              <MasteryMapScreen
                stats={stats}
                onStartWeakPointsSession={handleStartWeakPoints}
              />
            ) : (
              <LeaderboardScreen />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isGamePlaying && (
        <nav className="safe-bottom safe-x fixed inset-x-0 bottom-0 z-40 border-t border-clay-border/80 bg-white/95 shadow-[0_-6px_24px_rgba(92,70,48,0.08)] backdrop-blur-md md:hidden" aria-label="Navigation principale">
          <div className="mx-auto grid h-16 max-w-md grid-cols-3 px-2">
            {([
              { id: 'quiz' as const, label: 'Jouer', icon: Crosshair, color: 'text-terracotta' },
              { id: 'mastery' as const, label: 'Maîtrise', icon: Map, color: 'text-sage-dark' },
              { id: 'ranking' as const, label: 'Classement', icon: Trophy, color: 'text-honey-dark' },
            ]).map(({ id, label, icon: Icon, color }) => {
              const selected = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => {
                    soundManager.playClick(440);
                    setActiveTab(id);
                    if (id === 'quiz') setCatchUpCodes(null);
                  }}
                  className={`touch-target flex flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition ${selected ? 'text-clay' : 'text-clay-muted'}`}
                >
                  <span className={`flex h-7 w-12 items-center justify-center rounded-full ${selected ? 'bg-creme-100' : ''}`}>
                    <Icon className={`h-4 w-4 ${color}`} strokeWidth={2.3} />
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Minimal Game Status Bar */}
      <footer className="relative z-10 hidden h-7 w-full shrink-0 items-center justify-between border-t border-clay-border/40 bg-white/40 px-4 text-[11px] text-clay-subtle backdrop-blur-sm md:flex">
        <span>Geo.io • Promotion L1 & Géographie française</span>
        <span>101 départements • Classement réel de la promo</span>
      </footer>

      {/* Profile Modal */}
      <ProfileModal
        stats={stats}
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          setStats(loadPlayerStats());
        }}
        onOpenAuth={() => {
          setIsProfileOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Auth Modal (email and password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export const AppShell: React.FC = () => {
  return (
    <AuthProvider>
      <InnerAppShell />
    </AuthProvider>
  );
};
