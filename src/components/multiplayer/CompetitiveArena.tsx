'use client';

import React, { useState } from 'react';
import { Swords, Trophy, Users, Shield, Zap, Sparkles, Globe, Lock, Play, UserCheck } from 'lucide-react';
import { soundManager } from '../../lib/audio';

interface LeaderboardEntry {
  rank: number;
  username: string;
  rating: number;
  league: string;
  winRate: string;
  badge: string;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'ElieCarto', rating: 2450, league: 'Agrégé Suprême', winRate: '88%', badge: '👑' },
  { rank: 2, username: 'VidalDeLaBlache', rating: 2380, league: 'Agrégé Suprême', winRate: '84%', badge: '🎖️' },
  { rank: 3, username: 'Strabon93', rating: 2290, league: 'Maître Géographe', winRate: '79%', badge: '⚡' },
  { rank: 4, username: 'ArpenteurBreton', rating: 2150, league: 'Maître Géographe', winRate: '76%', badge: '🌊' },
  { rank: 5, username: 'BassinParisienPro', rating: 2020, league: 'Topographe Averti', winRate: '72%', badge: '🏙️' },
];

export const CompetitiveArena: React.FC = () => {
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [searchSeconds, setSearchSeconds] = useState(0);

  const toggleSearch = () => {
    soundManager.playClick();
    if (!isSearchingMatch) {
      setIsSearchingMatch(true);
      setSearchSeconds(0);
      const interval = setInterval(() => {
        setSearchSeconds((s) => s + 1);
      }, 1000);
      // Mock match found after 4s
      setTimeout(() => {
        clearInterval(interval);
        setIsSearchingMatch(false);
        alert('🎯 Adversaire trouvé ! (Simulation : Match 1v1 en temps réel prêt à être branché sur Supabase Realtime)');
      }, 4500);
    } else {
      setIsSearchingMatch(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Top Banner: Arena Matchmaking */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono">
              <Swords className="w-3.5 h-3.5" />
              <span>SAISON 1 • DUELS EN LIGNE (BÊTA MULTIJOUEUR)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Affronte d\'autres géographes en temps réel
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Même carte, même consigne : le premier joueur qui pointe le bon département empoche les points. 
              Enchaîne les victoires pour grimper les divisions classées et remporter des titres exclusifs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={toggleSearch}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
                isSearchingMatch
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-purple-500/25'
              }`}
            >
              {isSearchingMatch ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  <span>Recherche d\'un rival ({searchSeconds}s)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Lancer un Duel 1v1 Classé</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Game Types & Cloud Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Duel Rapide */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Duel Sprint 1v1</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            10 cibles aléatoires. Le premier qui clique valide le point. Pénalité de 3 secondes en cas de fausse réponse.
          </p>
          <div className="pt-2">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/20">
              Format Standard • 2 min
            </span>
          </div>
        </div>

        {/* Card 2: Bataille des Régions */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Conquête Territoriale</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Affrontement stratégique : chaque bonne réponse colore un département à vos couleurs pour encercler la carte de France.
          </p>
          <div className="pt-2">
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-500/20">
              Contrôle de Zones • 4 joueurs
            </span>
          </div>
        </div>

        {/* Card 3: Cloud Account & Sync */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Compte & Sauvegarde Cloud</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Synchronise tes statistiques, préserve ta série quotidienne (streak) sur tous tes appareils et débloque le classement mondial.
          </p>
          <div className="pt-2">
            <button
              onClick={() => alert('Architecture Supabase prête : le connecteur Auth + PostgreSQL s\'activera avec vos clés d\'environnement !')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Créer mon Compte Compétiteur</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Classement National • Ligue des Maîtres</h3>
              <p className="text-xs text-slate-400">Actualisé chaque dimanche à minuit</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Semaine 37</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-500">
                <th className="pb-3 pl-2">Rang</th>
                <th className="pb-3">Géographe</th>
                <th className="pb-3">Division</th>
                <th className="pb-3 text-right">Cote ELO</th>
                <th className="pb-3 text-right pr-2">Victoires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {MOCK_LEADERBOARD.map((p) => (
                <tr key={p.rank} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 pl-2 font-mono font-bold text-slate-300">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      p.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      p.rank === 2 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30' :
                      p.rank === 3 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                      'text-slate-500'
                    }`}>
                      {p.rank}
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-200 flex items-center gap-2">
                    <span>{p.badge}</span>
                    <span>{p.username}</span>
                  </td>
                  <td className="py-3.5 text-slate-400 font-mono text-[11px]">{p.league}</td>
                  <td className="py-3.5 text-right font-mono font-bold text-emerald-400">{p.rating}</td>
                  <td className="py-3.5 text-right pr-2 font-mono text-slate-300">{p.winRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
