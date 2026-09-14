'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameSettings, MapClickTarget, RoundResult } from '../../types/game';
import { DEPARTMENTS } from '../../data/departments';
import { HeroicFranceMap } from '../map/HeroicFranceMap';
import { soundManager } from '../../lib/audio';
import { ArrowRight, CheckCircle2, XCircle, X, Timer } from 'lucide-react';

interface ModeMapClickerProps {
  settings: GameSettings;
  targets: MapClickTarget[];
  onFinishGame: (results: RoundResult[]) => void;
  onQuit: () => void;
}

const IDF_CODES = new Set(['75', '77', '78', '91', '92', '93', '94', '95']);
const EXPERT_SECONDS = 15;

function sameRegionNearMiss(clicked: string, target: string): boolean {
  const a = DEPARTMENTS[clicked];
  const b = DEPARTMENTS[target];
  if (!a || !b) return false;
  return a.regionCode === b.regionCode && clicked !== target;
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
  const [nearMiss, setNearMiss] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXPERT_SECONDS);
  const resultsRef = useRef(results);
  resultsRef.current = results;

  const currentTarget = targets[currentIndex];
  const isExpertTimed = settings.difficulty === 'expert';
  const showIdfHint = Boolean(currentTarget && IDF_CODES.has(currentTarget.code));

  const resolveAnswer = useCallback(
    (clickedCode: string | null, timedOut = false) => {
      if (isAnswered || !currentTarget) return;

      setIsAnswered(true);
      const isCorrect = clickedCode === currentTarget.code;
      const near = clickedCode ? sameRegionNearMiss(clickedCode, currentTarget.code) : false;
      setNearMiss(near && !isCorrect);

      if (isCorrect) {
        soundManager.playSuccess(combo);
        let points = 100 * combo;
        if (isExpertTimed && timeLeft >= 8) points += 25;
        setScore((s) => s + points);
        setCombo((c) => Math.min(c + 1, 4));
        setFeedback({ code: clickedCode!, isCorrect: true });
        setResults((prev) => [
          ...prev,
          {
            title: currentTarget.prompt,
            targetName: currentTarget.name,
            targetCode: currentTarget.code,
            isCorrect: true,
            scoreEarned: points,
            explanation: currentTarget.hint || currentTarget.subPrompt,
          },
        ]);
      } else {
        soundManager.playError();
        setCombo(1);
        setFeedback({ code: clickedCode || currentTarget.code, isCorrect: false });
        const nearNote = near
          ? ` Presque : même région (${DEPARTMENTS[clickedCode!]?.regionName}).`
          : '';
        const timeoutNote = timedOut ? ' Temps écoulé.' : '';
        setResults((prev) => [
          ...prev,
          {
            title: currentTarget.prompt,
            targetName: currentTarget.name,
            targetCode: currentTarget.code,
            isCorrect: false,
            scoreEarned: 0,
            explanation: `${currentTarget.hint || `${currentTarget.name} (${currentTarget.code})`}.${nearNote}${timeoutNote}`,
            userAnswer: clickedCode
              ? DEPARTMENTS[clickedCode]?.name || clickedCode
              : 'Temps écoulé',
          },
        ]);
      }
    },
    [isAnswered, currentTarget, combo, isExpertTimed, timeLeft]
  );

  const handleMapClick = (clickedCode: string) => {
    resolveAnswer(clickedCode, false);
  };

  const handleNext = useCallback(() => {
    soundManager.playClick(440);
    if (currentIndex + 1 >= targets.length) {
      onFinishGame(resultsRef.current);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setFeedback(null);
      setIsAnswered(false);
      setNearMiss(false);
      setTimeLeft(EXPERT_SECONDS);
    }
  }, [currentIndex, targets.length, onFinishGame]);

  useEffect(() => {
    if (!isExpertTimed || isAnswered || !currentTarget) return;
    setTimeLeft(EXPERT_SECONDS);
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [currentIndex, isExpertTimed, isAnswered, currentTarget]);

  useEffect(() => {
    if (isExpertTimed && timeLeft === 0 && !isAnswered) {
      resolveAnswer(null, true);
    }
  }, [timeLeft, isExpertTimed, isAnswered, resolveAnswer]);

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
    <div className="mx-auto flex h-full max-h-full w-full max-w-4xl select-none flex-col justify-between gap-2 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-clay-border/80 bg-white px-3.5 py-2 shadow-sm sm:px-4 sm:py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(400);
              if (confirm('Quitter la session en cours ?')) onQuit();
            }}
            className="cursor-pointer rounded-xl bg-creme-100 p-2 text-clay-muted transition hover:bg-creme-200 hover:text-clay"
            title="Quitter la partie"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-extrabold text-clay sm:text-lg">
              {currentTarget.prompt}
            </h2>
            {currentTarget.subPrompt && (
              <p className="mt-0.5 truncate text-xs text-clay-muted">{currentTarget.subPrompt}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 text-xs font-bold text-clay">
          {isExpertTimed && !isAnswered && (
            <span
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 ${
                timeLeft <= 5
                  ? 'border-coral/40 bg-coral-light text-coral-dark'
                  : 'border-honey/30 bg-honey-light text-honey-dark'
              }`}
            >
              <Timer className="h-3 w-3" />
              {timeLeft}s
            </span>
          )}
          {combo > 1 && (
            <span className="rounded-lg border border-honey/30 bg-honey-light px-2 py-0.5 text-honey-dark">
              x{combo}
            </span>
          )}
          <span className="text-clay-muted">
            {currentIndex + 1} / {targets.length}
          </span>
          <span className="text-terracotta">{score} pts</span>
        </div>
      </div>

      {showIdfHint && !isAnswered && (
        <div className="shrink-0 rounded-xl border border-honey/30 bg-honey-light px-3 py-1.5 text-center text-[11px] font-semibold text-honey-dark">
          Cible en Île-de-France — utilise la Loupe Paris sur la carte.
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-clay-border/80 bg-white p-2 shadow-sm sm:p-3">
        {isExpertTimed && !isAnswered && (
          <div className="absolute left-3 right-3 top-2 z-30 h-1.5 overflow-hidden rounded-full bg-creme-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-terracotta to-honey transition-[width] duration-1000 ease-linear"
              style={{ width: `${(timeLeft / EXPERT_SECONDS) * 100}%` }}
            />
          </div>
        )}

        <HeroicFranceMap
          className="h-full max-h-full w-full max-w-full"
          interactive={!isAnswered}
          selectionMode="department"
          targetCode={isAnswered ? currentTarget.code : null}
          feedbackState={feedback}
          activeRegion={settings.regionCode}
          onDepartmentClick={handleMapClick}
          onRegionClick={handleMapClick}
        />

        {isAnswered && (
          <div className="absolute bottom-14 left-1/2 z-40 w-[92%] max-w-md -translate-x-1/2 sm:bottom-4">
            <div
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-md ${
                feedback?.isCorrect
                  ? 'border-sage/40 bg-sage-light text-sage-dark'
                  : 'border-coral/40 bg-coral-light text-coral-dark'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {feedback?.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-sage" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-coral" />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold">
                    {feedback?.isCorrect
                      ? 'Exact !'
                      : nearMiss
                        ? 'Même région — presque !'
                        : 'Réponse attendue :'}
                  </div>
                  <div className="truncate text-xs font-medium text-clay opacity-90">
                    {currentTarget.prefecture
                      ? `${currentTarget.name} (${currentTarget.code}) • ${currentTarget.prefecture}`
                      : `${currentTarget.name} (${currentTarget.code})`}
                  </div>
                  {!feedback?.isCorrect && currentTarget.hint && (
                    <div className="mt-0.5 truncate text-[11px] text-clay-muted">
                      Indice : {currentTarget.hint}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-terracotta px-4 py-2 text-xs font-bold text-white transition hover:bg-terracotta-hover"
              >
                <span>{currentIndex + 1 >= targets.length ? 'Bilan' : 'Suivant'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
