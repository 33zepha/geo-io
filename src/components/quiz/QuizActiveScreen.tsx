'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { QuizConfig, QuizQuestion, AnswerRecord } from '../../types/quiz';
import { QuizMapContext } from './QuizMapContext';
import { soundManager } from '../../lib/audio';
import { 
  Heart, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  X,
  Keyboard,
  Sparkles
} from 'lucide-react';

interface QuizActiveScreenProps {
  config: QuizConfig;
  questions: QuizQuestion[];
  onFinishQuiz: (records: AnswerRecord[]) => void;
  onQuitQuiz: () => void;
}

export const QuizActiveScreen: React.FC<QuizActiveScreenProps> = ({
  config,
  questions,
  onFinishQuiz,
  onQuitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [questionStartTime, setQuestionStartTime] = useState<number>(() => Date.now());

  const currentQ = questions[currentIndex];

  const handleSelectOption = useCallback((idx: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    const timeSpent = Date.now() - questionStartTime;

    const newRecord: AnswerRecord = {
      question: currentQ,
      selectedOptionIndex: idx,
      isCorrect,
      timeSpentMs: timeSpent,
    };

    setRecords((prev) => [...prev, newRecord]);

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      soundManager.playSuccess(Math.min(nextStreak, 5));
    } else {
      setStreak(0);
      soundManager.playError();
      if (config.format === 'survival_3_lives') {
        setLives((prev) => prev - 1);
      }
    }
  }, [isAnswered, currentQ, questionStartTime, streak, config.format]);

  const handleNext = useCallback(() => {
    soundManager.playClick();

    const isGameOver = config.format === 'survival_3_lives' && lives <= 0;
    const isLastQuestion = currentIndex + 1 >= questions.length;

    if (isGameOver || isLastQuestion) {
      onFinishQuiz(records);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setQuestionStartTime(Date.now());
    }
  }, [config.format, lives, currentIndex, questions.length, records, onFinishQuiz]);

  // Keyboard navigation hook (1, 2, 3, 4 and Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isAnswered) {
        if (e.key === '1' || e.key === 'a' || e.key === 'A') handleSelectOption(0);
        else if (e.key === '2' || e.key === 'b' || e.key === 'B') handleSelectOption(1);
        else if (e.key === '3' || e.key === 'c' || e.key === 'C') handleSelectOption(2);
        else if (e.key === '4' || e.key === 'd' || e.key === 'D') handleSelectOption(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, handleSelectOption, handleNext]);

  if (!currentQ) return null;

  const isCorrect = selectedOption === currentQ.correctIndex;
  const isSurvival = config.format === 'survival_3_lives';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between bg-white border border-clay-border rounded-2xl px-5 py-3 shadow-soft">
        {/* Left: Quit & Category Tag */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              if (confirm('Quitter la session en cours ?')) onQuitQuiz();
            }}
            className="p-2 rounded-xl bg-creme-200 hover:bg-creme-300 text-clay-muted hover:text-clay transition cursor-pointer"
            title="Quitter le quiz"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-xs font-display font-bold text-terracotta bg-terracotta-light px-3 py-1 rounded-xl border border-terracotta/20">
            {currentQ.contextTag}
          </span>
        </div>

        {/* Center: Progress Indicator or Lives */}
        <div className="flex items-center gap-4">
          {isSurvival ? (
            <div className="flex items-center gap-1.5 bg-coral-light px-3 py-1.5 rounded-xl border border-coral/20">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-transform ${
                    i < lives
                      ? 'text-coral fill-coral animate-bounce-gentle'
                      : 'text-clay-subtle/30 fill-clay-subtle/20 scale-90'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-display font-bold text-clay-muted">
                Question <strong className="text-clay font-extrabold text-sm">{currentIndex + 1}</strong> / {questions.length}
              </span>
              <div className="w-28 bg-creme-200 rounded-full h-2 overflow-hidden border border-clay-border/60">
                <div
                  className="bg-gradient-to-r from-terracotta to-honey h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Streak & Keyboard Shortcut Hint */}
        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1.5 text-xs font-display font-bold text-honey-dark bg-honey-light px-3 py-1 rounded-xl border border-honey/30 animate-bounce-gentle">
              <Flame className="w-4 h-4 fill-honey text-honey" />
              <span>{streak} d\'affilée</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-clay-subtle bg-creme-200/60 px-2.5 py-1 rounded-lg border border-clay-border/50">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Touches 1-4</span>
          </div>
        </div>
      </div>

      {/* Main Dual Area: Question on Left, Map on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Question, 3D Options & Explanations */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-clay-border rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
            {/* Question Header */}
            <div>
              {currentQ.subtitle && (
                <div className="text-xs font-display font-semibold text-terracotta mb-1">
                  {currentQ.subtitle}
                </div>
              )}
              <h2 className="text-xl sm:text-2xl font-extrabold text-clay font-display leading-snug">
                {currentQ.title}
              </h2>
            </div>

            {/* 4 Tactile 3D Buttons */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'bg-white border-2 border-clay-border border-b-[5px] border-b-clay-darkborder hover:border-terracotta/40 hover:bg-creme-50 text-clay active:translate-y-[2px] active:border-b-2';
                let badgeStyle = 'bg-creme-200 text-clay-muted border-clay-border';

                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle = 'bg-sage-light border-2 border-sage border-b-[5px] border-b-sage-dark text-sage-dark font-bold shadow-sm';
                    badgeStyle = 'bg-sage text-white border-sage-dark';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-coral-light border-2 border-coral border-b-[5px] border-b-coral-dark text-coral-dark font-bold';
                    badgeStyle = 'bg-coral text-white border-coral-dark';
                  } else {
                    btnStyle = 'bg-creme-100/60 border border-clay-border/60 text-clay-subtle opacity-50 cursor-not-allowed';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => {
                      soundManager.playClick(380 + idx * 45);
                      handleSelectOption(idx);
                    }}
                    className={`w-full p-4 rounded-2xl text-left transition-all duration-100 flex items-center justify-between cursor-pointer btn-3d select-none ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${badgeStyle}`}>
                        {idx + 1}
                      </span>
                      <span className="text-sm sm:text-base font-semibold truncate leading-tight">
                        {opt}
                      </span>
                    </div>

                    {isAnswered && idx === currentQ.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 text-sage shrink-0 ml-2" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <XCircle className="w-5 h-5 text-coral shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Pedagogical Memo Box */}
            {isAnswered && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-200 border-t border-clay-border/80">
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${
                    isCorrect
                      ? 'bg-sage-light border-sage/30 text-sage-dark'
                      : 'bg-coral-light border-coral/30 text-coral-dark'
                  }`}
                >
                  <div className="p-1.5 rounded-xl bg-white shrink-0 shadow-sm">
                    <BookOpen className="w-4 h-4 text-current" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm mb-0.5">
                      {isCorrect ? 'Bravo, bien vu !' : 'À retenir pour briller :'}
                    </div>
                    <p className="text-clay opacity-90">{currentQ.explanation}</p>
                  </div>
                </div>

                {/* 3D Continue Button */}
                <button
                  onClick={handleNext}
                  className="w-full py-4 px-6 rounded-2xl bg-terracotta hover:bg-terracotta-hover border-b-[5px] border-b-terracotta-dark active:translate-y-[2px] active:border-b-2 text-white font-display font-bold text-base flex items-center justify-center gap-3 shadow-md transition cursor-pointer btn-3d"
                >
                  <span>
                    {isSurvival && lives <= 0
                      ? 'Découvrir le bilan'
                      : currentIndex + 1 >= questions.length
                      ? 'Voir mes résultats finaux'
                      : 'Question Suivante (Entrée)'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Pastel Plateau Map Visualizer */}
        <div className="lg:col-span-5 bg-white border border-clay-border rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between text-xs font-display font-bold text-clay-muted mb-2 px-1">
            <span>Repère sur la Carte</span>
            <span className="text-terracotta flex items-center gap-1 font-mono text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              Plateau de France
            </span>
          </div>

          <QuizMapContext
            targetCode={currentQ.targetDepartmentCode}
            relatedCodes={currentQ.relatedDepartmentCodes}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
          />
        </div>
      </div>
    </div>
  );
};
