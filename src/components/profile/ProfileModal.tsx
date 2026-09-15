'use client';

import React, { useEffect, useState } from 'react';
import { PlayerStats } from '../../types/geo';
import { BADGES } from '../../data/badges';
import { getRankForXp } from '../../lib/storage';
import { useAuth } from '../../lib/authContext';
import { getAvatarById } from '../../data/avatars';
import { AvatarPicker } from './AvatarPicker';
import {
  X,
  Flame,
  Target,
  BookOpen,
  Award,
  CheckCircle2,
  LogOut,
  LogIn,
  Edit2,
  Save,
  MapPin,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { soundManager } from '../../lib/audio';
import { fetchCompetition } from '../../lib/competitionService';
import type { CompetitionOverview } from '../../types/competition';

interface ProfileModalProps {
  stats: PlayerStats;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  stats,
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pseudo, setPseudo] = useState(user?.pseudo || 'Étudiant');
  const [avatarId, setAvatarId] = useState(user?.avatarId || 'boussole');
  const [favoriteDept, setFavoriteDept] = useState(user?.favoriteDept || '75');
  const [university, setUniversity] = useState(user?.university || '');
  const [competition, setCompetition] = useState<CompetitionOverview | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsEditing(false);
    setIsSaving(false);
    setPseudo(user?.pseudo || 'Étudiant');
    setAvatarId(user?.avatarId || 'boussole');
    setFavoriteDept(user?.favoriteDept || '75');
    setUniversity(user?.university || '');
    void fetchCompetition().then((result) => setCompetition(result.overview)).catch(() => setCompetition(null));
  }, [isOpen, user]);

  if (!isOpen) return null;

  const rankInfo = getRankForXp(stats.xp);
  const activeAvatar = getAvatarById(user?.avatarId || avatarId || 'boussole');

  const accuracy =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;

  const masteredDeptsCount = Object.values(stats.departmentStats || {}).filter(
    (d) => d.correct >= 1
  ).length;

  const xpRemaining = Math.max(0, rankInfo.nextLevelXp - rankInfo.currentLevelXp);

  const handleSaveProfile = async () => {
    if (!isAuthenticated || !pseudo.trim()) {
      soundManager.playError();
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        pseudo: pseudo.trim(),
        avatarId,
        favoriteDept,
        university: university.trim(),
      });
      soundManager.playSuccess(2);
      setIsEditing(false);
    } catch {
      soundManager.playError();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    soundManager.playClick(380);
    setPseudo(user?.pseudo || 'Étudiant');
    setAvatarId(user?.avatarId || 'boussole');
    setFavoriteDept(user?.favoriteDept || '75');
    setUniversity(user?.university || '');
    setIsEditing(false);
  };

  const metrics = [
    {
      icon: Flame,
      value: `${stats.streak} j`,
      label: 'Série',
      iconClass: 'text-honey fill-honey/20',
    },
    {
      icon: Target,
      value: `${accuracy}%`,
      label: 'Précision',
      iconClass: 'text-terracotta',
    },
    {
      icon: BookOpen,
      value: String(stats.totalGames),
      label: 'Parties',
      iconClass: 'text-lagon',
    },
    {
      icon: CheckCircle2,
      value: `${masteredDeptsCount}`,
      label: 'Maîtrisés',
      iconClass: 'text-sage',
    },
  ];

  const records = [
    { label: 'Pointage', value: stats.highScorePointage, color: 'text-terracotta' },
    { label: 'Enquête', value: stats.highScoreMaster, color: 'text-lagon' },
    { label: 'Silhouette', value: stats.highScoreSilhouette || 0, color: 'text-honey-dark' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-clay/55 p-0 backdrop-blur-md animate-fade-in md:items-center md:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fermer le profil"
        onClick={() => {
          soundManager.playClick(360);
          onClose();
        }}
      />

      <div
        className="panel-enter safe-bottom relative z-10 flex max-h-[min(92dvh,42rem)] w-full max-w-none flex-col overflow-hidden rounded-t-3xl border-2 border-clay-border bg-white shadow-soft-lg md:max-w-[min(100%,35rem)] md:rounded-3xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-clay-border/60 px-5 py-3.5 sm:px-5">
          {isEditing ? (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="pressable flex min-h-11 items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold text-clay-muted transition hover:bg-creme-100 hover:text-clay md:min-h-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-clay-subtle">
              Mon profil
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              soundManager.playClick(400);
              onClose();
            }}
            className="pressable touch-target rounded-xl bg-creme-100 p-2 text-clay-muted transition hover:bg-creme-200 hover:text-clay md:min-h-0 md:min-w-0"
            title="Fermer"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isEditing ? (
          <>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 scrollbar-thin sm:px-5">
              <div>
                <h2 className="font-display text-lg font-extrabold tracking-tight text-clay">
                  Modifier mon identité
                </h2>
                <p className="mt-0.5 text-xs text-clay-muted">
                  Pseudo, emblème et infos visibles au classement.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-display text-xs font-bold uppercase tracking-wider text-clay-muted">
                  Pseudo au classement
                </label>
                <input
                  type="text"
                  value={pseudo}
                  maxLength={24}
                  onChange={(e) => setPseudo(e.target.value)}
                  className="min-h-12 w-full rounded-xl border border-clay-border bg-creme-100/50 px-3 py-3 text-base font-semibold text-clay transition focus:border-terracotta focus:bg-white focus:outline-none sm:text-sm"
                />
              </div>

              <AvatarPicker
                selectedAvatarId={avatarId}
                selectedFavoriteDept={favoriteDept}
                university={university}
                onSelectAvatar={setAvatarId}
                onSelectFavoriteDept={setFavoriteDept}
                onChangeUniversity={setUniversity}
              />
            </div>

            <div className="shrink-0 border-t border-clay-border/70 bg-white px-4 py-3 sm:px-5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="pressable flex-1 rounded-xl border border-clay-border bg-creme-100 py-2.5 text-xs font-bold text-clay transition hover:bg-creme-200"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isSaving || !pseudo.trim()}
                  onClick={() => void handleSaveProfile()}
                  className="btn-3d flex flex-[1.4] items-center justify-center gap-1.5 rounded-xl border-b-terracotta-dark bg-terracotta py-2.5 text-xs font-bold text-white transition hover:bg-terracotta-hover disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 scrollbar-thin sm:px-5">
            {/* Hero identity */}
            <section className="flex flex-col items-center text-center md:flex-row md:items-center md:gap-4 md:text-left">
              <div className="relative shrink-0">
                <div className={`h-20 w-20 rounded-[1.35rem] p-[3px] shadow-soft ${competition?.rewards.some((reward) => reward.id === 'weekly-frame' && reward.unlocked) ? 'bg-gradient-to-br from-lagon via-honey to-terracotta' : 'bg-gradient-to-br from-honey via-terracotta to-terracotta-dark'}`}>
                  <div className="flex h-full w-full items-center justify-center rounded-[1.15rem] bg-white text-4xl shadow-inner">
                    {activeAvatar.emoji}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-full border border-honey/40 bg-honey-light px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-honey-dark">
                  Nv.{rankInfo.level}
                </div>
              </div>

              <div className="mt-3 min-w-0 flex-1 md:mt-0">
                <div className="mb-1 flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
                  <span className="font-display text-[10px] font-extrabold uppercase tracking-[0.14em] text-terracotta">
                    {activeAvatar.title}
                  </span>
                  {user?.favoriteDept && (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-honey/35 bg-honey-light px-2 py-0.5 font-mono text-[10px] font-bold text-honey-dark">
                      <MapPin className="h-2.5 w-2.5" />
                      {user.favoriteDept}
                    </span>
                  )}
                </div>

                <h2 className="truncate font-display text-2xl font-extrabold tracking-tight text-clay">
                  {user?.pseudo || 'Étudiant'}
                </h2>

                <p className="mt-0.5 text-xs font-medium text-clay-muted">
                  {rankInfo.title} · {stats.xp.toLocaleString('fr-FR')} XP
                </p>

                {competition?.enabled && (
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-honey/30 bg-honey-light px-2 py-0.5 text-[10px] font-bold text-honey-dark">
                    🏆 {competition.weeklyPoints}/700 cette semaine
                    {competition.rewards.some((reward) => reward.id === 'weekly-title' && reward.unlocked) ? ' · Cartographe régulier' : ''}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
                  {user?.university && (
                    <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-clay-border bg-creme-100 px-2 py-0.5 text-[10px] font-semibold text-clay">
                      <GraduationCap className="h-3 w-3 shrink-0 text-clay-muted" />
                      <span className="truncate">{user.university}</span>
                    </span>
                  )}
                  {user?.email && (
                    <span className="truncate text-[10px] text-clay-subtle">{user.email}</span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex shrink-0 items-center gap-2 md:mt-0 md:flex-col md:items-stretch">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick(420);
                        setIsEditing(true);
                      }}
                      className="pressable inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-clay-border bg-creme-100 px-3 py-2 text-xs font-bold text-clay transition hover:bg-creme-200 md:min-h-0"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        soundManager.playClick(380);
                        await signOut();
                        onClose();
                      }}
                      className="pressable inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-clay-border bg-white px-3 py-2 text-xs font-bold text-clay-muted transition hover:border-coral/30 hover:bg-coral-light hover:text-coral-dark md:min-h-0"
                      title="Se déconnecter"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span className="sm:inline">Quitter</span>
                    </button>
                  </>
                ) : (
                  onOpenAuth && (
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick(460);
                        onOpenAuth();
                      }}
                      className="btn-3d inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-b-terracotta-dark bg-terracotta px-3 py-2 text-xs font-bold text-white md:min-h-0"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      Connexion
                    </button>
                  )
                )}
              </div>
            </section>

            {/* XP */}
            <section className="rounded-2xl border border-clay-border bg-creme-100/80 p-4">
              <div className="mb-2 flex items-end justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-clay-muted">
                    Progression
                  </div>
                  <div className="font-display text-sm font-extrabold text-clay">
                    Niveau {rankInfo.level}
                    <span className="mx-1.5 text-clay-subtle">→</span>
                    Niveau {rankInfo.level + 1}
                  </div>
                </div>
                <div className="font-display text-lg font-extrabold text-terracotta">
                  {rankInfo.progressPercent}%
                </div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full border border-clay-border/80 bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-terracotta to-honey transition-[width] duration-700 ease-out"
                  style={{
                    width: `${Number.isFinite(rankInfo.progressPercent) ? rankInfo.progressPercent : 0}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] text-clay-subtle">
                <span>{rankInfo.currentLevelXp} XP</span>
                <span>encore {xpRemaining} XP</span>
              </div>
            </section>

            {/* Stats strip */}
            <section className="overflow-hidden rounded-2xl border border-clay-border bg-white">
              <div className="grid grid-cols-4 divide-x divide-clay-border/70">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="px-2 py-3 text-center">
                      <Icon className={`mx-auto mb-1 h-4 w-4 ${metric.iconClass}`} />
                      <div className="font-display text-base font-extrabold text-clay sm:text-lg">
                        {metric.value}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-wide text-clay-muted">
                        {metric.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Records */}
            <section>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-clay-muted">
                Records personnels
              </div>
              <div className="grid grid-cols-3 gap-2">
                {records.map((record) => (
                  <div
                    key={record.label}
                    className="rounded-2xl border border-clay-border bg-creme-100/70 px-2 py-3 text-center"
                  >
                    <div className="text-[10px] font-medium text-clay-muted">{record.label}</div>
                    <div className={`font-display text-base font-extrabold sm:text-lg ${record.color}`}>
                      {record.value}
                      <span className="ml-0.5 text-[10px] font-bold text-clay-subtle">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Badges */}
            <section className="space-y-2.5 pb-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-terracotta" />
                  <h3 className="font-display text-sm font-bold text-clay">Insignes</h3>
                </div>
                <span className="rounded-full bg-creme-100 px-2 py-0.5 font-mono text-[10px] font-bold text-clay-muted">
                  {stats.unlockedBadges.length}/{BADGES.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {BADGES.map((badge) => {
                  const isUnlocked = stats.unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`rounded-2xl border p-3 text-center transition ${
                        isUnlocked
                          ? 'border-clay-border bg-creme-100'
                          : 'border-dashed border-clay-border/50 bg-creme-50 opacity-45 grayscale'
                      }`}
                    >
                      <div className="mb-1 text-2xl leading-none">{badge.icon}</div>
                      <div className="truncate font-display text-xs font-bold text-clay">
                        {badge.title}
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-clay-muted">
                        {badge.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
