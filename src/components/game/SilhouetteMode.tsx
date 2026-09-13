'use client';

import React, { useState } from 'react';
import { DEPARTMENT_MAP_PATHS, DepartmentMapPath } from '../../data/franceMapPaths';
import { DEPARTMENTS } from '../../data/departments';
import { Department } from '../../types/geo';
import { soundManager } from '../../lib/audio';
import { addXpAndProgress, triggerCelebration } from '../../lib/storage';
import { Eye, HelpCircle, ArrowRight, RotateCcw, Award, CheckCircle2, XCircle } from 'lucide-react';

export const SilhouetteMode: React.FC = () => {
  const TOTAL_ROUNDS = 5;
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [revealedClues, setRevealedClues] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [earnedXp, setEarnedXp] = useState(0);

  // Pick target and 3 distractors
  const [currentRoundData, setCurrentRoundData] = useState<{
    targetPath: DepartmentMapPath;
    targetDept: Department;
    options: Department[];
  }>(() => generateRound());

  function generateRound() {
    // Pick random department
    const targetPath = DEPARTMENT_MAP_PATHS[Math.floor(Math.random() * DEPARTMENT_MAP_PATHS.length)];
    const targetDept = DEPARTMENTS[targetPath.code];

    // Pick 3 distinct options
    const otherOptions: Department[] = [];
    while (otherOptions.length < 3) {
      const p = DEPARTMENT_MAP_PATHS[Math.floor(Math.random() * DEPARTMENT_MAP_PATHS.length)];
      if (p.code !== targetDept.code && !otherOptions.some((o) => o.code === p.code)) {
        otherOptions.push(DEPARTMENTS[p.code]);
      }
    }

    const options = [targetDept, ...otherOptions].sort(() => 0.5 - Math.random());
    return { targetPath, targetDept, options };
  }

  const handleRevealClue = () => {
    soundManager.playClick();
    setRevealedClues((prev) => Math.min(prev + 1, 2));
  };

  const handleSelect = (code: string) => {
    if (isAnswered) return;
    setSelectedOption(code);
    setIsAnswered(true);

    const isCorrect = code === currentRoundData.targetDept.code;
    if (isCorrect) {
      soundManager.playSuccess(2);
      const points = Math.max(50, 150 - revealedClues * 40);
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
    } else {
      soundManager.playError();
    }
  };

  const handleNext = () => {
    soundManager.playClick();
    if (round >= TOTAL_ROUNDS) {
      finishGame();
    } else {
      setRound((prev) => prev + 1);
      setCurrentRoundData(generateRound());
      setRevealedClues(0);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const finishGame = () => {
    const finalXp = score * 0.9 + correctCount * 30;
    setEarnedXp(Math.round(finalXp));

    addXpAndProgress(Math.round(finalXp), 'silhouette', score, correctCount, TOTAL_ROUNDS);

    if (correctCount >= 4) {
      triggerCelebration();
    }

    setGameState('completed');
  };

  const restartGame = () => {
    soundManager.playClick();
    setRound(1);
    setScore(0);
    setCorrectCount(0);
    setRevealedClues(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentRoundData(generateRound());
    setGameState('playing');
  };

  // Compute viewBox for the isolated department
  const b = currentRoundData.targetPath.bounds;
  const padding = 15;
  const minX = b[0][0] - padding;
  const minY = b[0][1] - padding;
  const width = Math.max(30, b[1][0] - b[0][0] + padding * 2);
  const height = Math.max(30, b[1][1] - b[0][1] + padding * 2);
  const viewBox = `${minX} ${minY} ${width} ${height}`;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-center md:items-stretch">
      {/* Left Column: Department Isolated Silhouette Card */}
      <div className="w-full md:w-1/2 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between items-center relative overflow-hidden">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Eye className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Silhouette Mystère
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {round} / {TOTAL_ROUNDS}
          </span>
        </div>

        {/* Silhouette Visualizer */}
        <div className="relative w-full aspect-square max-h-72 flex items-center justify-center p-4">
          {/* Glowing contour aura */}
          <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-3xl" />

          <svg
            viewBox={viewBox}
            className="w-full h-full filter drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]"
          >
            <path
              d={currentRoundData.targetPath.path}
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#10b981"
              strokeWidth={Math.max(1, width / 120)}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Clues Section */}
        <div className="w-full mt-4 space-y-2">
          {revealedClues >= 1 && (
            <div className="text-xs bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-slate-300 animate-in fade-in">
              💡 <strong>Région :</strong> {currentRoundData.targetDept.regionName}
            </div>
          )}
          {revealedClues >= 2 && (
            <div className="text-xs bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-slate-300 animate-in fade-in">
              🏛️ <strong>Préfecture :</strong> {currentRoundData.targetDept.prefecture}
            </div>
          )}

          {!isAnswered && revealedClues < 2 && (
            <button
              onClick={handleRevealClue}
              className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 text-xs font-medium border border-amber-500/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Révéler un indice (-40 pts)</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Choices / Feedback */}
      <div className="w-full md:w-1/2 flex flex-col justify-between">
        {gameState === 'playing' ? (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-slate-400">SCORE ACTUEL</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{score} pts</span>
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-4">
                À quel territoire correspond cette silhouette ?
              </h3>

              <div className="space-y-3">
                {currentRoundData.options.map((opt) => {
                  let btnStyle = 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800/40';

                  if (isAnswered) {
                    if (opt.code === currentRoundData.targetDept.code) {
                      btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40';
                    } else if (opt.code === selectedOption) {
                      btnStyle = 'bg-red-950/60 border-red-500 text-red-200';
                    } else {
                      btnStyle = 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={opt.code}
                      disabled={isAnswered}
                      onClick={() => handleSelect(opt.code)}
                      className={`w-full p-3.5 rounded-2xl border text-sm font-semibold flex items-center justify-between transition cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt.name}</span>
                      <span className="font-mono text-xs text-slate-400">({opt.code})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isAnswered && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                    selectedOption === currentRoundData.targetDept.code
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {selectedOption === currentRoundData.targetDept.code ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>
                    Il s\'agit bien de : <strong>{currentRoundData.targetDept.name} ({currentRoundData.targetDept.code})</strong>
                  </span>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  <span>{round >= TOTAL_ROUNDS ? 'Voir le bilan' : 'Silhouette suivante'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4 h-full flex flex-col justify-center">
            <div className="inline-flex p-4 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Défi Silhouette Terminé !</h3>
              <p className="text-xs text-slate-400 mt-1">
                Score : {correctCount} / {TOTAL_ROUNDS} ({Math.round((correctCount / TOTAL_ROUNDS) * 100)}%)
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Score Total :</span>
                <span className="font-bold font-mono text-emerald-400">{score} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">XP Remportée :</span>
                <span className="font-bold font-mono text-purple-400">+{earnedXp} XP</span>
              </div>
            </div>

            <button
              onClick={restartGame}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Recommencer une série
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
