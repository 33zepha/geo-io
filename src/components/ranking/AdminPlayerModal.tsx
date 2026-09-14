'use client';

import React, { useEffect, useState } from 'react';
import { Ban, Shield, X } from 'lucide-react';
import { LeaderboardEntry } from '../../types/ranking';
import { getAvatarById } from '../../data/avatars';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { soundManager } from '../../lib/audio';

interface AdminPlayerModalProps {
  entry: LeaderboardEntry;
  onClose: () => void;
  onBanned?: () => void;
}

export const AdminPlayerModal: React.FC<AdminPlayerModalProps> = ({
  entry,
  onClose,
  onBanned,
}) => {
  const avatar = getAvatarById(entry.user.avatarId);
  const [scoreCount, setScoreCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured || !supabase) return;
      const { count, error: countError } = await supabase
        .from('scores')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', entry.user.id);
      if (cancelled) return;
      if (countError) {
        setScoreCount(null);
        return;
      }
      setScoreCount(count ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [entry.user.id]);

  const handleBan = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const ok = window.confirm(
      `Bannir « ${entry.user.pseudo} » ? Le compte ne pourra plus jouer (soft-ban).`
    );
    if (!ok) return;

    setBusy(true);
    setError(null);
    soundManager.playClick(280);
    try {
      const { error: rpcError } = await supabase.rpc('admin_set_banned', {
        target_id: entry.user.id,
        banned: true,
      });
      if (rpcError) throw rpcError;
      onBanned?.();
      onClose();
    } catch (err) {
      console.warn('Admin ban failed:', err);
      setError(
        "Ban impossible pour l’instant. Applique d’abord la migration SQL admin_set_banned dans Supabase."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-clay/40 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(92dvh,36rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-2 border-clay-border bg-white shadow-soft-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-clay-border/70 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-terracotta">
            <Shield className="h-3.5 w-3.5" />
            Vue admin
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-clay-border bg-creme-100 p-2 text-clay-muted hover:bg-creme-200 hover:text-clay"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-clay-border bg-creme-100 text-3xl">
              {avatar.emoji}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-extrabold text-clay">{entry.user.pseudo}</h2>
              <p className="text-xs text-clay-muted">
                Rang #{entry.rank} · {entry.excellenceScore.toLocaleString('fr-FR')} pts excellence
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-clay-border/80 bg-creme-50 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wide text-clay-muted">XP</div>
              <div className="font-display text-lg font-extrabold text-clay">{entry.totalXp}</div>
            </div>
            <div className="rounded-xl border border-clay-border/80 bg-creme-50 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wide text-clay-muted">Niveau</div>
              <div className="font-display text-lg font-extrabold text-clay">{entry.user.level}</div>
            </div>
            <div className="rounded-xl border border-clay-border/80 bg-creme-50 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wide text-clay-muted">Maîtrise</div>
              <div className="font-display text-lg font-extrabold text-clay">{entry.masteredCount}/101</div>
            </div>
            <div className="rounded-xl border border-clay-border/80 bg-creme-50 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wide text-clay-muted">Précision</div>
              <div className="font-display text-lg font-extrabold text-clay">{entry.accuracy}%</div>
            </div>
            <div className="col-span-2 rounded-xl border border-clay-border/80 bg-creme-50 px-3 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wide text-clay-muted">Parties sync</div>
              <div className="font-display text-lg font-extrabold text-clay">
                {scoreCount === null ? '…' : scoreCount}
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-coral/30 bg-coral-light/40 px-3 py-2 text-xs text-coral-dark">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={handleBan}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-coral/40 bg-coral-light px-4 py-2.5 text-sm font-bold text-coral-dark transition hover:bg-coral/20 disabled:opacity-60"
          >
            <Ban className="h-4 w-4" />
            {busy ? 'Bannissement…' : 'Bannir ce compte'}
          </button>
        </div>
      </div>
    </div>
  );
};
