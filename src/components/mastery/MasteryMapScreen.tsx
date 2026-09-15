'use client';

import React, { useState, useMemo } from 'react';
import { HeroicFranceMap } from '../map/HeroicFranceMap';
import { DEPARTMENTS_LIST, DEPARTMENTS } from '../../data/departments';
import { getDeptGrammar } from '../../data/departmentGrammar';
import { PlayerStats } from '../../types/geo';
import { soundManager } from '../../lib/audio';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  HelpCircle, 
  ArrowRight,
  Target,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

interface MasteryMapScreenProps {
  stats: PlayerStats;
  onStartWeakPointsSession: (weakCodes: string[]) => void;
}

export const MasteryMapScreen: React.FC<MasteryMapScreenProps> = ({
  stats,
  onStartWeakPointsSession,
}) => {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // Classify all 101 departments
  const classification = useMemo(() => {
    const mastered: string[] = [];
    const learning: string[] = [];
    const weak: string[] = [];
    const undiscovered: string[] = [];

    const customColors: Record<string, { fill: string; stroke: string }> = {};

    for (const d of DEPARTMENTS_LIST) {
      const s = stats.departmentStats[d.code];

      if (!s || s.attempts === 0) {
        undiscovered.push(d.code);
        customColors[d.code] = { fill: '#F2EDE4', stroke: '#DDD3C7' };
      } else if (s.attempts >= 2 && s.correct / s.attempts >= 0.7) {
        mastered.push(d.code);
        customColors[d.code] = { fill: '#34A853', stroke: '#208038' }; // Green
      } else if (s.attempts >= 1 && s.correct / s.attempts < 0.5) {
        weak.push(d.code);
        customColors[d.code] = { fill: '#EA4335', stroke: '#C5221F' }; // Red
      } else {
        learning.push(d.code);
        customColors[d.code] = { fill: '#FBBC04', stroke: '#D99B00' }; // Amber
      }
    }

    return { mastered, learning, weak, undiscovered, customColors };
  }, [stats]);

  const selectedDept = selectedCode ? DEPARTMENTS[selectedCode] : null;
  const selectedDeptGrammar = selectedCode ? getDeptGrammar(selectedCode) : null;
  const selectedDeptStats = selectedCode ? stats.departmentStats[selectedCode] : null;

  const handleLaunchReview = () => {
    soundManager.playClick(500);
    // Priority: weak points first, then undiscovered
    const targets = classification.weak.length > 0 
      ? classification.weak 
      : classification.undiscovered.slice(0, 10);
    onStartWeakPointsSession(targets);
  };

  return (
    <div className="mx-auto flex h-full max-h-full w-full max-w-5xl select-none flex-col gap-3 overflow-hidden">
      {/* Top Banner & Control Strip */}
      <div className="flex shrink-0 flex-col gap-2 rounded-2xl border border-clay-border/80 bg-white px-3 py-2.5 shadow-sm md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3 md:px-5 md:py-3.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2 md:gap-3">
          <h1 className="font-display text-base font-extrabold tracking-tight text-clay sm:text-lg">
            Carte de Maîtrise <span className="hidden text-xs font-normal text-clay-muted md:inline">(101 départements)</span>
          </h1>

          {/* 4 Status Counters */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 rounded-lg border border-[#34A853]/20 bg-[#E8F8EE] px-2.5 py-1 text-[#208038]" title="Maîtrisés">
              <span className="h-2 w-2 rounded-full bg-[#34A853]" />
              <span>{classification.mastered.length}</span>
            </span>

            <span className="flex items-center gap-1.5 rounded-lg border border-[#FBBC04]/20 bg-[#FEF8E7] px-2.5 py-1 text-[#B07D00]" title="En cours">
              <span className="h-2 w-2 rounded-full bg-[#FBBC04]" />
              <span>{classification.learning.length}</span>
            </span>

            <span className="flex items-center gap-1.5 rounded-lg border border-[#EA4335]/20 bg-[#FEECEB] px-2.5 py-1 text-[#C5221F]" title="Points faibles">
              <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
              <span>{classification.weak.length}</span>
            </span>

            <span className="flex items-center gap-1.5 rounded-lg border border-clay-border/60 bg-creme-100 px-2.5 py-1 text-clay-muted" title="Non explorés">
              <span className="h-2 w-2 rounded-full bg-[#DDD3C7]" />
              <span>{classification.undiscovered.length}</span>
            </span>
          </div>
        </div>

        {/* Direct Catch-Up CTA */}
        <button
          type="button"
          onClick={handleLaunchReview}
          className="flex min-h-11 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-terracotta px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-terracotta-hover md:w-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>
            {classification.weak.length > 0
              ? `Rattraper (${classification.weak.length})`
              : 'Explorer'}
          </span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Main Map + Inspector */}
      <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-3">
        <div className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-clay-border/80 bg-white p-2.5 shadow-sm md:p-3 lg:col-span-2">
          <HeroicFranceMap
            className="h-full max-h-full w-full max-w-full"
            interactive={true}
            showTooltip={true}
            customDeptColors={classification.customColors}
            onDepartmentClick={(code) => {
              soundManager.playClick(440);
              setSelectedCode(code);
            }}
          />
        </div>

        {/* Desktop side inspector / mobile bottom sheet when selected */}
        <div
          className={`overflow-y-auto overscroll-contain rounded-t-2xl rounded-b-none border border-clay-border/80 bg-white p-3 shadow-sm safe-bottom md:rounded-2xl md:p-4 lg:flex lg:flex-col lg:justify-between ${
            selectedDept
              ? 'absolute inset-x-0 bottom-0 z-30 max-h-[46%] lg:static lg:max-h-none lg:rounded-2xl'
              : 'hidden lg:flex'
          }`}
        >
          {selectedDept && selectedDeptGrammar ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-clay-border/60 pb-3">
                <div>
                  <div className="font-mono text-xs font-bold text-terracotta">
                    Département {selectedDept.code}
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-clay">
                    {selectedDeptGrammar.withArticle}
                  </h3>
                  <div className="text-xs text-clay-muted">
                    Préfecture : <strong>{selectedDept.prefecture}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCode(null)}
                  className="touch-target flex cursor-pointer items-center justify-center rounded-xl bg-creme-100 p-2 text-clay-muted transition hover:bg-creme-200 hover:text-clay"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 rounded-xl border border-clay-border/60 bg-creme-100 p-3">
                <div className="text-xs font-bold text-clay">Mes performances :</div>
                {selectedDeptStats && selectedDeptStats.attempts > 0 ? (
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg border border-clay-border/40 bg-white p-2">
                      <div className="text-base font-extrabold text-clay">
                        {Math.round((selectedDeptStats.correct / selectedDeptStats.attempts) * 100)}%
                      </div>
                      <div className="text-[10px] text-clay-muted">Réussite</div>
                    </div>
                    <div className="rounded-lg border border-clay-border/40 bg-white p-2">
                      <div className="text-base font-extrabold text-clay">
                        {selectedDeptStats.correct} / {selectedDeptStats.attempts}
                      </div>
                      <div className="text-[10px] text-clay-muted">Tentatives</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs italic text-clay-muted">
                    Aucune question rencontrée sur ce département pour l&apos;instant.
                  </p>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-clay">Région : </span>
                  <span className="text-clay-muted">{selectedDept.regionName}</span>
                </div>
                {selectedDept.specialties && selectedDept.specialties.length > 0 && (
                  <div>
                    <span className="font-bold text-clay">Spécialités : </span>
                    <span className="text-clay-muted">{selectedDept.specialties.join(', ')}</span>
                  </div>
                )}
                {selectedDept.academicFact && (
                  <p className="rounded-lg border border-clay-border/40 bg-creme-50 p-2.5 text-xs leading-relaxed text-clay-muted">
                    📖 {selectedDept.academicFact}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onStartWeakPointsSession([selectedDept.code])}
                className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-clay-border bg-creme-100 py-2.5 text-xs font-bold text-clay transition hover:bg-creme-200"
              >
                <Target className="h-3.5 w-3.5 text-terracotta" />
                <span>M&apos;entraîner sur ce territoire</span>
              </button>
            </div>
          ) : (
            <div className="hidden space-y-2 py-8 text-center text-clay-muted lg:block">
              <Compass className="mx-auto h-8 w-8 text-clay-subtle opacity-50" />
              <p className="text-xs font-medium">
                Sélectionne un département sur la carte pour consulter tes statistiques.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
