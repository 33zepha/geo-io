'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SilhouetteRound } from '../../lib/modesEngine';
import { RoundResult } from '../../types/game';
import { getDeptGrammar } from '../../data/departmentGrammar';
import { soundManager } from '../../lib/audio';
import { CheckCircle2, XCircle, ArrowRight, X } from 'lucide-react';

interface ModeSilhouetteProps {
  rounds: SilhouetteRound[];
  onFinishGame: (results: RoundResult[]) => void;
  onQuit: () => void;
}

export const ModeSilhouette: React.FC<ModeSilhouetteProps> = ({
  rounds,
  onFinishGame,
  onQuit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);

  const currentRound = rounds[currentIndex];

  const handleSelectOption = useCallback((idx: number) => {
    if (isAnswered || !currentRound) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentRound.correctIndex;
    const targetDept = currentRound.targetDept;
    const targetGrammar = getDeptGrammar(targetDept.code);

    if (isCorrect) {
      soundManager.playSuccess(2);
      setScore((s) => s + Math.max(50, 100 - (showHint ? 25 : 0)));
      setResults((prev) => [
        ...prev,
        {
          questionId: `silhouette-${targetDept.code}-${currentIndex}`,
          title: `Silhouette : ${targetGrammar.withArticle}`,
          targetName: targetDept.name,
          targetCode: targetDept.code,
          isCorrect: true,
          scoreEarned: Math.max(50, 100 - (showHint ? 25 : 0)),
          explanation: `C'est bien ${targetGrammar.withArticle} (${targetDept.code}), préfecture : ${targetDept.prefecture}.`,
          userAnswerCode: currentRound.options[idx].code,
        },
      ]);
    } else {
      soundManager.playError();
      setResults((prev) => [
        ...prev,
        {
          questionId: `silhouette-${targetDept.code}-${currentIndex}`,
          title: `Silhouette : ${targetGrammar.withArticle}`,
          targetName: targetDept.name,
          targetCode: targetDept.code,
          isCorrect: false,
          scoreEarned: 0,
          explanation: `C'était ${targetGrammar.withArticle} (${targetDept.code}), préfecture : ${targetDept.prefecture}.`,
          userAnswer: currentRound.options[idx].name,
          userAnswerCode: currentRound.options[idx].code,
        },
      ]);
    }
  }, [isAnswered, currentRound]);

  const handleNext = useCallback(() => {
    soundManager.playClick(440);

    if (currentIndex + 1 >= rounds.length) {
      onFinishGame(results);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    }
  }, [currentIndex, rounds.length, results, onFinishGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!isAnswered) {
        if (e.key === '1' || e.key === 'a') handleSelectOption(0);
        else if (e.key === '2' || e.key === 'b') handleSelectOption(1);
        else if (e.key === '3' || e.key === 'c') handleSelectOption(2);
        else if (e.key === '4' || e.key === 'd') handleSelectOption(3);
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

  if (!currentRound) return null;

  // Compute tight bounding box for the isolated silhouette
  const b = currentRound.targetPath.bounds;
  const minX = b[0][0];
  const minY = b[0][1];
  const maxX = b[1][0];
  const maxY = b[1][1];
  const w = maxX - minX;
  const h = maxY - minY;
  const pad = Math.max(w, h) * 0.12;
  const viewBox = `${minX - pad} ${minY - pad} ${w + pad * 2} ${h + pad * 2}`;

  const targetGrammar = getDeptGrammar(currentRound.targetDept.code);

  return (
    <div className="mx-auto flex h-full max-h-full w-full max-w-4xl select-none flex-col justify-between gap-2.5 overflow-y-auto overscroll-contain md:gap-3 md:overflow-hidden">
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
              Défi Silhouette : Quel est ce département ?
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 text-[11px] font-bold text-clay md:flex-row md:items-center md:gap-3 md:text-xs">
          <span className="text-clay-muted">
            {currentIndex + 1} / {rounds.length}
          </span>
          <span className="text-terracotta">{score} pts</span>
        </div>
      </div>

      {/* Main Silhouette Stage */}
      <div className="relative flex min-h-[12rem] flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-clay-border/80 bg-white p-3 shadow-sm md:min-h-0 md:flex-row md:p-5">
        <div className="flex min-h-0 w-full max-w-xs flex-1 items-center justify-center md:h-full md:max-w-sm">
          <svg
            viewBox={viewBox}
            className="w-full h-full max-h-full aspect-square filter drop-shadow-md transition-all duration-300"
          >
            <path
              d={currentRound.targetPath.path}
              fill={
                isAnswered
                  ? selectedOption === currentRound.correctIndex
                    ? '#34A853' // green
                    : '#EA4335' // red
                  : '#2C2623' // dark ink
              }
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Revealed Label Badge on Answer */}
        {isAnswered && (
          <div className="absolute top-3 right-3 bg-white/95 border border-clay-border px-3 py-1.5 rounded-xl text-xs font-bold text-clay shadow-sm">
            {targetGrammar.withArticle} ({currentRound.targetDept.code})
          </div>
        )}

        {/* Floating Answer Feedback & Advance Button inside Stage */}
        {isAnswered && (
          <div className="relative z-40 mt-2 w-full shrink-0 md:absolute md:bottom-4 md:left-1/2 md:mt-0 md:w-[min(94%,28rem)] md:-translate-x-1/2">
            <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-clay-border bg-white/95 p-3 shadow-md backdrop-blur-md md:flex-row md:items-center">
              <div className="break-words text-xs font-medium leading-snug text-clay">
                💡 {targetGrammar.withArticle} • Chef-lieu : <strong>{currentRound.targetDept.prefecture}</strong> ({currentRound.targetDept.regionName}).
              </div>
              <button
                onClick={handleNext}
                className="min-h-11 px-4 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
              >
                <span>{currentIndex + 1 >= rounds.length ? 'Bilan' : 'Suivant'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4 Clean Options Grid */}
      <div className="shrink-0">
        {!isAnswered && (
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-clay-muted">Identifie la forme — sans code.</p>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick(420);
                setShowHint(true);
              }}
              disabled={showHint}
              className="min-h-10 rounded-xl border border-clay-border bg-creme-100 px-3 py-2 text-[11px] font-bold text-clay disabled:opacity-50"
            >
              {showHint ? `Région : ${currentRound.targetDept.regionName}` : 'Indice région (−25 pts)'}
            </button>
          </div>
        )}
        {showHint && isAnswered && (
          <p className="mb-1 text-[11px] font-semibold text-honey-dark">Région : {currentRound.targetDept.regionName}</p>
        )}
        
        </div>
      <div className="sticky bottom-0 z-30 grid shrink-0 grid-cols-2 gap-2 bg-[#FAF7F2] pb-0.5 md:static md:gap-2.5 md:bg-transparent md:pb-0">{currentRound.options.map((opt, idx) => {
          const optGrammar = getDeptGrammar(opt.code);
          let btnStyle = 'bg-white border border-clay-border border-b-2 hover:border-terracotta/40 hover:bg-creme-50 text-clay active:translate-y-[1px]';
          let badgeStyle = 'bg-creme-100 text-clay-muted border-clay-border';

          if (isAnswered) {
            if (idx === currentRound.correctIndex) {
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
              key={opt.code}
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`min-h-12 p-3 rounded-xl text-left transition cursor-pointer flex items-center justify-between select-none ${btnStyle}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-5 h-5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center border shrink-0 ${badgeStyle}`}>
                  {idx + 1}
                </span>
                <span className="break-words text-xs font-semibold leading-snug text-clay md:text-sm">
                  {optGrammar.withArticle}
                </span>
              </div>

              {isAnswered && idx === currentRound.correctIndex && (
                <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
              )}
              {isAnswered && idx === selectedOption && idx !== currentRound.correctIndex && (
                <XCircle className="w-4 h-4 text-coral shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
