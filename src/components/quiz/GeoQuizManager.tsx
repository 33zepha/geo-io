'use client';

import React, { useState } from 'react';
import { QuizConfig, QuizQuestion, AnswerRecord, QuizSessionSummary } from '../../types/quiz';
import { generateQuizQuestions } from '../../lib/quizGenerator';
import { QuizConfigScreen } from './QuizConfigScreen';
import { QuizActiveScreen } from './QuizActiveScreen';
import { QuizSummaryScreen } from './QuizSummaryScreen';
import { addXpAndProgress, triggerCelebration } from '../../lib/storage';

function computeGrade(accuracy: number): string {
  if (accuracy === 100) return 'Major de Promotion • Félicitations du Jury 👑';
  if (accuracy >= 85) return 'Mention Très Bien 🌟';
  if (accuracy >= 70) return 'Mention Bien 🎖️';
  if (accuracy >= 50) return 'Mention Assez Bien 📜';
  return 'En cours d\'acquisition (Rattrapage conseillé) 📚';
}

export const GeoQuizManager: React.FC = () => {
  const [screen, setScreen] = useState<'config' | 'playing' | 'summary'>('config');

  const [config, setConfig] = useState<QuizConfig>({
    theme: 'prefectures',
    regionScope: 'all',
    format: 'sprint_10',
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [sessionSummary, setSessionSummary] = useState<QuizSessionSummary | null>(null);

  const startQuiz = (customConfig?: QuizConfig) => {
    const activeConfig = customConfig || config;
    const generated = generateQuizQuestions(activeConfig);
    setQuestions(generated);
    setScreen('playing');
  };

  const handleFinishQuiz = (records: AnswerRecord[]) => {
    const correctAnswers = records.filter((r) => r.isCorrect).length;
    const totalQuestions = records.length;
    const accuracyPercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Calculate max streak
    let currentStreak = 0;
    let maxStreak = 0;
    for (const r of records) {
      if (r.isCorrect) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }

    // Calculate score / XP
    const baseScore = correctAnswers * 100;
    const streakBonus = maxStreak * 25;
    const accuracyBonus = accuracyPercent >= 90 ? 150 : accuracyPercent >= 70 ? 75 : 0;
    const totalScore = baseScore + streakBonus + accuracyBonus;

    const grade = computeGrade(accuracyPercent);

    // Save to storage
    const deptFeedback = records
      .filter((r) => r.question.targetDepartmentCode)
      .map((r) => ({
        code: r.question.targetDepartmentCode!,
        isCorrect: r.isCorrect,
      }));

    addXpAndProgress(totalScore, 'master', totalScore, correctAnswers, totalQuestions, deptFeedback);

    if (accuracyPercent >= 80) {
      triggerCelebration();
    }

    const summary: QuizSessionSummary = {
      config,
      totalQuestions,
      correctAnswers,
      accuracyPercent,
      maxStreak,
      score: totalScore,
      grade,
      records,
      completedAt: new Date().toISOString(),
    };

    setSessionSummary(summary);
    setScreen('summary');
  };

  return (
    <div className="w-full">
      {screen === 'config' && (
        <QuizConfigScreen
          config={config}
          onChangeConfig={setConfig}
          onStartQuiz={() => startQuiz()}
        />
      )}

      {screen === 'playing' && (
        <QuizActiveScreen
          config={config}
          questions={questions}
          onFinishQuiz={handleFinishQuiz}
          onQuitQuiz={() => setScreen('config')}
        />
      )}

      {screen === 'summary' && sessionSummary && (
        <QuizSummaryScreen
          summary={sessionSummary}
          onRestartSameConfig={() => startQuiz()}
          onBackToConfig={() => setScreen('config')}
        />
      )}
    </div>
  );
};
