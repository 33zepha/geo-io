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
    <div className="w-full max-w-5xl mx-auto h-full max-h-full flex flex-col justify-between gap-2 overflow-hidden select-none">
      {/* Top Banner & Control Strip */}
      <div className="bg-white border border-clay-border/80 rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-sm sm:text-base font-extrabold text-clay font-display tracking-tight">
            Carte de Maîtrise <span className="text-clay-muted text-xs font-normal hidden sm:inline">(101 départements)</span>
          </h1>

          {/* 4 Status Counters */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E8F8EE] text-[#208038] border border-[#34A853]/20" title="Maîtrisés">
              <span className="w-2 h-2 rounded-full bg-[#34A853]" />
              <span>{classification.mastered.length}</span>
            </span>

            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF8E7] text-[#B07D00] border border-[#FBBC04]/20" title="En cours">
              <span className="w-2 h-2 rounded-full bg-[#FBBC04]" />
              <span>{classification.learning.length}</span>
            </span>

            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEECEB] text-[#C5221F] border border-[#EA4335]/20" title="Points faibles">
              <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
              <span>{classification.weak.length}</span>
            </span>

            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-creme-100 text-clay-muted border border-clay-border/60" title="Non explorés">
              <span className="w-2 h-2 rounded-full bg-[#DDD3C7]" />
              <span>{classification.undiscovered.length}</span>
            </span>
          </div>
        </div>

        {/* Direct Catch-Up CTA */}
        <button
          onClick={handleLaunchReview}
          className="px-3.5 py-1.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>
            {classification.weak.length > 0 
              ? `Rattraper mes ${classification.weak.length} points faibles`
              : 'Explorer les territoires inconnus'}
          </span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Main Map Container with Side Inspector Card */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-2.5 overflow-hidden">
        {/* Map (col-span-2) */}
        <div className="lg:col-span-2 bg-white border border-clay-border/80 rounded-2xl p-2 shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
          <HeroicFranceMap
            className="w-full h-full max-w-full max-h-full"
            interactive={true}
            showTooltip={true}
            customDeptColors={classification.customColors}
            onDepartmentClick={(code) => {
              soundManager.playClick(440);
              setSelectedCode(code);
            }}
          />
        </div>

        {/* Selected Department Details Inspector (col-span-1) */}
        <div className="bg-white border border-clay-border/80 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col justify-between overflow-y-auto">
          {selectedDept && selectedDeptGrammar ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-clay-border/60 pb-3">
                <div>
                  <div className="text-xs font-mono font-bold text-terracotta">
                    Département {selectedDept.code}
                  </div>
                  <h3 className="text-lg font-display font-extrabold text-clay">
                    {selectedDeptGrammar.withArticle}
                  </h3>
                  <div className="text-xs text-clay-muted">
                    Préfecture : <strong>{selectedDept.prefecture}</strong>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCode(null)}
                  className="p-1.5 rounded-lg bg-creme-100 hover:bg-creme-200 text-clay-muted hover:text-clay transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Performance Stats on this Department */}
              <div className="bg-creme-100 p-3 rounded-xl border border-clay-border/60 space-y-2">
                <div className="text-xs font-bold text-clay">Mes performances :</div>
                {selectedDeptStats && selectedDeptStats.attempts > 0 ? (
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white p-2 rounded-lg border border-clay-border/40">
                      <div className="text-base font-extrabold text-clay">
                        {Math.round((selectedDeptStats.correct / selectedDeptStats.attempts) * 100)}%
                      </div>
                      <div className="text-[10px] text-clay-muted">Réussite</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-clay-border/40">
                      <div className="text-base font-extrabold text-clay">
                        {selectedDeptStats.correct} / {selectedDeptStats.attempts}
                      </div>
                      <div className="text-[10px] text-clay-muted">Tentatives</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-clay-muted italic">
                    Aucune question rencontrée sur ce département pour l'instant.
                  </p>
                )}
              </div>

              {/* Key Geography Facts */}
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
                  <p className="text-xs text-clay-muted bg-creme-50 p-2.5 rounded-lg border border-clay-border/40 leading-relaxed">
                    📖 {selectedDept.academicFact}
                  </p>
                )}
              </div>

              {/* Practice Single Department Button */}
              <button
                onClick={() => onStartWeakPointsSession([selectedDept.code])}
                className="w-full py-2.5 rounded-xl bg-creme-100 hover:bg-creme-200 border border-clay-border text-clay font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Target className="w-3.5 h-3.5 text-terracotta" />
                <span>M'entraîner sur ce territoire</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 space-y-2 text-clay-muted">
              <Compass className="w-8 h-8 text-clay-subtle mx-auto opacity-50" />
              <p className="text-xs font-medium">
                Sélectionne un département sur la carte pour consulter tes statistiques détaillées et ses spécificités.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
