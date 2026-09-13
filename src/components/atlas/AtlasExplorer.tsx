'use client';

import React, { useState, useMemo } from 'react';
import { InteractiveFranceMap } from '../map/InteractiveFranceMap';
import { DEPARTMENTS, DEPARTMENTS_LIST } from '../../data/departments';
import { REGIONS } from '../../data/regions';
import { Department } from '../../types/geo';
import { soundManager } from '../../lib/audio';
import { Compass, Search, MapPin, Users, Mountain, Waves, Sparkles, BookOpen, Layers } from 'lucide-react';

export const AtlasExplorer: React.FC = () => {
  const [selectedCode, setSelectedCode] = useState<string>('33'); // Default to Gironde
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');

  const selectedDept: Department = useMemo(() => {
    return DEPARTMENTS[selectedCode] || DEPARTMENTS['33'];
  }, [selectedCode]);

  // Highlight codes based on region filter
  const highlightCodes = useMemo(() => {
    if (selectedRegionFilter === 'all') return [];
    const reg = REGIONS[selectedRegionFilter];
    return reg ? reg.departments : [];
  }, [selectedRegionFilter]);

  // Search filter
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return DEPARTMENTS_LIST.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.prefecture.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSelectDepartment = (code: string) => {
    soundManager.playClick();
    setSelectedCode(code);
    setSearchQuery('');
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
      {/* Left Column: Territorial Dossier Card & Search */}
      <div className="w-full lg:w-[420px] flex flex-col gap-4">
        {/* Search & Region Filter Bar */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un département, code ou préfecture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            {filteredDepartments.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 border border-slate-800 rounded-xl overflow-hidden shadow-2xl z-30 divide-y divide-slate-800/60">
                {filteredDepartments.map((d) => (
                  <button
                    key={d.code}
                    onClick={() => handleSelectDepartment(d.code)}
                    className="w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-500/10 hover:text-emerald-300 transition text-slate-300 cursor-pointer"
                  >
                    <span>{d.name} ({d.code})</span>
                    <span className="text-[10px] text-slate-500">{d.prefecture}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">Toutes les régions (Hexagone & DROM)</option>
              {Object.values(REGIONS).map((reg) => (
                <option key={reg.code} value={reg.code}>
                  {reg.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Department Rich Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Title */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                Fiche Territoire • {selectedDept.regionName}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                <span>{selectedDept.name}</span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-sm border border-emerald-500/30">
                  {selectedDept.code}
                </span>
              </h2>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Administrative Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mb-0.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                PRÉFECTURE
              </div>
              <div className="font-semibold text-slate-200">{selectedDept.prefecture}</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-emerald-400" />
                DÉMOGRAPHIE
              </div>
              <div className="font-semibold text-slate-200">
                {selectedDept.population.toLocaleString('fr-FR')} hab. ({selectedDept.density} h/km²)
              </div>
            </div>
          </div>

          {/* Relief & Hydrography */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
              <Mountain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Relief & Géomorphologie :</span>{' '}
                <span className="text-slate-400">{selectedDept.relief}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
              <Waves className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Réseau hydrographique :</span>{' '}
                <span className="text-slate-400">{selectedDept.hydrography.join(', ')}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Spécialités & Économie :</span>{' '}
                <span className="text-slate-400">{selectedDept.specialties.join(' • ')}</span>
              </div>
            </div>
          </div>

          {/* Deep Academic Fact / Licence Géo Insight */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <BookOpen className="w-4 h-4" />
              <span>Analyse Territoriale (Niveau Universitaire)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedDept.academicFact}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive France Map */}
      <div className="flex-1 w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl relative">
        <div className="flex justify-between items-center mb-2 px-2 text-xs text-slate-400">
          <span>Clique sur n\'importe quel département pour ouvrir sa fiche territoriale</span>
          <span className="font-mono text-emerald-400">101 Territoires répertoriés</span>
        </div>

        <InteractiveFranceMap
          interactive={true}
          onDepartmentClick={handleSelectDepartment}
          selectedCode={selectedCode}
          highlightCodes={highlightCodes}
        />
      </div>
    </div>
  );
};
