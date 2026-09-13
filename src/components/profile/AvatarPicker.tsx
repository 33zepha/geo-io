'use client';

import React from 'react';
import { AVATARS } from '../../data/avatars';
import { DEPARTMENTS } from '../../data/departments';
import { Check } from 'lucide-react';
import { soundManager } from '../../lib/audio';

interface AvatarPickerProps {
  selectedAvatarId: string;
  selectedFavoriteDept: string;
  university: string;
  onSelectAvatar: (id: string) => void;
  onSelectFavoriteDept: (dept: string) => void;
  onChangeUniversity: (univ: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatarId,
  selectedFavoriteDept,
  university,
  onSelectAvatar,
  onSelectFavoriteDept,
  onChangeUniversity,
}) => {
  const deptList = Object.values(DEPARTMENTS).sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true })
  );

  return (
    <div className="space-y-5">
      {/* 1. Avatar Grid (12 curated cartographic avatars) */}
      <div>
        <label className="block text-xs font-display font-bold uppercase tracking-wider text-clay-muted mb-2">
          Choisissez votre emblème cartographique (12 avatars)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1.5 rounded-2xl bg-creme-100/70 border border-clay-border/70">
          {AVATARS.map((avatar) => {
            const isSelected = avatar.id === selectedAvatarId;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => {
                  soundManager.playClick(440);
                  onSelectAvatar(avatar.id);
                }}
                className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center cursor-pointer relative group ${
                  isSelected
                    ? 'bg-white border-terracotta shadow-sm scale-102 ring-2 ring-terracotta/20'
                    : 'bg-white/80 hover:bg-white border-clay-border/60 hover:border-clay-border'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-terracotta text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                  {avatar.emoji}
                </div>
                <div className="text-[11px] font-display font-bold text-clay truncate w-full">
                  {avatar.name}
                </div>
                <div className="text-[9px] text-clay-muted truncate w-full font-medium">
                  {avatar.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Favorite Department Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-display font-bold uppercase tracking-wider text-clay-muted mb-1.5">
            Département de cœur (affiché en badge)
          </label>
          <select
            value={selectedFavoriteDept}
            onChange={(e) => {
              soundManager.playClick(420);
              onSelectFavoriteDept(e.target.value);
            }}
            className="w-full px-3 py-2 rounded-xl bg-white border border-clay-border text-xs font-medium text-clay focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta cursor-pointer"
          >
            {deptList.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} • {d.name} ({d.regionName})
              </option>
            ))}
          </select>
        </div>

        {/* 3. University / Faculté Tag */}
        <div>
          <label className="block text-xs font-display font-bold uppercase tracking-wider text-clay-muted mb-1.5">
            Université / Faculté (facultatif)
          </label>
          <input
            type="text"
            value={university}
            onChange={(e) => onChangeUniversity(e.target.value)}
            placeholder="Ex: Paris 1 Panthéon-Sorbonne, Lyon 2..."
            className="w-full px-3 py-2 rounded-xl bg-white border border-clay-border text-xs font-medium text-clay placeholder:text-clay-subtle focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
          />
        </div>
      </div>
    </div>
  );
};
