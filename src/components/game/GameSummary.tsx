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

interface GameSummaryProps {
  summary: GameSessionSummary;
  onReplay: () => void;
  onBackToMenu: () => void;
}

export const GameSummary: React.FC<GameSummaryProps> = ({
  summary,
  onReplay,
  onBackToMenu,
}) => {
  const incorrectResults = summary.results.filter((r) => !r.isCorrect);

  return (
    <div className="w-full max-w-2xl mx-auto h-full max-h-full flex flex-col justify-center items-center overflow-hidden p-1 select-none">
      {/* Scorecard Box */}
      <div className="w-full bg-white border border-clay-border/80 rounded-2xl p-4 sm:p-5 shadow-sm text-center flex flex-col justify-between max-h-full overflow-hidden space-y-3">
        {/* Grade & Trophy */}
        <div className="space-y-1 shrink-0">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 18 }} className="mb-1 inline-flex rounded-xl border border-honey/30 bg-honey-light p-2 text-honey-dark">
            <Trophy className="h-6 w-6 fill-honey/20 text-honey" />
          </motion.div>
          <h1 className="text-lg sm:text-xl font-extrabold text-clay font-display leading-tight">
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
                    <span className="font-bold text-clay truncate">{r.title}</span>
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
        <div className="flex items-center justify-center gap-2.5 pt-1 shrink-0 border-t border-clay-border/40">
          <button
            onClick={() => {
              soundManager.playClick(500);
              onReplay();
            }}
            className="btn-3d flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border-b-terracotta-dark bg-terracotta px-5 py-2.5 text-xs font-bold text-white transition hover:bg-terracotta-hover"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rejouer</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick(440);
              onBackToMenu();
            }}
            className="pressable flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-clay-border bg-white px-5 py-2.5 text-xs font-bold text-clay transition hover:bg-creme-50"
          >
            <Settings2 className="w-3.5 h-3.5 text-clay-muted" />
            <span>Changer de mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
