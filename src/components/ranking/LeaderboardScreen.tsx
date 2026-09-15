'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { isAdminEmail } from '../../lib/admin';
import { fetchLiveLeaderboardEntries } from '../../lib/rankingService';
import { LeaderboardEntry } from '../../types/ranking';
import { PodiumShowcase } from './PodiumShowcase';
import { AdminPlayerModal } from './AdminPlayerModal';
import { getAvatarById } from '../../data/avatars';
import { soundManager } from '../../lib/audio';
import { RefreshCw, Trophy, Users } from 'lucide-react';
import { fetchCompetition } from '../../lib/competitionService';
import type { WeeklyStanding } from '../../types/competition';

interface LeaderboardData {
  entries: LeaderboardEntry[];
  top3: LeaderboardEntry[];
  rest: LeaderboardEntry[];
}

const EMPTY_DATA: LeaderboardData = {
  entries: [],
  top3: [],
  rest: [],
};

export const LeaderboardScreen: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = isAdminEmail(user?.email);
  const [data, setData] = useState<LeaderboardData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [view, setView] = useState<'general' | 'weekly'>('general');
  const [weekly, setWeekly] = useState<WeeklyStanding[]>([]);
  const [competitionAvailable, setCompetitionAvailable] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const [general, competition] = await Promise.allSettled([
      fetchLiveLeaderboardEntries(),
      fetchCompetition(),
    ]);
    if (general.status === 'fulfilled') {
      setData(general.value);
    } else {
      console.warn('General leaderboard refresh error:', general.reason);
      setData(EMPTY_DATA);
      setLoadError('Impossible de charger le classement réel pour le moment.');
    }
    const competitionIsEnabled = competition.status === 'fulfilled' && competition.value.overview.enabled;
    setCompetitionAvailable(competitionIsEnabled);
    setWeekly(competitionIsEnabled ? competition.value.standings : []);
    if (!competitionIsEnabled) setView('general');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAdminPlayer = (entry: LeaderboardEntry) => {
    if (!isAdmin) return;
    soundManager.playClick(420);
    setSelectedEntry(entry);
  };

  return (
    <div className="flex h-full max-h-full w-full select-none flex-col overflow-hidden safe-bottom">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-clay-border/70 pb-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-terracotta sm:text-xs">
            <Trophy className="h-3.5 w-3.5" />
            Classement réel de la promo
          </div>
          <h1 className="break-words font-display text-lg font-extrabold leading-tight tracking-tight text-clay md:text-2xl">
            Les meilleurs géographes
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isLoading && !loadError && (
            <span className="hidden items-center gap-1 text-[11px] font-medium text-clay-muted sm:flex">
              <Users className="h-3.5 w-3.5" />
              {data.entries.length} joueur{data.entries.length > 1 ? 's' : ''}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(500);
              loadData();
            }}
            disabled={isLoading}
            className="touch-target rounded-xl border border-clay-border bg-white p-2 text-clay-muted transition hover:bg-creme-100 hover:text-clay disabled:cursor-wait md:min-h-0 md:min-w-0"
            title="Actualiser les profils Supabase"
            aria-label="Actualiser le classement"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-terracotta' : ''}`} />
          </button>
        </div>
      </div>

      {competitionAvailable && (
        <div className="mt-3 flex shrink-0 rounded-xl border border-clay-border bg-creme-100 p-1 text-xs font-bold">
          <button type="button" onClick={() => setView('general')} className={`min-h-11 flex-1 rounded-lg px-3 transition md:min-h-10 ${view === 'general' ? 'bg-white text-clay shadow-xs' : 'text-clay-muted'}`}>Classement général</button>
          <button type="button" onClick={() => setView('weekly')} className={`min-h-11 flex-1 rounded-lg px-3 transition md:min-h-10 ${view === 'weekly' ? 'bg-white text-terracotta shadow-xs' : 'text-clay-muted'}`}>Cette semaine · /700</button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-3 pr-1 pb-5">
        {isLoading ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta/20 border-t-terracotta" />
            <div className="text-sm font-medium text-clay-muted">Chargement des profils réels…</div>
          </div>
        ) : view === 'weekly' ? (
          weekly.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-clay-border bg-white/60 px-6 text-center">
              <Trophy className="mb-2 h-7 w-7 text-honey" />
              <p className="font-display text-sm font-bold text-clay">La course commence cette semaine</p>
              <p className="mt-1 text-xs text-clay-muted">Les premiers points apparaîtront après une mission officielle.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {weekly.map((entry) => {
                const avatar = getAvatarById(entry.avatarId);
                const isCurrent = user?.id === entry.userId || entry.pseudo === 'MobilePreview';
                return (
                  <div key={entry.userId} className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 rounded-xl border px-3 py-2.5 ${isCurrent ? 'border-honey/40 bg-honey-light' : 'border-clay-border bg-white'}`}>
                    <div className="font-display text-center text-sm font-extrabold text-clay">#{entry.rank}</div>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-clay-border bg-creme-100 text-lg">{avatar.emoji}</span>
                      <div className="min-w-0"><div className="truncate font-display text-xs font-bold text-clay">{entry.pseudo}{isCurrent ? ' · Vous' : ''}</div><div className="text-[10px] text-clay-muted">{entry.missionsCompleted} missions · {entry.accuracy}%</div></div>
                    </div>
                    <div className="text-right"><div className="font-display text-base font-extrabold text-terracotta">{entry.points}</div><div className="text-[9px] uppercase text-clay-subtle">points</div></div>
                  </div>
                );
              })}
            </div>
          )
        ) : loadError ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-2xl border border-terracotta/20 bg-terracotta/5 px-6 text-center">
            <p className="font-display text-sm font-bold text-clay">Classement indisponible</p>
            <p className="mt-1 text-xs text-clay-muted">{loadError}</p>
          </div>
        ) : data.entries.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-clay-border bg-white/60 px-6 text-center">
            <Users className="mb-2 h-7 w-7 text-clay-subtle" />
            <p className="font-display text-sm font-bold text-clay">Aucun joueur classé</p>
            <p className="mt-1 max-w-sm text-xs text-clay-muted">
              Le classement apparaîtra dès qu’un profil réel sera enregistré dans Supabase.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <PodiumShowcase
              top3={data.top3}
              currentUserId={user?.id}
              onSelect={isAdmin ? openAdminPlayer : undefined}
            />

            {data.rest.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-clay-border/80 bg-white">
                <div className="grid grid-cols-12 border-b border-clay-border/60 bg-creme-100/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-clay-muted">
                  <div className="col-span-2 text-center md:col-span-1">Rang</div>
                  <div className="col-span-7 md:col-span-6">Joueur</div>
                  <div className="hidden text-center md:col-span-2 md:block">Maîtrise</div>
                  <div className="col-span-3 text-right">Score</div>
                </div>

                <div className="divide-y divide-clay-border/40">
                  {data.rest.map((entry) => {
                    const avatar = getAvatarById(entry.user.avatarId);
                    const isCurrent = user?.id === entry.user.id;

                    return (
                      <div
                        key={entry.user.id}
                        role={isAdmin ? 'button' : undefined}
                        tabIndex={isAdmin ? 0 : undefined}
                        onClick={isAdmin ? () => openAdminPlayer(entry) : undefined}
                        onKeyDown={
                          isAdmin
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  openAdminPlayer(entry);
                                }
                              }
                            : undefined
                        }
                        className={`fade-rise grid grid-cols-12 items-center px-3 py-2 text-xs transition-colors ${
                          isCurrent ? 'bg-honey-light/80' : ''
                        } ${isAdmin ? 'cursor-pointer hover:bg-creme-100/80' : ''}`}
                      >
                        <div className="col-span-2 text-center font-display font-extrabold text-clay-muted md:col-span-1">
                          #{entry.rank}
                        </div>
                        <div className="col-span-7 flex min-w-0 items-center gap-2 md:col-span-6">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-clay-border bg-creme-100 text-base">
                            {avatar.emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="truncate font-display font-bold text-clay">{entry.user.pseudo}</span>
                              {isCurrent && <span className="text-[9px] uppercase text-terracotta">Vous</span>}
                            </div>
                          </div>
                        </div>
                        <div className="hidden text-center text-[11px] text-clay-muted md:col-span-2 md:block">
                          {entry.masteredCount}/101
                        </div>
                        <div className="col-span-3 text-right font-display text-sm font-extrabold text-clay">
                          {entry.excellenceScore.toLocaleString('fr-FR')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isAdmin && selectedEntry && (
        <AdminPlayerModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onBanned={() => {
            setSelectedEntry(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
