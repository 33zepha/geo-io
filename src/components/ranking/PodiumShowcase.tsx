'use client';

import React from 'react';
import { LeaderboardEntry } from '../../types/ranking';
import { getAvatarById } from '../../data/avatars';
import { Crown, MapPin } from 'lucide-react';

interface PodiumShowcaseProps {
  top3: LeaderboardEntry[];
  currentUserId?: string;
}

const rankStyles = [
  'border-amber-300 bg-amber-50',
  'border-slate-300 bg-slate-50',
  'border-orange-200 bg-orange-50',
];

export const PodiumShowcase: React.FC<PodiumShowcaseProps> = ({ top3, currentUserId }) => {
  if (top3.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {top3.map((entry, index) => {
        const avatar = getAvatarById(entry.user.avatarId);
        const isCurrent = entry.user.id === currentUserId;

        return (
          <div
            key={entry.user.id}
            className={`flex min-w-0 items-center gap-2.5 rounded-xl border p-2.5 ${rankStyles[index]}`}
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white bg-white text-xl shadow-xs">
              {avatar.emoji}
              <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-extrabold text-white">
                {entry.rank}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 font-display text-xs font-extrabold text-clay">
                {index === 0 && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                <span className="truncate">{entry.user.pseudo}</span>
                {isCurrent && <span className="text-[9px] uppercase text-terracotta">Vous</span>}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-clay-muted">
                {entry.user.favoriteDept && (
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5" />
                    {entry.user.favoriteDept}
                  </span>
                )}
                <span>•</span>
                <span>{entry.masteredCount}/101 acquis</span>
              </div>
              <div className="mt-0.5 font-display text-sm font-extrabold text-clay">
                {entry.excellenceScore.toLocaleString('fr-FR')} pts
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
