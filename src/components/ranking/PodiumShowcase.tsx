'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LeaderboardEntry } from '../../types/ranking';
import { getAvatarById } from '../../data/avatars';
import { Crown } from 'lucide-react';

interface PodiumShowcaseProps {
  top3: LeaderboardEntry[];
  currentUserId?: string;
}

const rankStyles = [
  'border-honey/40 bg-honey-light sm:order-2 sm:-translate-y-1 sm:shadow-soft',
  'border-clay-border bg-creme-100 sm:order-1',
  'border-terracotta/30 bg-terracotta-light sm:order-3',
];

export const PodiumShowcase: React.FC<PodiumShowcaseProps> = ({ top3, currentUserId }) => {
  if (top3.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-end">
      {top3.map((entry, index) => {
        const avatar = getAvatarById(entry.user.avatarId);
        const isCurrent = entry.user.id === currentUserId;

        return (
          <motion.div
            key={entry.user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`flex min-w-0 items-center gap-2.5 rounded-xl border p-2.5 ${rankStyles[index]} ${index === 0 ? 'sm:py-3.5' : ''}`}
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white bg-white text-xl shadow-xs">
              {avatar.emoji}
              <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-extrabold text-white">
                {entry.rank}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 font-display text-xs font-extrabold text-clay">
                {index === 0 && <Crown className="h-3.5 w-3.5 shrink-0 text-honey" />}
                <span className="truncate">{entry.user.pseudo}</span>
                {isCurrent && <span className="text-[9px] uppercase text-terracotta">Vous</span>}
              </div>
              <div className="mt-0.5 text-[10px] text-clay-muted">
                {entry.masteredCount}/101 acquis
              </div>
              <div className="mt-0.5 font-display text-sm font-extrabold text-clay">
                {entry.excellenceScore.toLocaleString('fr-FR')} pts
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
