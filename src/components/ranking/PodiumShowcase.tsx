'use client';

import React from 'react';
import { LeaderboardEntry } from '../../types/ranking';
import { getAvatarById } from '../../data/avatars';
import { Crown, Sparkles, MapPin } from 'lucide-react';

interface PodiumShowcaseProps {
  top3: LeaderboardEntry[];
}

export const PodiumShowcase: React.FC<PodiumShowcaseProps> = ({ top3 }) => {
  if (top3.length === 0) return null;

  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const firstAvatar = first ? getAvatarById(first.user.avatarId) : null;
  const secondAvatar = second ? getAvatarById(second.user.avatarId) : null;
  const thirdAvatar = third ? getAvatarById(third.user.avatarId) : null;

  return (
    <div className="relative w-full max-w-2xl mx-auto py-2 px-3 sm:px-6 select-none">
      {/* Ambient podium background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-36 bg-honey/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-end justify-center gap-2 sm:gap-4 relative z-10">
        {/* 2nd Place: Silver (Left) */}
        {second && secondAvatar && (
          <div className="flex-1 max-w-[170px] flex flex-col items-center group">
            {/* Player Info Above Pillar */}
            <div className="flex flex-col items-center mb-2 space-y-1 text-center w-full">
              <div className="relative">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-100 border-2 border-slate-300 p-0.5 shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  <span>{secondAvatar.emoji}</span>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-100 font-display font-extrabold text-[10px] border border-white shadow-xs">
                  #2
                </div>
              </div>

              <div className="font-display font-extrabold text-xs sm:text-sm text-clay truncate w-full">
                {second.user.pseudo}
              </div>

              {second.user.favoriteDept && (
                <div className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-creme-200 text-clay-muted text-[10px] font-mono font-bold">
                  <MapPin className="w-2.5 h-2.5 text-terracotta" />
                  <span>{second.user.favoriteDept}</span>
                </div>
              )}

              <div className="text-[11px] font-bold text-slate-700">
                {second.excellenceScore.toLocaleString('fr-FR')} pts
              </div>
            </div>

            {/* Silver Pillar (height 95px) */}
            <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200/90 border-t-2 border-x-2 border-slate-300 shadow-md flex flex-col items-center justify-between p-2">
              <div className="w-7 h-7 rounded-full bg-white/80 border border-slate-300 flex items-center justify-center font-display font-black text-xs text-slate-600 shadow-xs">
                2
              </div>
              <div className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-wider">
                {second.masteredCount}/101 dép.
              </div>
            </div>
          </div>
        )}

        {/* 1st Place: Gold (Center) */}
        {first && firstAvatar && (
          <div className="flex-1 max-w-[190px] flex flex-col items-center group -mt-4">
            {/* Floating Crown above 1st Place */}
            <div className="animate-bounce-gentle text-amber-500 mb-0.5 drop-shadow-xs">
              <Crown className="w-6 h-6 fill-amber-400" />
            </div>

            {/* Player Info Above Pillar */}
            <div className="flex flex-col items-center mb-2 space-y-1 text-center w-full">
              <div className="relative">
                <div className="w-16 h-16 sm:w-19 sm:h-19 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-100 border-2 border-amber-400 p-0.5 shadow-md flex items-center justify-center text-3xl group-hover:scale-105 transition-transform ring-4 ring-amber-400/20">
                  <span>{firstAvatar.emoji}</span>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-white font-display font-extrabold text-xs border border-white shadow-xs flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 fill-white" />
                  <span>#1</span>
                </div>
              </div>

              <div className="font-display font-extrabold text-sm sm:text-base text-clay truncate w-full">
                {first.user.pseudo}
              </div>

              {first.user.favoriteDept && (
                <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-300">
                  <MapPin className="w-2.5 h-2.5 text-amber-700" />
                  <span>Dép. {first.user.favoriteDept}</span>
                </div>
              )}

              <div className="text-xs sm:text-sm font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                {first.excellenceScore.toLocaleString('fr-FR')} pts
              </div>
            </div>

            {/* Gold Pillar (height 125px) */}
            <div className="w-full h-32 sm:h-38 rounded-t-2xl bg-gradient-to-b from-amber-300 via-amber-100 to-amber-200/90 border-t-2 border-x-2 border-amber-400 shadow-lg flex flex-col items-center justify-between p-2.5 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-white/90 border border-amber-400 flex items-center justify-center font-display font-black text-sm text-amber-800 shadow-xs">
                1
              </div>
              <div className="text-center">
                <div className="text-[11px] font-display font-extrabold text-amber-900">
                  {first.masteredCount} / 101 acquis
                </div>
                <div className="text-[9px] font-medium text-amber-700/80">
                  {first.accuracy}% précision
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place: Bronze (Right) */}
        {third && thirdAvatar && (
          <div className="flex-1 max-w-[170px] flex flex-col items-center group">
            {/* Player Info Above Pillar */}
            <div className="flex flex-col items-center mb-2 space-y-1 text-center w-full">
              <div className="relative">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-tr from-amber-700/40 to-amber-600/10 border-2 border-amber-700/40 p-0.5 shadow-sm flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  <span>{thirdAvatar.emoji}</span>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-800 text-amber-100 font-display font-extrabold text-[10px] border border-white shadow-xs">
                  #3
                </div>
              </div>

              <div className="font-display font-extrabold text-xs sm:text-sm text-clay truncate w-full">
                {third.user.pseudo}
              </div>

              {third.user.favoriteDept && (
                <div className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-creme-200 text-clay-muted text-[10px] font-mono font-bold">
                  <MapPin className="w-2.5 h-2.5 text-terracotta" />
                  <span>{third.user.favoriteDept}</span>
                </div>
              )}

              <div className="text-[11px] font-bold text-amber-900">
                {third.excellenceScore.toLocaleString('fr-FR')} pts
              </div>
            </div>

            {/* Bronze Pillar (height 75px) */}
            <div className="w-full h-20 sm:h-24 rounded-t-2xl bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200/80 border-t-2 border-x-2 border-amber-700/30 shadow-md flex flex-col items-center justify-between p-2">
              <div className="w-7 h-7 rounded-full bg-white/80 border border-amber-700/30 flex items-center justify-center font-display font-black text-xs text-amber-900 shadow-xs">
                3
              </div>
              <div className="text-[10px] font-display font-bold text-amber-800/80 uppercase tracking-wider">
                {third.masteredCount}/101 dép.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
