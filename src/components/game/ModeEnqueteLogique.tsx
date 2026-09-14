'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameSettings, EnqueteTerritoire, RoundResult } from '../../types/game';
import { HeroicFranceMap } from '../map/HeroicFranceMap';
import { soundManager } from '../../lib/audio';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  X, 
  HelpCircle
} from 'lucide-react';

interface ModeEnqueteLogiqueProps {
  settings: GameSettings;
  enquetes: EnqueteTerritoire[];
  onFinishGame: (results: RoundResult[]) => void;
  onQuit: () => void;
}

export const ModeEnqueteLogique: React.FC<ModeEnqueteLogiqueProps> = ({
  settings,
  enquetes,
  onFinishGame,
  onQuit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCluesCount, setRevealedCluesCount] = useState(1);
  const [feedback, setFeedback] = useState<{ code: string; isCorrect: boolean } | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);

  const currentEnquete = enquetes[currentIndex];

  const handleRevealNextClue = () => {
    if (revealedCluesCount < currentEnquete.clues.length) {
      soundManager.playClick(460);
      setRevealedCluesCount((prev) => prev + 1);
    }
  };

  const handleMapClick = (clickedCode: string) => {
    if (isAnswered || !currentEnquete) return;

    setIsAnswered(true);
    const isCorrect = clickedCode === currentEnquete.targetCode;

    const pointsScale = [300, 200, 120, 60];
    const earnedPoints = isCorrect ? (pointsScale[revealedCluesCount - 1] || 60) : 0;

    if (isCorrect) {
      soundManager.playSuccess(3);
      setScore((s) => s + earnedPoints);
      setFeedback({ code: clickedCode, isCorrect: true });
      setResults((prev) => [
        ...prev,
        {
          title: `Enquête n°${currentIndex + 1}`,
          targetName: currentEnquete.targetName,
          targetCode: currentEnquete.targetCode,
          isCorrect: true,
          scoreEarned: earnedPoints,
          explanation: currentEnquete.explanation,
        },
      ]);
    } else {
      soundManager.playError();
      setRevealedCluesCount(currentEnquete.clues.length);
      setFeedback({ code: clickedCode, isCorrect: false });
      setResults((prev) => [
        ...prev,
        {
          title: `Enquête n°${currentIndex + 1}`,
          targetName: currentEnquete.targetName,
          targetCode: currentEnquete.targetCode,
          isCorrect: false,
          scoreEarned: 0,
          explanation: currentEnquete.explanation,
        },
      ]);
    }
  };

  const handleNext = useCallback(() => {
    soundManager.playClick(440);

    if (currentIndex + 1 >= enquetes.length) {
      onFinishGame(results);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setRevealedCluesCount(1);
      setFeedback(null);
      setIsAnswered(false);
    }
  }, [currentIndex, enquetes.length, results, onFinishGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (isAnswered && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, handleNext]);

  if (!currentEnquete) return null;

  return (
    <div className="mx-auto flex h-full max-h-full w-full max-w-4xl select-none flex-col justify-between gap-2.5 overflow-hidden sm:gap-3">
      {/* Top HUD */}
      <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-clay-border/80 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-3">
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
          <div className="min-w-0">
            <h2 className="truncate font-display text-sm font-extrabold text-clay sm:text-base">
              Enquête #{currentIndex + 1} : Trouve le territoire mystère
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-xs font-bold text-clay">
          <span className="text-clay-muted">
            {currentIndex + 1} / {enquetes.length}
          </span>
          <span className="text-terracotta">{score} pts</span>
        </div>
      </div>

      {/* Middle Stage: Split Clues (left) & Map (right) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,38%)_minmax(0,1fr)] gap-2.5 overflow-hidden md:grid-cols-5 md:grid-rows-1 md:gap-3">
        {/* Clues Card (Left 2 cols) */}
        <div className="flex min-h-0 flex-col gap-2.5 overflow-hidden rounded-2xl border border-clay-border/80 bg-white p-3.5 shadow-sm md:col-span-2 md:max-h-none sm:p-4">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-clay-border/60 pb-2.5">
            <span className="text-xs font-bold text-clay">
              Indices ({revealedCluesCount}/{currentEnquete.clues.length})
            </span>

            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {!isAnswered && (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick(380);
                    setFeedback({ code: currentEnquete.targetCode, isCorrect: false });
                    setIsAnswered(true);
                    setRevealedCluesCount(currentEnquete.clues.length);
                    setResults((prev) => [
                      ...prev,
                      {
                        title: `Enquête : ${currentEnquete.targetName}`,
                        targetName: currentEnquete.targetName,
                        targetCode: currentEnquete.targetCode,
                        isCorrect: false,
                        scoreEarned: 0,
                        explanation: currentEnquete.explanation,
                        userAnswer: 'Passé',
                      },
                    ]);
                  }}
                  className="min-h-11 px-3 py-2 rounded-xl border border-clay-border bg-white text-clay-muted text-xs font-bold hover:bg-creme-100"
                >
                  Passer
                </button>
              )}
              {!isAnswered && revealedCluesCount < currentEnquete.clues.length && (
                <button
                  onClick={handleRevealNextClue}
                  className="min-h-11 px-3 py-2 rounded-xl bg-creme-100 hover:bg-creme-200 border border-clay-border text-clay text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-terracotta" />
                  <span>+ Indice</span>
                </button>
              )}
            </div>
          </div>

          {/* List of Revealed Clues (Scrollable inside card if needed) */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
            {currentEnquete.clues.slice(0, revealedCluesCount).map((clue, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-creme-100/80 border border-clay-border/60 space-y-0.5"
              >
                <div className="text-[11px] font-bold text-terracotta">
                  {clue.label}
                </div>
                <p className="text-xs text-clay leading-snug">
                  {clue.text}
                </p>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-clay-subtle font-medium text-center shrink-0 pt-1 border-t border-clay-border/40">
            {isAnswered ? 'Manche terminée' : 'Clique sur la carte pour désigner le département'}
          </div>
        </div>

        {/* Map Container (Right 3 cols) */}
        <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-2xl border border-clay-border/80 bg-white p-1.5 shadow-sm md:col-span-3 sm:p-2">
          <HeroicFranceMap
            className="w-full h-full max-w-full max-h-full"
            interactive={!isAnswered}
            targetCode={currentEnquete.targetCode}
            feedbackState={feedback}
            activeRegion={settings.regionCode}
            onDepartmentClick={handleMapClick}
          />

          {/* Answer Reveal Floating Overlay */}
          {isAnswered && (
            <div className="absolute bottom-[8.5rem] left-1/2 z-40 w-[min(94%,24rem)] -translate-x-1/2 sm:bottom-3">
              <div
                className={`p-3 rounded-xl border shadow-md flex items-center justify-between gap-3 ${
                  feedback?.isCorrect
                    ? 'bg-sage-light border-sage/40 text-sage-dark'
                    : 'bg-coral-light border-coral/40 text-coral-dark'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {feedback?.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-coral shrink-0" />
                  )}
                  <div className="truncate">
                    <div className="font-bold text-xs">
                      {feedback?.isCorrect ? 'Exact !' : 'Territoire mystère :'}
                    </div>
                    <div className="text-xs text-clay opacity-90 truncate font-medium">
                      {currentEnquete.targetName} ({currentEnquete.targetCode}) • {currentEnquete.regionName}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="px-3.5 py-1.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs flex items-center gap-1 shrink-0 transition cursor-pointer"
                >
                  <span>{currentIndex + 1 >= enquetes.length ? 'Bilan' : 'Suivant'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
