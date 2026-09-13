'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameSettings, MapClickTarget, RoundResult } from '../../types/game';
import { HeroicFranceMap } from '../map/HeroicFranceMap';
import { soundManager } from '../../lib/audio';
import { ArrowRight, CheckCircle2, XCircle, X } from 'lucide-react';

interface ModeMapClickerProps {
  settings: GameSettings;
  targets: MapClickTarget[];
  onFinishGame: (results: RoundResult[]) => void;
  onQuit: () => void;
}

export const ModeMapClicker: React.FC<ModeMapClickerProps> = ({
  settings,
  targets,
  onFinishGame,
  onQuit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [feedback, setFeedback] = useState<{ code: string; isCorrect: boolean } | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentTarget = targets[currentIndex];

  const handleMapClick = (clickedCode: string) => {
    if (isAnswered || !currentTarget) return;

    setIsAnswered(true);
    const isCorrect = clickedCode === currentTarget.code;

    if (isCorrect) {
      soundManager.playSuccess(combo);
      const points = 100 * combo;
      setScore((s) => s + points);
      setCombo((c) => Math.min(c + 1, 4));

      setFeedback({ code: clickedCode, isCorrect: true });
      setResults((prev) => [
        ...prev,
        {
          title: currentTarget.prompt,
          targetName: currentTarget.name,
          targetCode: currentTarget.code,
          isCorrect: true,
          scoreEarned: points,
        },
      ]);
    } else {
      soundManager.playError();
      setCombo(1);

      setFeedback({ code: clickedCode, isCorrect: false });
      setResults((prev) => [
        ...prev,
        {
          title: currentTarget.prompt,
          targetName: currentTarget.name,
          targetCode: currentTarget.code,
          isCorrect: false,
          scoreEarned: 0,
        },
      ]);
    }
  };

  const handleNext = useCallback(() => {
    soundManager.playClick(440);

    if (currentIndex + 1 >= targets.length) {
      onFinishGame(results);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setFeedback(null);
      setIsAnswered(false);
    }
  }, [currentIndex, targets.length, results, onFinishGame]);

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

  if (!currentTarget) return null;

  return (
    <div className="w-full max-w-4xl mx-auto h-full max-h-full flex flex-col justify-between gap-2 overflow-hidden select-none">
      {/* Top Floating Prompt HUD */}
      <div className="bg-white border border-clay-border/80 rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-sm flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick(400);
              if (confirm('Quitter la session en cours ?')) onQuit();
            }}
            className="p-2 rounded-xl bg-creme-100 hover:bg-creme-200 text-clay-muted hover:text-clay transition cursor-pointer"
            title="Quitter la partie"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-display font-extrabold text-clay">
              {currentTarget.prompt}
            </h2>
            {currentTarget.subPrompt && (
              <p className="text-xs text-clay-muted mt-0.5">
                {currentTarget.subPrompt}
              </p>
            )}
          </div>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-2.5 text-xs font-bold text-clay shrink-0">
          {combo > 1 && (
            <span className="text-honey-dark bg-honey-light px-2 py-0.5 rounded-lg border border-honey/30">
              x{combo}
            </span>
          )}
          <span className="text-clay-muted">
            {currentIndex + 1} / {targets.length}
          </span>
          <span className="text-terracotta">{score} pts</span>
        </div>
      </div>

      {/* Main Map Container (adapts dynamically to fill viewport) */}
      <div className="bg-white border border-clay-border/80 rounded-2xl p-2 sm:p-3 shadow-sm relative overflow-hidden flex-1 min-h-0 flex items-center justify-center">
        <HeroicFranceMap
          className="h-full w-auto max-h-full aspect-square"
          interactive={!isAnswered}
          selectionMode={currentTarget.code.length > 2 && !currentTarget.code.startsWith('97') && !currentTarget.code.startsWith('2') ? 'region' : 'department'}
          targetCode={currentTarget.code}
          feedbackState={feedback}
          activeRegion={settings.regionCode}
          onDepartmentClick={handleMapClick}
          onRegionClick={handleMapClick}
        />

        {/* Answer Reveal Floating Overlay at Bottom */}
        {isAnswered && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md">
            <div
              className={`p-3.5 rounded-2xl border shadow-md flex items-center justify-between gap-3 ${
                feedback?.isCorrect
                  ? 'bg-sage-light border-sage/40 text-sage-dark'
                  : 'bg-coral-light border-coral/40 text-coral-dark'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {feedback?.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-coral shrink-0" />
                )}
                <div className="truncate">
                  <div className="font-bold text-xs">
                    {feedback?.isCorrect ? 'Exact !' : 'Réponse attendue :'}
                  </div>
                  <div className="text-xs text-clay opacity-90 truncate font-medium">
                    {currentTarget.prefecture
                      ? `${currentTarget.name} (${currentTarget.code}) • Préfecture : ${currentTarget.prefecture}`
                      : `${currentTarget.name} (${currentTarget.code})`}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
              >
                <span>{currentIndex + 1 >= targets.length ? 'Bilan' : 'Suivant'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
