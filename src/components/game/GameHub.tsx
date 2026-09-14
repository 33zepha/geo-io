'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { 
  GameModeType, 
  GameDifficulty, 
  GameSettings, 
  RoundResult, 
  GameSessionSummary, 
  MapClickTarget, 
  QcmQuestion, 
  EnqueteTerritoire 
} from '../../types/game';
import { 
  generateMapClickTargets, 
  generateQcmQuestions, 
  generateEnquetes,
  generateSilhouetteRounds,
  generateWeakPointsTargets,
  SilhouetteRound
} from '../../lib/modesEngine';
import { REGIONS } from '../../data/regions';
import { ModeMapClicker } from './ModeMapClicker';
import { ModeQcm } from './ModeQcm';
import { ModeSilhouette } from './ModeSilhouette';
import { ModeEnqueteLogique } from './ModeEnqueteLogique';
import { GameSummary } from './GameSummary';
import { addXpAndProgress, triggerCelebration } from '../../lib/storage';
import { soundManager } from '../../lib/audio';
import { 
  Target, 
  CheckSquare, 
  FileSearch, 
  ArrowRight,
  Shapes,
  MapPin,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { DailyMissionPanel } from '../competition/DailyMissionPanel';
import { beginOfficialAttempt, fetchCompetition, submitOfficialAttempt } from '../../lib/competitionService';
import { buildOfficialChallenge } from '../../lib/officialChallenge';
import type { CompetitionOverview, CompetitionUpdate, OfficialAttempt } from '../../types/competition';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 26 }
  },
};

interface GameHubProps {
  catchUpCodes?: string[] | null;
  onClearCatchUp?: () => void;
}

export const GameHub: React.FC<GameHubProps> = ({
  catchUpCodes,
  onClearCatchUp,
}) => {
  const [screen, setScreen] = useState<'menu' | 'playing' | 'summary'>('menu');

  const [settings, setSettings] = useState<GameSettings>({
    mode: 'clic_carte',
    difficulty: 'intermediaire',
    questionCount: 10,
    regionCode: undefined,
  });

  const [isCatchUpActive, setIsCatchUpActive] = useState(
    Boolean(catchUpCodes && catchUpCodes.length > 0)
  );

  useEffect(() => {
    if (catchUpCodes && catchUpCodes.length > 0) {
      setIsCatchUpActive(true);
      setSettings((prev) => ({
        ...prev,
        mode: 'clic_carte',
        questionCount: Math.min(Math.max(catchUpCodes.length, 5), 20),
      }));
    }
  }, [catchUpCodes]);

  const [clickTargets, setClickTargets] = useState<MapClickTarget[]>([]);
  const [qcmQuestions, setQcmQuestions] = useState<QcmQuestion[]>([]);
  const [silhouetteRounds, setSilhouetteRounds] = useState<SilhouetteRound[]>([]);
  const [enquetes, setEnquetes] = useState<EnqueteTerritoire[]>([]);
  const [summary, setSummary] = useState<GameSessionSummary | null>(null);
  const [competition, setCompetition] = useState<CompetitionOverview | null>(null);
  const [competitionError, setCompetitionError] = useState<string | null>(null);
  const [competitionLoading, setCompetitionLoading] = useState(true);
  const [officialAttempt, setOfficialAttempt] = useState<OfficialAttempt | null>(null);
  const [competitionUpdate, setCompetitionUpdate] = useState<CompetitionUpdate | null>(null);

  const refreshCompetition = useCallback(async () => {
    try {
      setCompetition((await fetchCompetition(true)).overview);
      setCompetitionError(null);
    } catch (error) {
      setCompetitionError(error instanceof Error ? error.message : 'Missions indisponibles.');
    } finally {
      setCompetitionLoading(false);
    }
  }, []);

  useEffect(() => { void refreshCompetition(); }, [refreshCompetition]);

  const startOfficialMission = async (slot: 1 | 2) => {
    try {
      setCompetitionError(null);
      const attempt = await beginOfficialAttempt(slot);
      const challenge = buildOfficialChallenge(attempt.dayKey, attempt.slot, attempt.mode);
      setOfficialAttempt(attempt);
      setCompetitionUpdate(null);
      setSettings({ mode: attempt.mode, difficulty: 'intermediaire', questionCount: 5, regionCode: undefined });
      if (challenge.mode === 'clic_carte') setClickTargets(challenge.items);
      else if (challenge.mode === 'qcm') setQcmQuestions(challenge.items);
      else if (challenge.mode === 'silhouette') setSilhouetteRounds(challenge.items);
      else setEnquetes(challenge.items);
      setScreen('playing');
    } catch (error) {
      setCompetitionError(error instanceof Error ? error.message : 'Impossible de démarrer la mission.');
    }
  };

  const startGame = () => {
    soundManager.playClick(500);

    if (isCatchUpActive && catchUpCodes && catchUpCodes.length > 0) {
      const targets = generateWeakPointsTargets(catchUpCodes, settings.questionCount);
      setClickTargets(targets);
      setSettings((prev) => ({ ...prev, mode: 'clic_carte' }));
    } else if (settings.mode === 'clic_carte') {
      const targets = generateMapClickTargets(settings.difficulty, settings.questionCount, settings.regionCode);
      setClickTargets(targets);
    } else if (settings.mode === 'qcm') {
      const questions = generateQcmQuestions(settings.difficulty, settings.questionCount, settings.regionCode);
      setQcmQuestions(questions);
    } else if (settings.mode === 'silhouette') {
      const rounds = generateSilhouetteRounds(settings.questionCount, settings.regionCode, settings.difficulty);
      setSilhouetteRounds(rounds);
    } else if (settings.mode === 'enquete_logique') {
      const enqueteList = generateEnquetes(settings.questionCount, settings.difficulty, settings.regionCode);
      setEnquetes(enqueteList);
    }

    setScreen('playing');
  };

  const handleFinishSession = (results: RoundResult[]) => {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalRounds = results.length;
    const accuracyPercent = totalRounds > 0 ? Math.round((correctCount / totalRounds) * 100) : 0;
    const totalScore = results.reduce((acc, r) => acc + r.scoreEarned, 0);

    let grade = 'Major de Promotion 👑';
    if (accuracyPercent < 50) grade = 'Rattrapage conseillé 📚';
    else if (accuracyPercent < 70) grade = 'Mention Assez Bien 📜';
    else if (accuracyPercent < 85) grade = 'Mention Bien 🎖️';
    else if (accuracyPercent < 100) grade = 'Mention Très Bien 🌟';

    const deptFeedback = results.map((r) => ({
      code: r.targetCode,
      isCorrect: r.isCorrect,
    }));

    const storageMode =
      settings.mode === 'clic_carte'
        ? 'pointage'
        : settings.mode === 'silhouette'
          ? 'silhouette'
          : settings.mode === 'enquete_logique'
            ? 'enquete'
            : 'qcm';

    // XP normalized by accuracy × length (not raw enquête clue points)
    const normalizedXp = Math.round((correctCount / Math.max(1, totalRounds)) * totalRounds * 10);
    addXpAndProgress(normalizedXp, storageMode, totalScore, correctCount, totalRounds, deptFeedback);

    if (accuracyPercent >= 80) {
      triggerCelebration();
    }

    const sessionSummary: GameSessionSummary = {
      mode: settings.mode,
      totalRounds,
      correctCount,
      accuracyPercent,
      totalScore,
      grade,
      results,
    };

    setSummary(sessionSummary);
    setScreen('summary');

    if (officialAttempt) {
      const answers = results.map((result) => ({ questionId: result.questionId || '', answerCode: result.userAnswerCode ?? null }));
      void submitOfficialAttempt(officialAttempt.id, answers)
        .then((update) => {
          setCompetitionUpdate(update);
          setCompetition(update.overview);
          setOfficialAttempt(null);
        })
        .catch((error) => {
          setOfficialAttempt(null);
          setCompetitionError(error instanceof Error ? error.message : 'Résultat officiel refusé.');
        });
    }
  };

  const modesList = [
    {
      id: 'clic_carte' as GameModeType,
      title: 'Pointage sur carte',
      icon: <Target className="w-4 h-4 text-terracotta" />,
    },
    {
      id: 'qcm' as GameModeType,
      title: 'Quiz QCM',
      icon: <CheckSquare className="w-4 h-4 text-lagon" />,
    },
    {
      id: 'silhouette' as GameModeType,
      title: 'Défi Silhouette',
      icon: <Shapes className="w-4 h-4 text-honey-dark" />,
    },
    {
      id: 'enquete_logique' as GameModeType,
      title: 'Enquête territoriale',
      icon: <FileSearch className="w-4 h-4 text-sage" />,
    },
  ];

  const difficultyList: {
    id: GameDifficulty;
    title: string;
  }[] = [
    {
      id: 'debutant',
      title: 'Débutant',
    },
    {
      id: 'intermediaire',
      title: 'Intermédiaire',
    },
    {
      id: 'expert',
      title: 'Expert',
    },
  ];

  const countOptions = [5, 10, 20];
  const sortedRegions = Object.values(REGIONS).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  return (
    <div className="flex h-full max-h-full w-full flex-col items-stretch justify-start overflow-hidden sm:items-center sm:justify-center">
      <AnimatePresence mode="wait">
        {screen === 'menu' && (
          <motion.div 
            key="menu"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mx-auto flex max-h-full w-full max-w-4xl flex-col justify-start space-y-4 overflow-y-auto overscroll-contain px-0.5 scrollbar-thin sm:justify-center sm:space-y-5"
          >
            {/* Header Title */}
            <motion.div variants={itemVariants} className="text-center">
              <h1 className="font-display text-xl font-extrabold tracking-tight text-clay sm:text-2xl">
                Configuration de partie
              </h1>
            </motion.div>

            <motion.div variants={itemVariants}>
              <DailyMissionPanel overview={competition} loading={competitionLoading} error={competitionError} onStart={(slot) => void startOfficialMission(slot)} />
            </motion.div>

            {/* Catch-up Banner if active */}
            {isCatchUpActive && catchUpCodes && catchUpCodes.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="fade-rise flex shrink-0 flex-col gap-2 rounded-xl border border-honey/30 bg-honey-light px-3.5 py-2.5 text-clay shadow-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-honey/40 bg-white text-honey-dark">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="truncate text-xs font-bold text-clay">
                      Rattrapage · {catchUpCodes.length} département{catchUpCodes.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setIsCatchUpActive(false);
                      if (onClearCatchUp) onClearCatchUp();
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-clay-muted hover:text-clay transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={startGame}
                    className="btn-3d flex cursor-pointer items-center gap-1 rounded-lg border-b-honey-dark bg-honey px-3 py-1 text-xs font-bold text-white shadow-xs transition hover:bg-honey-hover"
                  >
                    <span>Lancer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Console Dashboard: 2-Column Grid */}
            <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 sm:gap-5">
              {/* Left Column: Mode Selection */}
              <motion.div variants={itemVariants} className="flex flex-col justify-between space-y-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-clay-muted">
                  1. Mode de jeu
                </h2>

                <div className="grid flex-1 grid-cols-2 gap-2.5">
                  {modesList.map((m) => {
                    const isLockedByCatchUp = isCatchUpActive && m.id !== 'clic_carte';
                    const isSelected = settings.mode === m.id;
                    return (
                      <button
                        key={m.id}
                        disabled={isLockedByCatchUp}
                        onClick={() => {
                          soundManager.playClick(440);
                          if (isLockedByCatchUp) return;
                          setSettings({ ...settings, mode: m.id });
                        }}
                        className={`pressable flex min-h-[4.5rem] cursor-pointer flex-col justify-center rounded-2xl border p-3.5 text-left transition ${
                          isSelected
                            ? 'bg-white border-terracotta border-b-2 border-b-terracotta-dark shadow-xs ring-1 ring-terracotta/20'
                            : 'bg-white/80 border-clay-border hover:bg-white text-clay'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`rounded-lg p-2 ${
                            isSelected ? 'bg-terracotta-light' : 'bg-creme-100'
                          }`}>
                            {m.icon}
                          </div>
                          <span className="font-bold text-xs sm:text-sm text-clay leading-snug">
                            {m.title}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Right Column: Parameters & Launch */}
              <motion.div variants={itemVariants} className="flex flex-col justify-between space-y-4">
                {/* 2. Périmètre Géographique */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-clay-muted">
                      2. Périmètre géographique
                    </h2>
                    {settings.regionCode && (
                      <button
                        onClick={() => setSettings({ ...settings, regionCode: undefined })}
                        className="text-[11px] text-terracotta hover:underline font-semibold cursor-pointer"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        soundManager.playClick(430);
                        setSettings({ ...settings, regionCode: undefined });
                      }}
                      className={`flex min-h-12 cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition ${
                        !settings.regionCode
                          ? 'border-b-2 border-terracotta border-b-terracotta-dark bg-white font-bold text-clay shadow-xs'
                          : 'border-clay-border bg-white/80 text-clay-muted hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-terracotta" />
                        <span className="text-xs font-bold">Toute la France</span>
                      </div>
                    </button>

                    <div className="relative">
                      <select
                        value={settings.regionCode || ''}
                        onChange={(e) => {
                          soundManager.playClick(450);
                          setSettings({ 
                            ...settings, 
                            regionCode: e.target.value ? e.target.value : undefined 
                          });
                        }}
                        className={`h-full min-h-12 w-full cursor-pointer appearance-none rounded-xl border bg-white/80 p-3 pr-7 text-base font-bold transition sm:text-xs ${
                          settings.regionCode
                            ? 'border-b-2 border-terracotta border-b-terracotta-dark bg-white text-clay shadow-xs'
                            : 'border-clay-border text-clay-muted hover:bg-white'
                        }`}
                      >
                        <option value="">Grand Tour (Région)...</option>
                        {sortedRegions.map((r) => (
                          <option key={r.code} value={r.code}>
                            {r.name} ({r.departments.length} dép.)
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-clay-muted text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Difficulté */}
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-clay-muted">
                    3. Niveau de difficulté
                  </h2>

                  <div className="grid grid-cols-3 gap-2.5">
                    {difficultyList.map((d) => {
                      const isSelected = settings.difficulty === d.id;
                      return (
                        <button
                          key={d.id}
                          onClick={() => {
                            soundManager.playClick(480);
                            setSettings({ ...settings, difficulty: d.id });
                          }}
                          className={`flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-xl border px-2.5 py-2.5 text-center transition ${
                            isSelected
                              ? 'border-b-2 border-terracotta border-b-terracotta-dark bg-white font-bold text-clay shadow-xs'
                              : 'border-clay-border bg-white/80 text-clay-muted hover:bg-white'
                          }`}
                        >
                          <span className="text-xs font-bold">{d.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Nombre de questions & Lancement */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-clay-muted">
                      4. Questions :
                    </span>
                    <div className="flex items-center gap-2">
                      {countOptions.map((count) => {
                        const isSelected = settings.questionCount === count;
                        return (
                          <button
                            key={count}
                            onClick={() => {
                              soundManager.playClick(420);
                              setSettings({ ...settings, questionCount: count });
                            }}
                            className={`min-h-11 min-w-11 cursor-pointer rounded-xl border px-3.5 py-2.5 text-center text-xs font-bold transition ${
                              isSelected
                                ? 'bg-white border-clay-border border-b-2 shadow-xs text-terracotta'
                                : 'bg-white/80 border-clay-border hover:bg-white text-clay-muted'
                            }`}
                          >
                            {count}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Launch CTA */}
                  <button
                    onClick={startGame}
                    className="btn-3d flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-b-terracotta-dark bg-terracotta px-4 py-3.5 font-display text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-hover"
                  >
                    <span>Lancer la partie</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {screen === 'playing' && settings.mode === 'clic_carte' && (
          <motion.div
            key="playing-clic"
            className="flex h-full min-h-0 max-h-full w-full flex-col items-stretch justify-start overflow-hidden sm:items-center sm:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ModeMapClicker
              settings={settings}
              targets={clickTargets}
              onFinishGame={handleFinishSession}
              onQuit={() => setScreen('menu')}
            />
          </motion.div>
        )}

        {screen === 'playing' && settings.mode === 'qcm' && (
          <motion.div
            key="playing-qcm"
            className="flex h-full min-h-0 max-h-full w-full flex-col items-stretch justify-start overflow-hidden sm:items-center sm:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ModeQcm
              settings={settings}
              questions={qcmQuestions}
              onFinishGame={handleFinishSession}
              onQuit={() => setScreen('menu')}
            />
          </motion.div>
        )}

        {screen === 'playing' && settings.mode === 'silhouette' && (
          <motion.div
            key="playing-silhouette"
            className="flex h-full min-h-0 max-h-full w-full flex-col items-stretch justify-start overflow-hidden sm:items-center sm:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ModeSilhouette
              rounds={silhouetteRounds}
              onFinishGame={handleFinishSession}
              onQuit={() => setScreen('menu')}
            />
          </motion.div>
        )}

        {screen === 'playing' && settings.mode === 'enquete_logique' && (
          <motion.div
            key="playing-enquete"
            className="flex h-full min-h-0 max-h-full w-full flex-col items-stretch justify-start overflow-hidden sm:items-center sm:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ModeEnqueteLogique
              settings={settings}
              enquetes={enquetes}
              onFinishGame={handleFinishSession}
              onQuit={() => setScreen('menu')}
            />
          </motion.div>
        )}

        {screen === 'summary' && summary && (
          <motion.div
            key="summary"
            className="flex h-full min-h-0 max-h-full w-full flex-col items-stretch justify-start overflow-hidden sm:items-center sm:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GameSummary
              summary={summary}
              competitionUpdate={competitionUpdate}
              competitionPending={Boolean(officialAttempt)}
              onReplay={startGame}
              onBackToMenu={() => setScreen('menu')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
