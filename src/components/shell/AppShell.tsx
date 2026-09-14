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

const InnerAppShell: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<PlayerStats>(DEFAULT_STATS);
  const [activeTab, setActiveTab] = useState<'quiz' | 'mastery' | 'ranking'>('quiz');
  const [catchUpCodes, setCatchUpCodes] = useState<string[] | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    setStats(loadPlayerStats());
  }, [isProfileOpen, activeTab, resetKey]);

  const handleResetToHome = () => {
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
      <div className="h-screen h-[100dvh] w-screen overflow-hidden bg-[#FAF7F2] text-[#2C2623] flex flex-col items-center justify-center font-sans relative select-none">
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
      <div className="h-screen h-[100dvh] w-screen overflow-hidden bg-[#FAF7F2] text-[#2C2623] flex flex-col items-center justify-center font-sans relative select-none">
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
    <div className="h-screen h-[100dvh] max-h-screen w-screen overflow-hidden bg-[#FAF7F2] text-[#2C2623] flex flex-col selection:bg-honey-soft selection:text-clay font-sans relative select-none">
      {/* Subtle Clean Ambient Background */}
      <CartographicBackground />

      {/* Header */}
      <AppHeader
        stats={stats}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'quiz') setCatchUpCodes(null);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onResetToHome={handleResetToHome}
      />

      {/* Main Game Arena */}
      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-center overflow-hidden px-3 py-2 sm:px-5 sm:py-3">
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

      {/* Minimal Game Status Bar */}
      <footer className="w-full h-7 shrink-0 border-t border-clay-border/40 px-4 text-[11px] text-clay-subtle hidden sm:flex items-center justify-between bg-white/40 backdrop-blur-sm relative z-10">
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
