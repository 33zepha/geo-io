'use client';

import React from 'react';
import { QuizSessionSummary } from '../../types/quiz';
import { soundManager } from '../../lib/audio';
import { 
  Trophy, 
  RotateCcw, 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Target, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface QuizSummaryScreenProps {
  summary: QuizSessionSummary;
  onRestartSameConfig: () => void;
  onBackToConfig: () => void;
}

export const QuizSummaryScreen: React.FC<QuizSummaryScreenProps> = ({
  summary,
  onRestartSameConfig,
  onBackToConfig,
}) => {
  const incorrectRecords = summary.records.filter((r) => !r.isCorrect);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Grade */}
      <div className="bg-white border-2 border-clay-border rounded-3xl p-6 sm:p-10 shadow-soft text-center space-y-5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-honey/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex p-4 rounded-3xl bg-honey-light text-honey-dark border-2 border-honey/30 shadow-sm mb-1 animate-bounce-gentle">
          <Trophy className="w-12 h-12 text-honey fill-honey/20" />
        </div>

        <div>
          <div className="text-xs font-display font-bold uppercase tracking-widest text-honey-dark mb-1">
            Bilan de l\'Expédition Géographique
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-clay font-display">
            {summary.grade}
          </h1>
          <p className="text-sm text-clay-muted mt-1 font-medium">
            {summary.correctAnswers} bonnes réponses sur {summary.totalQuestions} questions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-clay-border max-w-2xl mx-auto">
          <div className="bg-creme-100 p-3.5 rounded-2xl border border-clay-border text-center">
            <Target className="w-5 h-5 text-terracotta mx-auto mb-1" />
            <div className="text-2xl font-display font-extrabold text-clay">{summary.accuracyPercent}%</div>
            <div className="text-[11px] font-display font-bold text-clay-muted uppercase">Précision</div>
          </div>

          <div className="bg-creme-100 p-3.5 rounded-2xl border border-clay-border text-center">
            <Flame className="w-5 h-5 text-honey mx-auto mb-1 fill-honey/20" />
            <div className="text-2xl font-display font-extrabold text-clay">{summary.maxStreak}</div>
            <div className="text-[11px] font-display font-bold text-clay-muted uppercase">Série Max</div>
          </div>

          <div className="bg-creme-100 p-3.5 rounded-2xl border border-clay-border text-center">
            <Sparkles className="w-5 h-5 text-sage mx-auto mb-1" />
            <div className="text-2xl font-display font-extrabold text-clay">+{summary.score}</div>
            <div className="text-[11px] font-display font-bold text-clay-muted uppercase">XP Gagnée</div>
          </div>

          <div className="bg-creme-100 p-3.5 rounded-2xl border border-clay-border text-center">
            <CheckCircle2 className="w-5 h-5 text-lagon mx-auto mb-1" />
            <div className="text-2xl font-display font-extrabold text-clay">
              {summary.correctAnswers}/{summary.totalQuestions}
            </div>
            <div className="text-[11px] font-display font-bold text-clay-muted uppercase">Réussite</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <button
            onClick={() => {
              soundManager.playClick(520);
              onRestartSameConfig();
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-terracotta hover:bg-terracotta-hover border-b-[5px] border-b-terracotta-dark active:translate-y-[2px] active:border-b-2 text-white font-display font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition cursor-pointer btn-3d"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rejouer cette configuration</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick(440);
              onBackToConfig();
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-creme-50 border-2 border-clay-border border-b-[5px] border-b-clay-darkborder active:translate-y-[2px] active:border-b-2 text-clay font-display font-bold text-sm flex items-center justify-center gap-2.5 transition cursor-pointer btn-3d"
          >
            <Settings2 className="w-4 h-4 text-clay-muted" />
            <span>Changer de thématique</span>
          </button>
        </div>
      </div>

      {/* Review of Errors Section */}
      {incorrectRecords.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-base font-display font-bold text-clay">
            <BookOpen className="w-5 h-5 text-honey-dark" />
            <span>Points à consolider ({incorrectRecords.length})</span>
          </div>

          <div className="space-y-3">
            {incorrectRecords.map((r, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-clay-border rounded-3xl p-5 sm:p-6 space-y-3 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-display font-bold text-clay leading-snug">
                    {r.question.title}
                  </span>
                  <span className="text-[11px] font-display font-bold text-terracotta bg-terracotta-light px-2.5 py-0.5 rounded-lg border border-terracotta/20 shrink-0">
                    {r.question.contextTag}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-coral-light border border-coral/30 flex items-center gap-2.5 text-coral-dark font-medium">
                    <XCircle className="w-4 h-4 text-coral shrink-0" />
                    <span>Ta réponse : <strong>{r.question.options[r.selectedOptionIndex]}</strong></span>
                  </div>
                  <div className="p-3 rounded-2xl bg-sage-light border border-sage/30 flex items-center gap-2.5 text-sage-dark font-medium">
                    <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                    <span>Bonne réponse : <strong>{r.question.options[r.question.correctIndex]}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-clay-muted leading-relaxed bg-creme-100 p-3 rounded-2xl border border-clay-border">
                  💡 {r.question.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-sage-light border-2 border-sage/30 rounded-3xl p-7 text-center text-sm font-display font-bold text-sage-dark shadow-soft">
          🎉 <strong>Sans-faute splendide !</strong> Tu as trouvé l\'ensemble des réponses de cette session avec brio.
        </div>
      )}
    </div>
  );
};
