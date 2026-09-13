'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { soundManager } from '../../lib/audio';
import { X, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    continueAsGuest,
  } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          soundManager.playSuccess(2);
          onClose();
        }
      } else {
        const res = await signUpWithEmail(email, password, pseudo || undefined);
        if (res.error) {
          setError(res.error);
        } else {
          soundManager.playSuccess(3);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialGoogle = async () => {
    soundManager.playClick(440);
    const res = await signInWithGoogle();
    if (res.error) {
      setError(res.error);
    } else {
      onClose();
    }
  };

  const handleSocialApple = async () => {
    soundManager.playClick(440);
    const res = await signInWithApple();
    if (res.error) {
      setError(res.error);
    } else {
      onClose();
    }
  };

  const handleGuest = () => {
    soundManager.playClick(400);
    continueAsGuest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-clay/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-2 border-clay-border rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-soft-lg relative space-y-5">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClick(380);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-creme-100 hover:bg-creme-200 text-clay-muted hover:text-clay transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-11 h-11 mx-auto rounded-2xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta text-xl font-bold mb-2">
            🏛️
          </div>
          <h2 className="text-xl font-extrabold text-clay font-display">
            {tab === 'login' ? 'Connexion Étudiant' : 'Rejoindre la Promotion'}
          </h2>
          <p className="text-xs text-clay-muted font-medium">
            {tab === 'login'
              ? 'Connectez-vous pour figurer sur le classement de promo'
              : 'Créez votre profil universitaire pour monter sur le podium'}
          </p>
        </div>

        {/* Tabs: Se connecter vs S'inscrire */}
        <div className="flex p-1 bg-creme-100 rounded-xl border border-clay-border text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(420);
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-clay shadow-xs border border-clay-border/40'
                : 'text-clay-muted hover:text-clay'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick(440);
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-clay shadow-xs border border-clay-border/40'
                : 'text-clay-muted hover:text-clay'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-coral-light border border-coral/30 text-coral-dark text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {/* Form: Email / Mdp */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-clay-muted mb-1">
                Pseudo public
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-clay-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Ex: Alex_Sorbonne, Hugo_GeoL1..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-clay-border text-xs font-medium text-clay focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-clay-muted mb-1">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-clay-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="etudiant@universite.fr"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-clay-border text-xs font-medium text-clay focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-clay-muted mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-clay-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-clay-border text-xs font-medium text-clay focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-dark text-white font-display font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Chargement...' : tab === 'login' ? 'Se connecter' : 'Valider mon inscription'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-clay-border w-full" />
          <span className="bg-white px-3 text-[10px] font-display font-bold uppercase tracking-wider text-clay-subtle absolute">
            Ou continuer avec
          </span>
        </div>

        {/* Social Buttons: Google & Apple */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleSocialGoogle}
            className="py-2 px-3 rounded-xl border border-clay-border bg-white hover:bg-creme-100 text-clay text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Google</span>
          </button>

          {/* Apple Button */}
          <button
            type="button"
            onClick={handleSocialApple}
            className="py-2 px-3 rounded-xl border border-clay-border bg-white hover:bg-creme-100 text-clay text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.65-.79 1.09-1.89.97-2.99-.95.04-2.1.63-2.78 1.42-.59.68-1.11 1.79-.97 2.86 1.06.08 2.13-.5 2.78-1.29z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {/* Fast Guest Mode Access */}
        <button
          type="button"
          onClick={handleGuest}
          className="w-full py-2 rounded-xl bg-creme-100 hover:bg-creme-200 text-clay-muted hover:text-clay text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-honey" />
          <span>Continuer en mode invité / Démo L1</span>
        </button>
      </div>
    </div>
  );
};
