'use client';

import React from 'react';
import type { CompetitionOverview, DailyMission } from '../../types/competition';
import type { GameModeType } from '../../types/game';
import { ArrowRight, Check, Circle, Flame, Trophy } from 'lucide-react';

const MODE_LABELS: Record<GameModeType, string> = {
  clic_carte: 'Pointage',
  qcm: 'Quiz QCM',
  silhouette: 'Silhouette',
  enquete_logique: 'Enquête',
};

interface DailyMissionPanelProps {
  overview: CompetitionOverview | null;
  loading?: boolean;
  error?: string | null;
  onStart: (slot: 1 | 2) => void;
}

const Objective: React.FC<{ mission: DailyMission; shortLabel: string }> = ({ mission, shortLabel }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${mission.completed ? 'text-sage-dark' : 'text-clay-muted'}`}>
    {mission.completed ? <Check className="h-3 w-3" strokeWidth={3} /> : <Circle className="h-2.5 w-2.5" />}
    {shortLabel}
    <span className="font-mono text-[9px] text-clay-subtle">+{mission.points}</span>
  </span>
);

export const DailyMissionPanel: React.FC<DailyMissionPanelProps> = ({ overview, loading, error, onStart }) => {
  if (loading || error || !overview?.enabled) return null;

  const completedCount = overview.missions.filter((mission) => mission.completed).length;
  const dailyProgress = Math.round((overview.dailyPoints / 100) * 100);
  const weeklyProgress = Math.round((overview.weeklyPoints / 700) * 100);
  const participation = overview.missions.find((mission) => mission.kind === 'participation')!;
  const precision = overview.missions.find((mission) => mission.kind === 'precision')!;
  const variety = overview.missions.find((mission) => mission.kind === 'variety')!;
  const firstDone = participation.completed && precision.completed;

  return (
    <section className="overflow-hidden rounded-2xl border border-clay-border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-sm font-extrabold text-clay">Missions du jour</h2>
            <span className="hidden rounded-full bg-creme-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-clay-muted min-[360px]:inline-flex">5–8 min</span>
          </div>
          <p className="mt-0.5 text-[10px] text-clay-muted">
            {completedCount === 3 ? 'Tout est fait — rendez-vous demain.' : `${completedCount}/3 · commun à toute la promo`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-honey-dark" title="Série des missions">
            <Flame className="h-3.5 w-3.5 fill-honey text-honey" /> {overview.streak.days} j
          </span>
          <span className="rounded-lg bg-clay px-2.5 py-1 font-mono text-[11px] font-bold text-white">{overview.dailyPoints}/100</span>
        </div>
      </div>

      <div className="h-1 bg-creme-100">
        <div className="h-full bg-terracotta transition-[width] duration-500" style={{ width: `${dailyProgress}%` }} />
      </div>

      <div className="divide-y divide-clay-border/60 border-y border-clay-border/60">
        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-extrabold ${firstDone ? 'bg-sage-light text-sage-dark' : 'bg-terracotta-light text-terracotta'}`}>
            {firstDone ? <Check className="h-4 w-4" /> : '01'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-xs font-bold text-clay">{MODE_LABELS[participation.mode]}</div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
              <Objective mission={participation} shortLabel="Terminer" />
              <Objective mission={precision} shortLabel="80 %" />
            </div>
          </div>
          <button type="button" onClick={() => onStart(1)} className={`flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-3 text-[11px] font-bold transition ${firstDone ? 'border border-clay-border bg-white text-clay-muted hover:bg-creme-100' : 'bg-terracotta text-white hover:bg-terracotta-hover'}`}>
            {firstDone ? 'Refaire' : 'Jouer'} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-extrabold ${variety.completed ? 'bg-sage-light text-sage-dark' : 'bg-lagon-light text-lagon'}`}>
            {variety.completed ? <Check className="h-4 w-4" /> : '02'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-xs font-bold text-clay">{MODE_LABELS[variety.mode]}</div>
            <div className="mt-0.5"><Objective mission={variety} shortLabel="Atteindre 80 %" /></div>
          </div>
          <button type="button" onClick={() => onStart(2)} className={`flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-3 text-[11px] font-bold transition ${variety.completed ? 'border border-clay-border bg-white text-clay-muted hover:bg-creme-100' : 'border border-clay-border bg-creme-100 text-clay hover:bg-creme-200'}`}>
            {variety.completed ? 'Refaire' : 'Jouer'} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 py-2 sm:px-5">
        <Trophy className="h-3.5 w-3.5 shrink-0 text-honey" />
        <div className="min-w-0 flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-creme-200">
            <div className="h-full rounded-full bg-honey transition-[width] duration-500" style={{ width: `${weeklyProgress}%` }} />
          </div>
        </div>
        <span className="shrink-0 font-mono text-[9px] font-bold text-clay-muted">
          Semaine {overview.weeklyPoints}/700{overview.nextRewardAt ? ` · palier ${overview.nextRewardAt}` : ''}
        </span>
      </div>
    </section>
  );
};
