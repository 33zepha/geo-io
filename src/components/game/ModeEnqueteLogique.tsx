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
  const [mobilePane, setMobilePane] = useState<'clues' | 'map'>('clues');

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
          questionId: currentEnquete.id,
          title: `Enquête n°${currentIndex + 1}`,
          targetName: currentEnquete.targetName,
          targetCode: currentEnquete.targetCode,
          isCorrect: true,
          scoreEarned: earnedPoints,
          explanation: currentEnquete.explanation,
          userAnswerCode: clickedCode,
        },
      ]);
    } else {
      soundManager.playError();
      setRevealedCluesCount(currentEnquete.clues.length);
      setFeedback({ code: clickedCode, isCorrect: false });
      setResults((prev) => [
        ...prev,
        {
          questionId: currentEnquete.id,
          title: `Enquête n°${currentIndex + 1}`,
          targetName: currentEnquete.targetName,
          targetCode: currentEnquete.targetCode,
          isCorrect: false,
          scoreEarned: 0,
          explanation: currentEnquete.explanation,
          userAnswerCode: clickedCode,
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
      setMobilePane('clues');
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
    <div className="mx-auto flex h-full max-h-full w-full max-w-4xl select-none flex-col justify-between gap-2.5 overflow-hidden md:gap-3">
      {/* Top HUD */}
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
              Enquête #{currentIndex + 1} : Trouve le territoire mystère
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] font-bold text-clay md:flex-row md:items-center md:gap-3 md:text-xs">
          <span className="text-clay-muted">
            {currentIndex + 1} / {enquetes.length}
          </span>
          <span className="text-terracotta">{score} pts</span>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 rounded-xl border border-clay-border bg-creme-100 p-1 text-xs font-bold md:hidden">
        <button
          type="button"
          onClick={() => setMobilePane('clues')}
          aria-pressed={mobilePane === 'clues'}
          className={`min-h-11 rounded-lg px-3 transition ${mobilePane === 'clues' ? 'bg-white text-clay shadow-xs' : 'text-clay-muted'}`}
        >
          Indices ({revealedCluesCount}/{currentEnquete.clues.length})
        </button>
        <button
          type="button"
          onClick={() => setMobilePane('map')}
          aria-pressed={mobilePane === 'map'}
          className={`min-h-11 rounded-lg px-3 transition ${mobilePane === 'map' ? 'bg-white text-terracotta shadow-xs' : 'text-clay-muted'}`}
        >
          Carte
        </button>
      </div>

      {/* Middle Stage: Split Clues (left) & Map (right) */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 gap-2.5 md:grid-cols-5 md:gap-3">
        {/* Clues Card (Left 2 cols) */}
        <div className={`${mobilePane === 'clues' ? 'flex' : 'hidden'} min-h-0 flex-col gap-2.5 overflow-hidden rounded-2xl border border-clay-border/80 bg-white p-3 shadow-sm md:col-span-2 md:flex md:max-h-none md:p-4`}>
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
                    setMobilePane('map');
                    setRevealedCluesCount(currentEnquete.clues.length);
                    setResults((prev) => [
                      ...prev,
                      {
                        questionId: currentEnquete.id,
                        title: `Enquête : ${currentEnquete.targetName}`,
                        targetName: currentEnquete.targetName,
                        targetCode: currentEnquete.targetCode,
                        isCorrect: false,
                        scoreEarned: 0,
                        explanation: currentEnquete.explanation,
                        userAnswer: 'Passé',
                        userAnswerCode: null,
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
        <div className={`${mobilePane === 'map' ? 'flex' : 'hidden'} relative min-h-0 flex-col items-stretch justify-center overflow-hidden rounded-2xl border border-clay-border/80 bg-white p-1.5 shadow-sm md:col-span-3 md:flex md:flex-row md:items-center md:p-2`}>
          <HeroicFranceMap
            className="min-h-0 w-full flex-1 md:h-full md:max-h-full md:max-w-full"
            interactive={!isAnswered}
            targetCode={currentEnquete.targetCode}
            feedbackState={feedback}
            activeRegion={settings.regionCode}
            onDepartmentClick={handleMapClick}
          />

          {/* Mobile reveal stays in the layout so names and regions can wrap. */}
          {isAnswered && (
            <div className="relative z-40 mt-2 w-full shrink-0 md:absolute md:bottom-3 md:left-1/2 md:mt-0 md:w-[min(94%,24rem)] md:-translate-x-1/2">
              <div
                className={`flex flex-col items-stretch gap-3 rounded-xl border p-3 shadow-md md:flex-row md:items-center md:justify-between ${
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
                  <div className="min-w-0">
                    <div className="font-bold text-xs">
                      {feedback?.isCorrect ? 'Exact !' : 'Territoire mystère :'}
                    </div>
                    <div className="break-words text-xs font-medium text-clay opacity-90">
                      {currentEnquete.targetName} ({currentEnquete.targetCode}) • {currentEnquete.regionName}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-1 self-end rounded-xl bg-terracotta px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-terracotta-hover"
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
