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
          questionId: currentQ.id,
          title: currentQ.title,
          targetName: currentQ.options[currentQ.correctIndex],
          targetCode: currentQ.targetCode,
          isCorrect: true,
          scoreEarned: 100,
          explanation: currentQ.explanation,
          userAnswerCode: currentQ.options[idx],
        },
      ]);
    } else {
      soundManager.playError();
      setResults((prev) => [
        ...prev,
        {
          questionId: currentQ.id,
          title: currentQ.title,
          targetName: currentQ.options[currentQ.correctIndex],
          targetCode: currentQ.targetCode,
          isCorrect: false,
          scoreEarned: 0,
          explanation: currentQ.explanation,
          userAnswer: currentQ.options[idx],
          userAnswerCode: currentQ.options[idx],
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
    <div className="mx-auto flex h-full max-h-full w-full max-w-4xl select-none flex-col justify-between gap-2.5 overflow-y-auto overscroll-contain md:gap-3 md:overflow-hidden">
      {/* Top Question HUD */}
      <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-clay-border/80 bg-white px-3 py-2.5 shadow-sm md:px-5 md:py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick(400);
              if (confirm('Quitter la session en cours ?')) onQuit();
            }}
            className="touch-target flex shrink-0 items-center justify-center rounded-xl bg-creme-100 p-2 text-clay-muted transition hover:bg-creme-200 hover:text-clay cursor-pointer"
            title="Quitter la partie"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="break-words font-display text-sm font-extrabold leading-snug text-clay md:text-base">
              {currentQ.title}
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] font-bold text-clay md:flex-row md:items-center md:gap-3 md:text-xs">
          <span className="text-clay-muted">
            {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-terracotta">{score} pts</span>
        </div>
      </div>

      {/* Main Map Display */}
      <div className="relative flex min-h-[12rem] flex-1 flex-col items-stretch justify-center overflow-hidden rounded-2xl border border-clay-border/80 bg-white p-1.5 shadow-sm md:min-h-0 md:flex-row md:items-center md:p-2">
        <HeroicFranceMap
          className="min-h-0 w-full flex-1 md:h-full md:max-h-full md:max-w-full"
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

        {/* On mobile the answer stays in the flow so its full text remains readable. */}
        {isAnswered && (
          <div className="relative z-40 mt-2 w-full shrink-0 md:absolute md:bottom-3 md:left-1/2 md:mt-0 md:w-[min(94%,28rem)] md:-translate-x-1/2">
            <div className="flex flex-col items-stretch gap-3 rounded-xl border border-clay-border bg-white/95 p-3 shadow-md backdrop-blur-md md:flex-row md:items-center md:justify-between">
              <p className="break-words text-xs font-medium leading-snug text-clay">
                💡 {currentQ.explanation}
              </p>
              <button
                onClick={handleNext}
                className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 self-end rounded-xl bg-terracotta px-4 py-2.5 text-xs font-bold text-white transition hover:bg-terracotta-hover"
              >
                <span>{currentIndex + 1 >= questions.length ? 'Bilan' : 'Suivant'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4 Clean Options Grid */}
      <div className="sticky bottom-0 z-30 grid shrink-0 grid-cols-2 gap-2 bg-[#FAF7F2] pb-0.5 md:static md:gap-2.5 md:bg-transparent md:pb-0">
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
              className={`flex min-h-[3.25rem] cursor-pointer items-center justify-between rounded-xl p-3.5 text-left transition select-none ${btnStyle}`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] font-mono font-bold ${badgeStyle}`}>
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1 break-words text-xs font-semibold leading-snug text-clay md:text-sm">{opt}</span>
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
