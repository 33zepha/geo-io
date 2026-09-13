'use client';

import React, { useState } from 'react';
import { LICENCE_QUESTIONS } from '../../data/licenceQuestions';
import { LicenceQuestion } from '../../types/geo';
import { InteractiveFranceMap } from '../map/InteractiveFranceMap';
import { soundManager } from '../../lib/audio';
import { addXpAndProgress, triggerCelebration } from '../../lib/storage';
import { GraduationCap, CheckCircle2, XCircle, ArrowRight, BookOpen, RotateCcw, Award, Lightbulb } from 'lucide-react';

export const MasterLicenceMode: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [earnedXp, setEarnedXp] = useState(0);

  // Shuffle or slice questions
  const [questions] = useState<LicenceQuestion[]>(() => {
    return [...LICENCE_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 8);
  });

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      soundManager.playSuccess(2);
      setCorrectCount((prev) => prev + 1);
    } else {
      soundManager.playError();
    }
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIndex + 1 >= questions.length) {
      finishGame();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const finishGame = () => {
    const finalScore = correctCount * 150;
    const finalXp = correctCount * 50 + (correctCount === questions.length ? 150 : 50);
    setEarnedXp(finalXp);

    addXpAndProgress(finalXp, 'master', finalScore, correctCount, questions.length);

    if (correctCount >= 6) {
      triggerCelebration();
    }

    setGameState('completed');
  };

  const restartQuiz = () => {
    soundManager.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setGameState('playing');
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
      {/* Left Column: Academic Question & Card */}
      <div className="w-full lg:w-[460px] flex flex-col gap-4">
        {gameState === 'playing' && currentQ && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            {/* Header / Badges */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
                    Master Licence Géo
                  </div>
                  <div className="text-xs text-slate-400">
                    {currentQ.difficulty} • {currentQ.category.toUpperCase()}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-base font-semibold text-slate-100 leading-snug mb-5">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-2.5 mb-5">
              {currentQ.options.map((option, idx) => {
                let btnStyle = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50';

                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-red-950/50 border-red-500 text-red-200';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current shrink-0 flex items-center justify-center text-[10px] font-mono mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Academic Explanation Box (Appears after answer) */}
            {isAnswered && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 bg-slate-950/90 border border-purple-500/30 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                  <BookOpen className="w-4 h-4" />
                  <span>Analyse Géographique & Concept Clé</span>
                </div>
                <div className="text-[11px] font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20 inline-block">
                  {currentQ.keyConcept}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentQ.explanation}
                </p>
                <button
                  onClick={handleNext}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition cursor-pointer"
                >
                  <span>{currentIndex + 1 >= questions.length ? 'Terminer le Grand Oral' : 'Question Suivante'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Completed Screen */}
        {gameState === 'completed' && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="inline-flex p-4 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Résultats du Grand Oral</h3>
              <p className="text-xs text-slate-400 mt-1">
                Score : {correctCount} / {questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Mention :</span>
                <span className="font-bold text-purple-400">
                  {correctCount === questions.length ? 'Très Bien avec Félicitations du Jury' : correctCount >= 5 ? 'Bien' : 'Admis'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">XP Académique :</span>
                <span className="font-bold font-mono text-emerald-400">+{earnedXp} XP</span>
              </div>
            </div>

            <button
              onClick={restartQuiz}
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Lancer une nouvelle session d\'examen
            </button>
          </div>
        )}
      </div>

      {/* Right Column: France Map with territorial context highlights */}
      <div className="flex-1 w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-2 px-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Repère spatial : territoires concernés surlignés</span>
          </div>
        </div>

        <InteractiveFranceMap
          interactive={false}
          highlightCodes={currentQ?.relatedDepartmentCodes || []}
        />
      </div>
    </div>
  );
};
