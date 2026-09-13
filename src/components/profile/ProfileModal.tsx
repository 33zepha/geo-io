'use client';

import React, { useState } from 'react';
import { PlayerStats } from '../../types/geo';
import { BADGES } from '../../data/badges';
import { getRankForXp } from '../../lib/storage';
import { useAuth } from '../../lib/authContext';
import { getAvatarById } from '../../data/avatars';
import { AvatarPicker } from './AvatarPicker';
import { X, Trophy, Flame, Target, BookOpen, Award, CheckCircle2, User, LogOut, LogIn, Edit2, Save, MapPin } from 'lucide-react';
import { soundManager } from '../../lib/audio';

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
  const [pseudo, setPseudo] = useState(user?.pseudo || 'Étudiant');
  const [avatarId, setAvatarId] = useState(user?.avatarId || 'boussole');
  const [favoriteDept, setFavoriteDept] = useState(user?.favoriteDept || '75');
  const [university, setUniversity] = useState(user?.university || '');

  if (!isOpen) return null;

  const rankInfo = getRankForXp(stats.xp);
  const activeAvatar = getAvatarById(user?.avatarId || 'boussole');

  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 85;

  const masteredDeptsCount = Object.values(stats.departmentStats || {}).filter(
    (d) => d.correct >= 1
  ).length;

  const handleSaveProfile = async () => {
    soundManager.playSuccess(2);
    await updateProfile({
      pseudo,
      avatarId,
      favoriteDept,
      university,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-clay/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-2 border-clay-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-soft-lg space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClick(400);
            onClose();
          }}
          className="absolute top-5 right-5 p-2.5 rounded-2xl bg-creme-200 hover:bg-creme-300 text-clay-muted hover:text-clay transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header with Avatar & Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Emblème */}
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-400 to-terracotta p-1 shadow-sm shrink-0">
              <div className="w-full h-full bg-white rounded-[20px] flex items-center justify-center text-3xl shadow-inner">
                {activeAvatar.emoji}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-display font-extrabold uppercase tracking-wider text-terracotta">
                  {activeAvatar.title}
                </span>
                {user?.favoriteDept && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-300">
                    <MapPin className="w-2.5 h-2.5 text-amber-700" />
                    <span>Dép. {user.favoriteDept}</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-clay font-display tracking-tight">
                {user?.pseudo || rankInfo.title}
              </h2>

              <p className="text-xs text-clay-muted font-medium flex items-center gap-2 mt-0.5">
                <span>Niveau {rankInfo.level} • {stats.xp.toLocaleString('fr-FR')} XP</span>
                {user?.university && (
                  <>
                    <span>•</span>
                    <span className="text-clay font-semibold">{user.university}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons (Edit Profile / Login) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick(420);
                setIsEditing(!isEditing);
              }}
              className="px-3.5 py-2 rounded-xl bg-creme-100 hover:bg-creme-200 border border-clay-border text-clay text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Fermer' : 'Modifier profil'}</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={async () => {
                  soundManager.playClick(380);
                  await signOut();
                }}
                className="p-2 rounded-xl bg-creme-100 hover:bg-coral-light hover:text-coral-dark text-clay-muted transition cursor-pointer"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              onOpenAuth && (
                <button
                  onClick={() => {
                    soundManager.playClick(460);
                    onOpenAuth();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Connexion</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Profile Customization Form (when isEditing is true) */}
        {isEditing && (
          <div className="bg-creme-50 p-5 rounded-2xl border-2 border-clay-border space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-clay-border/60 pb-2.5">
              <h3 className="text-sm font-display font-bold text-clay flex items-center gap-2">
                <span>🎨 Personnalisation de votre identité étudiante</span>
              </h3>
              <button
                onClick={handleSaveProfile}
                className="px-3 py-1.5 rounded-xl bg-sage hover:bg-sage-dark text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-clay-muted mb-1">
                Pseudo affiché au classement
              </label>
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-clay-border text-xs font-semibold text-clay focus:outline-none focus:border-terracotta"
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
        )}

        {/* Level XP Bar */}
        <div className="space-y-2 bg-creme-100 p-4 rounded-2xl border border-clay-border">
          <div className="flex justify-between text-xs font-display font-bold">
            <span className="text-clay">Progression vers le niveau {rankInfo.level + 1}</span>
            <span className="text-terracotta font-extrabold">{rankInfo.progressPercent}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-clay-border">
            <div
              className="bg-gradient-to-r from-terracotta to-honey h-full rounded-full transition-all duration-500"
              style={{ width: `${rankInfo.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-clay-subtle">
            <span>{rankInfo.currentLevelXp} XP</span>
            <span>{rankInfo.nextLevelXp} XP nécessaires</span>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-creme-100 p-3.5 rounded-2xl border border-clay-border text-center">
            <Flame className="w-5 h-5 text-honey mx-auto mb-1 fill-honey/20" />
            <div className="text-xl font-display font-extrabold text-clay">{stats.streak} j</div>
            <div className="text-[10px] font-display font-bold text-clay-muted uppercase">Série</div>
          </div>

          <div className="bg-creme-100 p-3.5 rounded-2xl border border-clay-border text-center">
            <Target className="w-5 h-5 text-terracotta mx-auto mb-1" />
            <div className="text-xl font-display font-extrabold text-clay">{accuracy}%</div>
            <div className="text-[10px] font-display font-bold text-clay-muted uppercase">Précision</div>
          </div>

          <div className="bg-creme-100 p-3.5 rounded-2xl border border-clay-border text-center">
            <BookOpen className="w-5 h-5 text-lagon mx-auto mb-1" />
            <div className="text-xl font-display font-extrabold text-clay">{stats.totalGames}</div>
            <div className="text-[10px] font-display font-bold text-clay-muted uppercase">Parties</div>
          </div>

          <div className="bg-creme-100 p-3.5 rounded-2xl border border-clay-border text-center">
            <CheckCircle2 className="w-5 h-5 text-sage mx-auto mb-1" />
            <div className="text-xl font-display font-extrabold text-clay">{masteredDeptsCount} / 101</div>
            <div className="text-[10px] font-display font-bold text-clay-muted uppercase">Maîtrisés</div>
          </div>
        </div>

        {/* High Scores Summary */}
        <div className="bg-creme-100 p-4 rounded-2xl border border-clay-border space-y-2">
          <div className="text-xs font-display font-bold uppercase tracking-wider text-clay-muted mb-2">
            Records Personnels
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-clay-border/60">
              <div className="text-xs text-clay-muted font-medium">Pointage</div>
              <div className="font-display font-extrabold text-terracotta text-sm sm:text-base">
                {stats.highScorePointage} pts
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-clay-border/60">
              <div className="text-xs text-clay-muted font-medium">Enquête</div>
              <div className="font-display font-extrabold text-lagon text-sm sm:text-base">
                {stats.highScoreMaster} pts
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-clay-border/60">
              <div className="text-xs text-clay-muted font-medium">Silhouette</div>
              <div className="font-display font-extrabold text-honey text-sm sm:text-base">
                {stats.highScoreSilhouette || 0} pts
              </div>
            </div>
          </div>
        </div>

        {/* Badges Collection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-terracotta" />
              <h3 className="font-display font-bold text-sm text-clay">
                Insignes Géographiques ({stats.unlockedBadges.length} / {BADGES.length})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {BADGES.map((badge) => {
              const isUnlocked = stats.unlockedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-2xl border text-center transition ${
                    isUnlocked
                      ? 'bg-creme-100 border-clay-border'
                      : 'bg-creme-200/40 border-dashed border-clay-border/40 opacity-40 grayscale'
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="font-display font-bold text-xs text-clay truncate">
                    {badge.title}
                  </div>
                  <div className="text-[10px] text-clay-muted mt-0.5 line-clamp-2 leading-tight">
                    {badge.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
