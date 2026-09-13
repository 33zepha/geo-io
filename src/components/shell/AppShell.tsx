'use client';

import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../../types/geo';
import { loadPlayerStats, DEFAULT_STATS } from '../../lib/storage';
import { AuthProvider } from '../../lib/authContext';
import { AppHeader } from './AppHeader';
import { CartographicBackground } from './CartographicBackground';
import { ProfileModal } from '../profile/ProfileModal';
import { AuthModal } from '../auth/AuthModal';
import { GameHub } from '../game/GameHub';
import { MasteryMapScreen } from '../mastery/MasteryMapScreen';
import { LeaderboardScreen } from '../ranking/LeaderboardScreen';

const InnerAppShell: React.FC = () => {
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
      <main className="flex-1 min-h-0 w-full max-w-5xl mx-auto px-3 sm:px-5 py-2 sm:py-3 relative z-10 overflow-hidden flex flex-col items-center justify-center">
        {activeTab === 'quiz' ? (
          <GameHub 
            key={resetKey} 
            catchUpCodes={catchUpCodes}
            onClearCatchUp={() => setCatchUpCodes(null)}
          />
        ) : activeTab === 'mastery' ? (
          <MasteryMapScreen 
            stats={stats}
            onStartWeakPointsSession={handleStartWeakPoints}
          />
        ) : (
          <LeaderboardScreen 
            onStartGame={handleResetToHome}
          />
        )}
      </main>

      {/* Minimal Game Status Bar */}
      <footer className="w-full h-7 shrink-0 border-t border-clay-border/40 px-4 text-[11px] text-clay-subtle hidden sm:flex items-center justify-between bg-white/40 backdrop-blur-xs relative z-10">
        <span>Geo.io • Promotion L1 & Géographie française</span>
        <span>101 départements • Classement national & podium 3D</span>
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

      {/* Auth Modal (Email, Google, Apple, Guest) */}
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
