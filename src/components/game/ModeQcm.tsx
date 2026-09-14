'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameSettings, QcmQuestion, RoundResult } from '../../types/game';
import { HeroicFranceMap } from '../map/HeroicFranceMap';
import { soundManager } from '../../lib/audio';
import { CheckCircle2, XCircle, ArrowRight, X } from 'lucide-react';

interface ModeQcmProps {
  settings: GameSettings;
  questions: QcmQuestion[];
  onFinishGame: (results: RoundResult[]) => void;
  onQuit: () => void;
}

export const ModeQcm: React.FC<ModeQcmProps> = ({
  settings,
  questions,
  onFinishGame,
  onQuit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = useCallback((idx: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;

    if (isCorrect) {
      soundManager.playSuccess(2);
      setScore((s) => s + 100);
      setResults((prev) => [
        ...prev,
        {
          title: currentQ.title,
          targetName: currentQ.options[currentQ.correctIndex],
          targetCode: currentQ.targetCode,
          isCorrect: true,
          scoreEarned: 100,
          explanation: currentQ.explanation,
        },
      ]);
    } else {
      soundManager.playError();
      setResults((prev) => [
        ...prev,
        {
          title: currentQ.title,
          targetName: currentQ.options[currentQ.correctIndex],
          targetCode: currentQ.targetCode,
          isCorrect: false,
          scoreEarned: 0,
          explanation: currentQ.explanation,
          userAnswer: currentQ.options[idx],
        },
      ]);
    }
  }, [isAnswered, currentQ]);

  const handleNext = useCallback(() => {
    soundManager.playClick(440);

    if (currentIndex + 1 >= questions.length) {
      onFinishGame(results);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  }, [currentIndex, questions.length, results, onFinishGame]);

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

  return (
    <div className="w-full max-w-4xl mx-auto h-full max-h-full flex flex-col justify-between gap-2 overflow-hidden select-none">
      {/* Top Question HUD */}
      <div className="bg-white border border-clay-border/80 rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-sm flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => {
              soundManager.playClick(400);
              if (confirm('Quitter la session en cours ?')) onQuit();
            }}
            className="p-1.5 rounded-lg bg-creme-100 hover:bg-creme-200 text-clay-muted hover:text-clay transition cursor-pointer shrink-0"
            title="Quitter la partie"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="truncate">
            <h2 className="text-sm sm:text-base font-display font-extrabold text-clay truncate">
              {currentQ.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-clay shrink-0">
          <span className="text-clay-muted">
            {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-terracotta">{score} pts</span>
        </div>
      </div>

      {/* Main Map Display */}
      <div className="bg-white border border-clay-border/80 rounded-2xl p-2 shadow-sm relative overflow-hidden flex-1 min-h-0 flex items-center justify-center">
        <HeroicFranceMap
          className="w-full h-full max-w-full max-h-full"
          interactive={false}
          targetCode={isAnswered ? currentQ.targetCode : null}
          highlightCodes={isAnswered ? currentQ.relatedCodes || [] : []}
          activeRegion={settings.regionCode}
          feedbackState={
            isAnswered
              ? {
                  code: currentQ.targetCode,
                  isCorrect: selectedOption === currentQ.correctIndex,
                }
              : null
          }
        />

        {/* Floating Answer Explanation & Next Button inside Map */}
        {isAnswered && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg">
            <div className="p-3 rounded-xl bg-white/95 backdrop-blur-md border border-clay-border shadow-md flex items-center justify-between gap-3">
              <p className="text-xs text-clay leading-snug font-medium line-clamp-4 sm:line-clamp-none">
                💡 {currentQ.explanation}
              </p>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
              >
                <span>{currentIndex + 1 >= questions.length ? 'Bilan' : 'Suivant'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4 Clean Options Grid */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        {currentQ.options.map((opt, idx) => {
          let btnStyle = 'bg-white border border-clay-border border-b-2 hover:border-terracotta/40 hover:bg-creme-50 text-clay active:translate-y-[1px]';
          let badgeStyle = 'bg-creme-100 text-clay-muted border-clay-border';

          if (isAnswered) {
            if (idx === currentQ.correctIndex) {
              btnStyle = 'bg-sage-light border border-sage border-b-2 text-sage-dark font-bold shadow-xs';
              badgeStyle = 'bg-sage text-white border-sage';
            } else if (idx === selectedOption) {
              btnStyle = 'bg-coral-light border border-coral border-b-2 text-coral-dark font-bold';
              badgeStyle = 'bg-coral text-white border-coral';
            } else {
              btnStyle = 'bg-creme-100/40 border border-clay-border/40 text-clay-subtle opacity-40 cursor-not-allowed';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`p-2.5 sm:p-3 rounded-xl text-left transition cursor-pointer flex items-center justify-between select-none ${btnStyle}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-5 h-5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center border shrink-0 ${badgeStyle}`}>
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-clay truncate">{opt}</span>
              </div>

              {isAnswered && idx === currentQ.correctIndex && (
                <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
              )}
              {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                <XCircle className="w-4 h-4 text-coral shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
