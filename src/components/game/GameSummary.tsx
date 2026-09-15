'use client';

import React from 'react';
import { GameSessionSummary } from '../../types/game';
import { soundManager } from '../../lib/audio';
import { 
  Trophy, 
  RotateCcw, 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  Target, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { CompetitionUpdate } from '../../types/competition';

interface GameSummaryProps {
  summary: GameSessionSummary;
  onReplay: () => void;
  onBackToMenu: () => void;
  competitionUpdate?: CompetitionUpdate | null;
  competitionPending?: boolean;
}

export const GameSummary: React.FC<GameSummaryProps> = ({
  summary,
  onReplay,
  onBackToMenu,
  competitionUpdate,
  competitionPending,
}) => {
  const incorrectResults = summary.results.filter((r) => !r.isCorrect);

  return (
    <div className="mx-auto flex h-full max-h-full w-full max-w-2xl select-none flex-col items-stretch justify-start overflow-y-auto p-1 md:items-center md:justify-center md:overflow-hidden">
      {/* Scorecard Box */}
      <div className="flex w-full max-h-none flex-col justify-between space-y-3 overflow-visible rounded-2xl border border-clay-border/80 bg-white p-3.5 text-center shadow-sm md:max-h-full md:overflow-hidden md:p-5">
        {/* Grade & Trophy */}
        <div className="space-y-1 shrink-0">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 18 }} className="mb-1 inline-flex rounded-xl border border-honey/30 bg-honey-light p-2 text-honey-dark">
            <Trophy className="h-6 w-6 fill-honey/20 text-honey" />
          </motion.div>
          <h1 className="font-display text-lg font-extrabold leading-tight text-clay md:text-xl">
            {summary.grade}
          </h1>
          <p className="text-xs text-clay-muted">
            {summary.correctCount} / {summary.totalRounds} réussis ({summary.accuracyPercent}% de précision)
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-clay-border/60 max-w-md mx-auto w-full shrink-0">
          <div className="bg-creme-100 p-2 rounded-xl border border-clay-border/60 text-center">
            <div className="text-base font-extrabold text-clay">{summary.accuracyPercent}%</div>
            <div className="text-[10px] font-bold text-clay-muted">Précision</div>
          </div>

          <div className="bg-creme-100 p-2 rounded-xl border border-clay-border/60 text-center">
            <div className="text-base font-extrabold text-clay">+{summary.totalScore}</div>
            <div className="text-[10px] font-bold text-clay-muted">Points</div>
          </div>

          <div className="bg-creme-100 p-2 rounded-xl border border-clay-border/60 text-center">
            <div className="text-base font-extrabold text-clay">
              {summary.correctCount}/{summary.totalRounds}
            </div>
            <div className="text-[10px] font-bold text-clay-muted">Succès</div>
          </div>
        </div>

        {(competitionPending || competitionUpdate) && (
          <div className="rounded-xl border border-honey/30 bg-honey-light p-3 text-left">
            <div className="flex items-center gap-1.5 font-display text-xs font-extrabold text-clay">
              <Sparkles className="h-4 w-4 text-terracotta" /> Mission officielle
            </div>
            {competitionPending ? (
              <p className="mt-1 text-[11px] text-clay-muted">Validation du résultat par le serveur…</p>
            ) : (
              <p className="mt-1 text-[11px] text-clay-muted">
                {competitionUpdate!.newlyCompletedMissionIds.length > 0
                  ? `${competitionUpdate!.newlyCompletedMissionIds.length} objectif(s) validé(s) · ${competitionUpdate!.overview.weeklyPoints}/700 points cette semaine · rang ${competitionUpdate!.overview.weeklyRank ? `#${competitionUpdate!.overview.weeklyRank}` : 'en calcul'}.`
                  : 'Résultat validé. Ces objectifs étaient déjà acquis ; aucun point n’a été compté deux fois.'}
              </p>
            )}
          </div>
        )}

        {/* Review of Mistakes (Internally scrollable inside card) */}
        {incorrectResults.length > 0 ? (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-clay shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-honey-dark" />
              <span>Points à revoir ({incorrectResults.length}) :</span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
              {incorrectResults.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-creme-50 border border-clay-border/70 rounded-xl p-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 break-words text-left font-bold text-clay">{r.title}</span>
                    <span className="font-mono text-[10px] font-bold text-terracotta bg-terracotta-light px-1.5 py-0.2 rounded border border-terracotta/20 shrink-0">
                      {r.targetCode}
                    </span>
                  </div>
                  <div className="text-clay-muted text-[11px]">
                    Bonne réponse : <strong className="text-clay">{r.targetName}</strong>
                    {r.userAnswer && (
                      <span className="text-coral-dark"> (répondu : {r.userAnswer})</span>
                    )}
                  </div>
                  {r.explanation && (
                    <p className="text-[11px] leading-snug text-clay-muted">{r.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-sage-light border border-sage/30 rounded-xl p-3 text-center text-xs font-bold text-sage-dark shrink-0">
            🎉 Sans-faute remarquable ! Tous les territoires ont été identifiés.
          </div>
        )}

        {/* Action Buttons */}
        <div className="sticky bottom-0 flex shrink-0 items-center justify-center gap-2.5 border-t border-clay-border/40 bg-white pt-2 md:static md:pt-1">
          <button
            onClick={() => {
              soundManager.playClick(500);
              onReplay();
            }}
            className="btn-3d flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-b-terracotta-dark bg-terracotta px-5 py-2.5 text-xs font-bold text-white transition hover:bg-terracotta-hover md:min-h-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rejouer</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick(440);
              onBackToMenu();
            }}
            className="pressable flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-clay-border bg-white px-5 py-2.5 text-xs font-bold text-clay transition hover:bg-creme-50 md:min-h-0"
          >
            <Settings2 className="w-3.5 h-3.5 text-clay-muted" />
            <span>Changer de mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
