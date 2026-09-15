'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Lock, Mail, User, X } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { soundManager } from '../../lib/audio';
import { fetchCompetition } from '../../lib/competitionService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatoryGate?: boolean;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isMandatoryGate = false,
  initialTab,
}) => {
  const { isAuthenticated, signInWithEmail, signUpWithEmail } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(
    initialTab || (isMandatoryGate ? 'register' : 'login')
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [competitionVisible, setCompetitionVisible] = useState(false);

  useEffect(() => {
    if (!isOpen || !isMandatoryGate) return;
    setCompetitionVisible(false);
    void fetchCompetition()
      .then((result) => setCompetitionVisible(result.overview.enabled))
      .catch(() => setCompetitionVisible(false));
  }, [isOpen, isMandatoryGate]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Veuillez renseigner une adresse email valide.');
      soundManager.playError();
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      soundManager.playError();
      return;
    }
    if (tab === 'register' && !pseudo.trim()) {
      setError('Veuillez choisir un pseudo pour le classement.');
      soundManager.playError();
      return;
    }

    setLoading(true);
    soundManager.playClick(440);

    try {
      const result = tab === 'register'
        ? await signUpWithEmail(cleanEmail, password, pseudo)
        : await signInWithEmail(cleanEmail, password);

      if (result.error) {
        setError(result.error);
        soundManager.playError();
        return;
      }

      soundManager.playSuccess(tab === 'register' ? 3 : 2);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Une erreur de connexion est survenue.');
      soundManager.playError();
    } finally {
      setLoading(false);
    }
  };

  const changeTab = (nextTab: 'login' | 'register') => {
    setTab(nextTab);
    setError(null);
    soundManager.playClick(nextTab === 'register' ? 440 : 420);
  };

  const isDismissible = !isMandatoryGate && isAuthenticated;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-clay/55 p-0 backdrop-blur-md animate-fade-in md:items-center md:p-4">
      <div className="panel-enter relative flex max-h-[min(92dvh,40rem)] w-full max-w-none flex-col overflow-hidden rounded-t-3xl border-2 border-clay-border bg-white shadow-soft-lg safe-bottom md:max-w-md md:rounded-3xl">
        {isDismissible && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(380);
              onClose();
            }}
            className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-xl bg-creme-100 text-clay-muted transition hover:bg-creme-200 hover:text-clay"
            title="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-6 scrollbar-thin sm:p-7">
            <div className="space-y-2 pt-1 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-terracotta/20 bg-terracotta/10 text-2xl font-bold text-terracotta shadow-2xs">
                🏛️
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-honey/40 bg-honey-light px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-honey-dark">
                <span>Promotion L1 • Geo.io</span>
              </div>
              <h2 className="font-display text-xl font-black text-clay">
                {tab === 'register' ? 'Rejoindre la Promotion' : 'Connexion Étudiante'}
              </h2>
              <p className="mx-auto max-w-xs text-sm font-medium leading-relaxed text-clay-muted sm:text-xs">
                {tab === 'register'
                  ? 'Créez votre profil pour participer aux épreuves et au classement.'
                  : 'Retrouvez votre profil, votre progression et votre place au classement.'}
              </p>
            </div>

            {isMandatoryGate && competitionVisible && (
              <div className="rounded-2xl border border-honey/35 bg-honey-light/70 p-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-terracotta">Missions du jour</div>
                    <div className="font-display text-sm font-extrabold text-clay">100 points à prendre aujourd’hui</div>
                  </div>
                  <span className="rounded-full bg-clay px-2.5 py-1 text-[10px] font-bold text-white">Hebdo · /700</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-clay-muted">Deux sélections communes à toute la promo. Connecte-toi pour enregistrer tes résultats officiels.</p>
              </div>
            )}

            <div className="flex rounded-xl border border-clay-border bg-creme-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => changeTab('register')}
                className={`pressable min-h-11 flex-1 cursor-pointer rounded-lg py-2.5 transition-all ${
                  tab === 'register'
                    ? 'border border-clay-border/40 bg-white text-clay shadow-xs'
                    : 'text-clay-muted hover:text-clay'
                }`}
              >
                Créer un compte
              </button>
              <button
                type="button"
                onClick={() => changeTab('login')}
                className={`pressable min-h-11 flex-1 cursor-pointer rounded-lg py-2.5 transition-all ${
                  tab === 'login'
                    ? 'border border-clay-border/40 bg-white text-clay shadow-xs'
                    : 'text-clay-muted hover:text-clay'
                }`}
              >
                Se connecter
              </button>
            </div>

            {error && (
              <div className="fade-rise rounded-2xl border border-coral/30 bg-coral-light p-3 text-xs font-medium leading-relaxed text-coral-dark">
                {error}
              </div>
            )}

            {tab === 'register' && (
              <div className="space-y-1.5">
                <label className="block font-display text-xs font-bold uppercase tracking-wider text-clay-muted">
                  Pseudo au classement
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-clay-muted" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={pseudo}
                    onChange={(event) => setPseudo(event.target.value)}
                    placeholder="Ex : Lucas_Sorbonne"
                    maxLength={24}
                    autoComplete="nickname"
                    className="w-full rounded-xl border border-clay-border bg-creme-100/50 py-3 pl-10 pr-3 text-base font-semibold text-clay transition placeholder:text-clay-subtle focus:border-terracotta focus:bg-white focus:outline-none sm:text-xs"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-clay-muted">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-clay-muted" />
                <input
                  type="email"
                  required
                  autoFocus={tab === 'login'}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="etudiant@universite.fr"
                  autoComplete="email"
                  className="w-full rounded-xl border border-clay-border bg-creme-100/50 py-3 pl-10 pr-3 text-base font-semibold text-clay transition placeholder:text-clay-subtle focus:border-terracotta focus:bg-white focus:outline-none sm:text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-display text-xs font-bold uppercase tracking-wider text-clay-muted">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-clay-muted" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="6 caractères minimum"
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  className="w-full rounded-xl border border-clay-border bg-creme-100/50 py-3 pl-10 pr-3 text-base font-semibold text-clay transition placeholder:text-clay-subtle focus:border-terracotta focus:bg-white focus:outline-none sm:text-xs"
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 space-y-2.5 border-t border-clay-border/70 bg-white px-6 py-4 sm:px-7">
            <button
              type="submit"
              disabled={loading}
              className="btn-3d flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-b-terracotta-dark bg-terracotta px-4 py-3 font-display text-sm font-bold text-white shadow-soft transition hover:bg-terracotta-hover disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <span>{tab === 'register' ? 'Créer mon compte' : 'Se connecter'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] leading-normal text-clay-muted">
              🔒 Session enregistrée sur cet appareil jusqu’à déconnexion.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
