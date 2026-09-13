'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../lib/authContext';
import { getLeaderboardEntries } from '../../lib/rankingService';
import { RankingCategory, RankingPeriod } from '../../types/ranking';
import { PodiumShowcase } from './PodiumShowcase';
import { getAvatarById } from '../../data/avatars';
import { soundManager } from '../../lib/audio';
import { Trophy, Calendar, Search, MapPin, Sparkles, ArrowRight, Compass } from 'lucide-react';

interface LeaderboardScreenProps {
  onStartGame?: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onStartGame }) => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<RankingPeriod>('all_time');
  const [category, setCategory] = useState<RankingCategory>('composite');
  const [search, setSearch] = useState('');

  const { top3, rest, userEntry } = useMemo(() => {
    return getLeaderboardEntries(user, period, category, search);
  }, [user, period, category, search]);

  const userAvatar = user ? getAvatarById(user.avatarId) : null;

  return (
    <div className="w-full h-full max-h-full flex flex-col justify-between overflow-hidden relative select-none">
      {/* Top Header & Tactical Filter Bar */}
      <div className="shrink-0 space-y-2.5 pb-2 border-b border-clay-border/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-terracotta mb-0.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Classement Général des Étudiants • Promo L1</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-clay font-display tracking-tight">
              Arène d'Excellence & Panthéon de Géographie
            </h1>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-clay-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher un étudiant ou une fac..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-clay-border text-xs font-medium text-clay placeholder:text-clay-subtle focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>
        </div>

        {/* Filters bar: Period + Category */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Period Toggle */}
          <div className="flex p-1 bg-creme-100 rounded-xl border border-clay-border text-xs font-bold">
            <button
              onClick={() => {
                soundManager.playClick(420);
                setPeriod('all_time');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                period === 'all_time'
                  ? 'bg-white text-clay shadow-xs border border-clay-border/40 font-extrabold'
                  : 'text-clay-muted hover:text-clay'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Général (All-Time)</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick(440);
                setPeriod('weekly');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                period === 'weekly'
                  ? 'bg-white text-clay shadow-xs border border-clay-border/40 font-extrabold'
                  : 'text-clay-muted hover:text-clay'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-terracotta" />
              <span>Cette Semaine</span>
            </button>
          </div>

          {/* Category Toggle */}
          <div className="flex p-1 bg-creme-100 rounded-xl border border-clay-border text-xs font-bold">
            <button
              onClick={() => {
                soundManager.playClick(420);
                setCategory('composite');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                category === 'composite'
                  ? 'bg-white text-clay shadow-xs border border-clay-border/40'
                  : 'text-clay-muted hover:text-clay'
              }`}
            >
              ⭐ Score d'Excellence
            </button>
            <button
              onClick={() => {
                soundManager.playClick(440);
                setCategory('pointage');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                category === 'pointage'
                  ? 'bg-white text-clay shadow-xs border border-clay-border/40'
                  : 'text-clay-muted hover:text-clay'
              }`}
            >
              ⚡ Vitesse
            </button>
            <button
              onClick={() => {
                soundManager.playClick(460);
                setCategory('mastery');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                category === 'mastery'
                  ? 'bg-white text-clay shadow-xs border border-clay-border/40'
                  : 'text-clay-muted hover:text-clay'
              }`}
            >
              🗺️ 101 Départements
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Body: Podium + Ranks 4+ Table */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 my-2">
        {/* 3D Olympic Podium */}
        <PodiumShowcase top3={top3} />

        {/* Table of Ranks 4 to N */}
        {rest.length > 0 && (
          <div className="bg-white rounded-2xl border border-clay-border/80 shadow-xs overflow-hidden">
            <div className="px-4 py-2 bg-creme-100/80 border-b border-clay-border/60 grid grid-cols-12 text-[10px] font-display font-bold uppercase tracking-wider text-clay-muted">
              <div className="col-span-1 text-center">Rang</div>
              <div className="col-span-6 sm:col-span-5">Étudiant & Université</div>
              <div className="hidden sm:block sm:col-span-3 text-center">Maîtrise & Précision</div>
              <div className="col-span-5 sm:col-span-3 text-right">Score</div>
            </div>

            <div className="divide-y divide-clay-border/40">
              {rest.map((entry) => {
                const avatar = getAvatarById(entry.user.avatarId);
                const isCurrent = user?.id === entry.user.id;

                return (
                  <div
                    key={entry.user.id}
                    className={`px-4 py-2.5 grid grid-cols-12 items-center text-xs transition ${
                      isCurrent
                        ? 'bg-amber-50/70 font-bold'
                        : 'hover:bg-creme-50'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 text-center font-display font-extrabold text-clay-muted">
                      #{entry.rank}
                    </div>

                    {/* Student Pseudo & University */}
                    <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-creme-200 border border-clay-border flex items-center justify-center text-lg shrink-0">
                        {avatar.emoji}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-display font-bold text-clay truncate">
                            {entry.user.pseudo}
                          </span>
                          {entry.user.favoriteDept && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-creme-200 text-clay-muted text-[10px] font-mono font-bold shrink-0">
                              <MapPin className="w-2.5 h-2.5 text-terracotta" />
                              {entry.user.favoriteDept}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold uppercase shrink-0">
                              Vous
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-clay-muted truncate font-medium">
                          {entry.user.university || 'Université'}
                        </div>
                      </div>
                    </div>

                    {/* Mastery & Accuracy (desktop) */}
                    <div className="hidden sm:block sm:col-span-3 text-center">
                      <div className="font-display font-bold text-clay">
                        {entry.masteredCount} / 101 acquis
                      </div>
                      <div className="text-[10px] text-clay-muted">
                        {entry.accuracy}% précision
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-5 sm:col-span-3 text-right">
                      <div className="font-display font-extrabold text-clay text-sm">
                        {category === 'pointage'
                          ? entry.pointageHighScore.toLocaleString('fr-FR')
                          : category === 'mastery'
                          ? `${entry.masteredCount} / 101`
                          : entry.excellenceScore.toLocaleString('fr-FR')}
                      </div>
                      <div className="text-[10px] text-clay-muted font-medium">
                        {category === 'composite' ? "pts d'excellence" : 'pts'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar: Player's Standing & Fast Action */}
      {userEntry && (
        <div className="shrink-0 pt-2 border-t border-clay-border/70">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-creme-100 border border-amber-200 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {userAvatar && (
                <div className="w-10 h-10 rounded-xl bg-white border border-amber-300 flex items-center justify-center text-xl shrink-0 shadow-xs">
                  {userAvatar.emoji}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-clay text-sm truncate">
                    {userEntry.user.pseudo}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-display font-extrabold text-xs">
                    Rang #{userEntry.rank}
                  </span>
                </div>
                <div className="text-[11px] text-clay-muted font-medium truncate">
                  {userEntry.excellenceScore.toLocaleString('fr-FR')} pts • {userEntry.masteredCount}/101 départements acquis
                </div>
              </div>
            </div>

            {onStartGame && (
              <button
                onClick={() => {
                  soundManager.playClick(480);
                  onStartGame();
                }}
                className="px-3.5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-display font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Grimper au classement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
