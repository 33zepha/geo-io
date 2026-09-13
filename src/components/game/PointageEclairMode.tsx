'use client';

import React, { useState, useEffect, useRef } from 'react';
import { InteractiveFranceMap } from '../map/InteractiveFranceMap';
import { DEPARTMENTS_LIST, DEPARTMENTS } from '../../data/departments';
import { Department } from '../../types/geo';
import { soundManager } from '../../lib/audio';
import { addXpAndProgress, triggerCelebration } from '../../lib/storage';
import { Zap, Flame, RotateCcw, Award, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

type QuestionType = 'code_name' | 'prefecture_find' | 'clue_find';

interface GamePrompt {
  department: Department;
  promptText: string;
  subPrompt: string;
  type: QuestionType;
}

export const PointageEclairMode: React.FC = () => {
  const TOTAL_ROUNDS = 10;
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'round_feedback' | 'game_over'>('intro');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<GamePrompt | null>(null);
  const [feedback, setFeedback] = useState<{ code: string; isCorrect: boolean } | null>(null);
  const [roundHistory, setRoundHistory] = useState<{ prompt: string; target: Department; isCorrect: boolean; points: number }[]>([]);
  const [earnedXp, setEarnedXp] = useState(0);
  const [timer, setTimer] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a random prompt
  const generatePrompt = (): GamePrompt => {
    const randomDept = DEPARTMENTS_LIST[Math.floor(Math.random() * DEPARTMENTS_LIST.length)];
    const types: QuestionType[] = ['code_name', 'prefecture_find', 'clue_find'];
    const selectedType = types[Math.floor(Math.random() * types.length)];

    let promptText = '';
    let subPrompt = '';

    if (selectedType === 'code_name') {
      promptText = `${randomDept.name} (${randomDept.code})`;
      subPrompt = `Région : ${randomDept.regionName}`;
    } else if (selectedType === 'prefecture_find') {
      promptText = `Préfecture : ${randomDept.prefecture}`;
      subPrompt = `Dans quel département (${randomDept.regionName}) se situe-t-elle ?`;
    } else {
      promptText = `Spécialité : ${randomDept.specialties[0] || randomDept.relief}`;
      subPrompt = `Trouve le département correspondant sur la carte`;
    }

    return {
      department: randomDept,
      promptText,
      subPrompt,
      type: selectedType,
    };
  };

  const startGame = () => {
    soundManager.playClick();
    setScore(0);
    setCombo(1);
    setMaxCombo(1);
    setCorrectCount(0);
    setRound(1);
    setRoundHistory([]);
    setFeedback(null);
    setGameState('playing');
    loadNextRound(1);
  };

  const loadNextRound = (nextRoundNum: number) => {
    const prompt = generatePrompt();
    setCurrentPrompt(prompt);
    setFeedback(null);
    setGameState('playing');
    setTimer(15);
  };

  // Timer loop for active round
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentPrompt]);

  const handleTimeout = () => {
    if (!currentPrompt) return;
    soundManager.playError();
    const isCorrect = false;
    setFeedback({ code: currentPrompt.department.code, isCorrect: false });
    setCombo(1);

    setRoundHistory((prev) => [
      ...prev,
      {
        prompt: currentPrompt.promptText,
        target: currentPrompt.department,
        isCorrect: false,
        points: 0,
      },
    ]);

    setGameState('round_feedback');
  };

  const handleDepartmentClick = (clickedCode: string) => {
    if (gameState !== 'playing' || !currentPrompt) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = clickedCode === currentPrompt.department.code;
    const targetDept = currentPrompt.department;

    if (isCorrect) {
      soundManager.playSuccess(combo);
      const basePoints = 100;
      const speedBonus = Math.max(0, timer * 10);
      const comboBonus = Math.round(basePoints * (combo - 1) * 0.5);
      const roundPoints = basePoints + speedBonus + comboBonus;

      setScore((prev) => prev + roundPoints);
      setCorrectCount((prev) => prev + 1);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      setRoundHistory((prev) => [
        ...prev,
        {
          prompt: currentPrompt.promptText,
          target: targetDept,
          isCorrect: true,
          points: roundPoints,
        },
      ]);
      setFeedback({ code: clickedCode, isCorrect: true });
    } else {
      soundManager.playError();
      setCombo(1);
      setRoundHistory((prev) => [
        ...prev,
        {
          prompt: currentPrompt.promptText,
          target: targetDept,
          isCorrect: false,
          points: 0,
        },
      ]);
      setFeedback({ code: clickedCode, isCorrect: false });
    }

    setGameState('round_feedback');
  };

  const advanceNextRound = () => {
    soundManager.playClick();
    if (round >= TOTAL_ROUNDS) {
      finishGame();
    } else {
      const nextR = round + 1;
      setRound(nextR);
      loadNextRound(nextR);
    }
  };

  const finishGame = () => {
    const finalXp = Math.round(score * 0.8 + correctCount * 25);
    setEarnedXp(finalXp);

    const deptFeedback = roundHistory.map((h) => ({
      code: h.target.code,
      isCorrect: h.isCorrect,
    }));

    addXpAndProgress(finalXp, 'pointage', score, correctCount, TOTAL_ROUNDS, deptFeedback);

    if (correctCount >= 8) {
      triggerCelebration();
    }

    setGameState('game_over');
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
      {/* Left Panel: Game HUD / Status */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Top Game Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Mode Title & Round Indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Pointage Éclair
              </span>
            </div>
            {gameState !== 'intro' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {round} / {TOTAL_ROUNDS}
              </span>
            )}
          </div>

          {/* Score & Combo Multiplier */}
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-800/80 mb-4">
            <div>
              <div className="text-[11px] font-mono text-slate-400">SCORE</div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
                {score}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Flame className={`w-3.5 h-3.5 ${combo > 1 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
                COMBO
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                x{combo.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Active Prompt Area */}
          {gameState === 'playing' && currentPrompt && (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1">
                  Cible à pointer :
                </div>
                <div className="text-xl font-bold text-white tracking-wide">
                  {currentPrompt.promptText}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {currentPrompt.subPrompt}
                </div>
              </div>

              {/* Progress Timer Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    timer > 5 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
                  }`}
                  style={{ width: `${(timer / 15) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Vitesse</span>
                <span className="font-bold text-slate-200">{timer}s</span>
              </div>
            </div>
          )}

          {/* Feedback Area after clicking */}
          {gameState === 'round_feedback' && currentPrompt && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  feedback?.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/50 text-red-300'
                }`}
              >
                {feedback?.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {feedback?.isCorrect ? 'Coup parfait !' : 'Manqué !'}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    C\'était : <strong>{currentPrompt.department.name} ({currentPrompt.department.code})</strong>, préfecture {currentPrompt.department.prefecture}.
                  </div>
                </div>
              </div>

              <button
                onClick={advanceNextRound}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>{round >= TOTAL_ROUNDS ? 'Voir les résultats' : 'Suivant'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Intro Screen */}
          {gameState === 'intro' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Une cible géographique apparaît à chaque tour (nom, préfecture ou indice économique).
                Pointe le bon département sur la carte le plus vite possible pour enchaîner les combos !
              </p>
              <button
                onClick={startGame}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Lancer le Sprint (10 tours)
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === 'game_over' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center py-2">
                <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mb-2">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Sprint Terminé !</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Précision : {Math.round((correctCount / TOTAL_ROUNDS) * 100)}% ({correctCount}/{TOTAL_ROUNDS})
                </p>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Score Final :</span>
                  <span className="font-bold font-mono text-emerald-400">{score} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Combo Max :</span>
                  <span className="font-bold font-mono text-amber-400">x{maxCombo.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">XP Remportée :</span>
                  <span className="font-bold font-mono text-purple-400">+{earnedXp} XP</span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Rejouer un Sprint
              </button>
            </div>
          )}
        </div>

        {/* Tactical Round History List */}
        {roundHistory.length > 0 && (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              Historique des cibles
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {roundHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/50"
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.isCorrect ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    )}
                    <span className="text-slate-200 font-medium truncate">
                      {item.target.name} ({item.target.code})
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                    +{item.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center/Right Panel: Large Interactive Vector Map */}
      <div className="flex-1 w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl relative">
        <InteractiveFranceMap
          interactive={gameState === 'playing'}
          onDepartmentClick={handleDepartmentClick}
          targetCode={currentPrompt?.department.code}
          feedbackState={feedback}
        />
      </div>
    </div>
  );
};
