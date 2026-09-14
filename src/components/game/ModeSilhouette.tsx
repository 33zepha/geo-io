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
          title: `Silhouette : ${targetGrammar.withArticle}`,
          targetName: targetDept.name,
          targetCode: targetDept.code,
          isCorrect: true,
          scoreEarned: Math.max(50, 100 - (showHint ? 25 : 0)),
          explanation: `C'est bien ${targetGrammar.withArticle} (${targetDept.code}), préfecture : ${targetDept.prefecture}.`,
        },
      ]);
    } else {
      soundManager.playError();
      setResults((prev) => [
        ...prev,
        {
          title: `Silhouette : ${targetGrammar.withArticle}`,
          targetName: targetDept.name,
          targetCode: targetDept.code,
          isCorrect: false,
          scoreEarned: 0,
          explanation: `C'était ${targetGrammar.withArticle} (${targetDept.code}), préfecture : ${targetDept.prefecture}.`,
          userAnswer: currentRound.options[idx].name,
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
    <div className="w-full max-w-4xl mx-auto h-full max-h-full flex flex-col justify-between gap-2 overflow-hidden select-none">
      {/* Top HUD */}
      <div className="bg-white border border-clay-border/80 rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-sm flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => {
              soundManager.playClick(400);
              if (confirm('Quitter la session en cours ?')) onQuit();
            }}
            className="touch-target flex items-center justify-center rounded-xl bg-creme-100 p-2 text-clay-muted transition hover:bg-creme-200 hover:text-clay cursor-pointer shrink-0"
            title="Quitter la partie"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="truncate">
            <h2 className="text-sm sm:text-base font-display font-extrabold text-clay truncate">
              Défi Silhouette : Quel est ce département ?
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-clay shrink-0">
          <span className="text-clay-muted">
            {currentIndex + 1} / {rounds.length}
          </span>
          <span className="text-terracotta">{score} pts</span>
        </div>
      </div>

      {/* Main Silhouette Stage */}
      <div className="bg-white border border-clay-border/80 rounded-2xl p-3 sm:p-4 shadow-sm flex-1 min-h-0 flex items-center justify-center relative overflow-hidden">
        <div className="w-full h-full max-w-xs sm:max-w-sm flex items-center justify-center">
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
          <div className="absolute bottom-4 left-1/2 z-40 w-[min(94%,28rem)] -translate-x-1/2">
            <div className="p-3 rounded-xl bg-white/95 backdrop-blur-md border border-clay-border shadow-md flex items-center justify-between gap-3">
              <div className="text-xs text-clay leading-snug font-medium line-clamp-2 truncate">
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
      <div className="grid grid-cols-2 gap-2 shrink-0">{currentRound.options.map((opt, idx) => {
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
                <span className="text-xs sm:text-sm font-semibold text-clay truncate">
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
