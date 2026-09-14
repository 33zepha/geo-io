'use client';

import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, User, X } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { soundManager } from '../../lib/audio';

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-clay/55 p-0 backdrop-blur-md animate-fade-in sm:items-center sm:p-4">
      <div className="panel-enter relative flex max-h-[min(92dvh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-2 border-clay-border bg-white shadow-soft-lg sm:rounded-3xl">
      <div className="space-y-5 overflow-y-auto p-6 scrollbar-thin sm:p-7">
        {isDismissible && (
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(380);
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-creme-100 hover:bg-creme-200 text-clay-muted hover:text-clay transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta text-2xl font-bold shadow-2xs">
            🏛️
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-honey-light border border-honey/40 text-honey-dark text-[11px] font-bold uppercase tracking-wider">
            <span>Promotion L1 • Geo.io</span>
          </div>
          <h2 className="text-xl font-black text-clay font-display">
            {tab === 'register' ? 'Rejoindre la Promotion' : 'Connexion Étudiante'}
          </h2>
          <p className="text-xs text-clay-muted font-medium max-w-xs mx-auto leading-relaxed">
            {tab === 'register'
              ? 'Créez votre profil pour participer aux épreuves et au classement.'
              : 'Retrouvez votre profil, votre progression et votre place au classement.'}
          </p>
        </div>

        <div className="flex p-1 bg-creme-100 rounded-xl border border-clay-border text-xs font-bold">
          <button
            type="button"
            onClick={() => changeTab('register')}
            className={`pressable flex-1 cursor-pointer rounded-lg py-2.5 transition-all ${
              tab === 'register'
                ? 'bg-white text-clay shadow-xs border border-clay-border/40'
                : 'text-clay-muted hover:text-clay'
            }`}
          >
            Créer un compte
          </button>
          <button
            type="button"
            onClick={() => changeTab('login')}
            className={`pressable flex-1 cursor-pointer rounded-lg py-2.5 transition-all ${
              tab === 'login'
                ? 'bg-white text-clay shadow-xs border border-clay-border/40'
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-clay-muted">
                Pseudo au classement
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-clay-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={pseudo}
                  onChange={(event) => setPseudo(event.target.value)}
                  placeholder="Ex : Lucas_Sorbonne"
                  maxLength={24}
                  autoComplete="nickname"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-creme-100/50 border border-clay-border text-base sm:text-xs font-semibold text-clay placeholder:text-clay-subtle focus:bg-white focus:outline-none focus:border-terracotta transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-clay-muted">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-clay-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                autoFocus={tab === 'login'}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="etudiant@universite.fr"
                autoComplete="email"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-creme-100/50 border border-clay-border text-base sm:text-xs font-semibold text-clay placeholder:text-clay-subtle focus:bg-white focus:outline-none focus:border-terracotta transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-clay-muted">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-clay-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="6 caractères minimum"
                autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-creme-100/50 border border-clay-border text-base sm:text-xs font-semibold text-clay placeholder:text-clay-subtle focus:bg-white focus:outline-none focus:border-terracotta transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-3d flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-b-terracotta-dark bg-terracotta px-4 py-3 font-display text-xs font-bold text-white shadow-soft transition hover:bg-terracotta-hover disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{tab === 'register' ? 'Créer mon compte' : 'Se connecter'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="p-2.5 rounded-xl bg-creme-100/60 border border-clay-border/60 text-[11px] text-clay-muted text-center leading-normal">
            🔒 Votre session reste enregistrée sur cet appareil jusqu’à la déconnexion.
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};
