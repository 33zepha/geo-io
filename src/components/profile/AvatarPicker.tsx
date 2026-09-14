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
      <div>
        <label className="mb-2 block font-display text-xs font-bold uppercase tracking-wider text-clay-muted">
          Emblème cartographique
        </label>
        <div className="grid max-h-60 grid-cols-3 gap-2.5 overflow-y-auto rounded-2xl border border-clay-border/70 bg-creme-100/60 p-2.5 scrollbar-thin sm:grid-cols-4">
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
                className={`pressable relative flex flex-col items-center rounded-2xl border-2 p-2.5 text-center transition ${
                  isSelected
                    ? 'scale-[1.02] border-terracotta bg-white shadow-sm ring-2 ring-terracotta/15'
                    : 'border-clay-border/50 bg-white/90 hover:border-clay-border hover:bg-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
                <div className="mb-1 text-2xl transition-transform group-hover:scale-110">
                  {avatar.emoji}
                </div>
                <div className="w-full truncate font-display text-[11px] font-bold text-clay">
                  {avatar.name}
                </div>
                <div className="w-full truncate text-[9px] font-medium text-clay-muted">
                  {avatar.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-clay-muted">
            Département de cœur
          </label>
          <select
            value={selectedFavoriteDept}
            onChange={(e) => {
              soundManager.playClick(420);
              onSelectFavoriteDept(e.target.value);
            }}
            className="w-full cursor-pointer rounded-xl border border-clay-border bg-white px-3 py-2.5 text-base font-medium text-clay focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta sm:text-xs"
          >
            {deptList.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} • {d.name} ({d.regionName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block font-display text-xs font-bold uppercase tracking-wider text-clay-muted">
            Université / Faculté
          </label>
          <input
            type="text"
            value={university}
            onChange={(e) => onChangeUniversity(e.target.value)}
            placeholder="Ex: Lyon 2, Paris 1…"
            className="w-full rounded-xl border border-clay-border bg-white px-3 py-2.5 text-base font-medium text-clay placeholder:text-clay-subtle focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta sm:text-xs"
          />
        </div>
      </div>
    </div>
  );
};
