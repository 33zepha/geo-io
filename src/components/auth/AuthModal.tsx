'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { soundManager } from '../../lib/audio';
import { X, Mail, User, ArrowRight, CheckCircle2, RefreshCw, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatoryGate?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isMandatoryGate = false,
}) => {
  const { isAuthenticated, sendEmailOtp, verifyEmailOtp } = useAuth();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first digit box when switching to code step
  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Veuillez renseigner une adresse email valide.');
      soundManager.playError();
      return;
    }

    setLoading(true);
    soundManager.playClick(440);

    try {
      const res = await sendEmailOtp(cleanEmail, pseudo.trim() || undefined);
      if (res.error) {
        setError(res.error);
        soundManager.playError();
      } else {
        if (res.devCode) {
          setDevCode(res.devCode);
        }
        setStep('code');
        setResendCooldown(30);
        soundManager.playSuccess(2);
      }
    } catch (err: any) {
      setError(err?.message || 'Impossible d’envoyer le code de vérification.');
      soundManager.playError();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP input change
  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setError(null);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if 6 digits filled
    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      executeVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    if (pasted.length === 6) {
      executeVerify(pasted);
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  // Step 2: Verify OTP
  const executeVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setError('Veuillez entrer le code à 6 chiffres.');
      soundManager.playError();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await verifyEmailOtp(email, code);
      if (res.error) {
        setError(res.error);
        soundManager.playError();
      } else {
        soundManager.playSuccess(4);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la vérification du code.');
      soundManager.playError();
    } finally {
      setLoading(false);
    }
  };

  const handleDevFill = () => {
    if (!devCode) return;
    const digits = devCode.split('');
    setOtpDigits(digits);
    executeVerify(devCode);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await sendEmailOtp(email, pseudo || undefined);
      if (res.error) {
        setError(res.error);
      } else {
        if (res.devCode) setDevCode(res.devCode);
        setResendCooldown(30);
        soundManager.playClick(500);
      }
    } finally {
      setLoading(false);
    }
  };

  const isDismissible = !isMandatoryGate && isAuthenticated;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-clay/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border-2 border-clay-border rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-soft-lg relative space-y-5">
        {/* Close Button (only if dismissible) */}
        {isDismissible && (
          <button
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

        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta text-2xl font-bold shadow-2xs">
            {step === 'email' ? '🏛️' : '✉️'}
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-honey-light border border-honey/40 text-honey-dark text-[11px] font-bold uppercase tracking-wider">
            <span>Promotion L1 • Geo.io</span>
          </div>
          <h2 className="text-xl font-black text-clay font-display">
            {step === 'email' ? 'Identification Étudiante' : 'Code de Vérification'}
          </h2>
          <p className="text-xs text-clay-muted font-medium max-w-xs mx-auto leading-relaxed">
            {step === 'email'
              ? 'Connectez-vous avec votre adresse email pour accéder aux épreuves et au classement officiel.'
              : `Saisissez les 6 chiffres envoyés à ${email}`}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-2xl bg-coral-light border border-coral/30 text-coral-dark text-xs font-medium leading-relaxed animate-in fade-in">
            {error}
          </div>
        )}

        {/* STEP 1: EMAIL & PSEUDO FORM */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-clay-muted">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-clay-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="etudiant@univ-paris1.fr"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-creme-100/50 border border-clay-border text-xs font-semibold text-clay placeholder:text-clay-subtle focus:bg-white focus:outline-none focus:border-terracotta transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-clay-muted">
                  Pseudo au Classement
                </label>
                <span className="text-[10px] text-clay-subtle font-medium">Optionnel</span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-clay-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Ex: Lucas_Sorbonne"
                  maxLength={24}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-creme-100/50 border border-clay-border text-xs font-semibold text-clay placeholder:text-clay-subtle focus:bg-white focus:outline-none focus:border-terracotta transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3 px-4 rounded-2xl bg-terracotta hover:bg-terracotta-dark disabled:opacity-50 text-white text-xs font-display font-bold shadow-soft transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Recevoir mon code d'accès</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="p-2.5 rounded-xl bg-creme-100/60 border border-clay-border/60 text-[11px] text-clay-muted text-center leading-normal">
              🔒 Connexion sécurisée sans mot de passe. Un code de confirmation temporaire vous sera envoyé par courriel.
            </div>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === 'code' && (
          <div className="space-y-4">
            {/* Dev Demo Badge if devCode is set */}
            {devCode && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">
                    Code test démo : <strong className="font-mono text-sm tracking-widest">{devCode}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDevFill}
                  className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-[11px] font-bold text-amber-950 transition shrink-0 cursor-pointer"
                >
                  Remplir
                </button>
              </div>
            )}

            {/* 6 Digit Inputs */}
            <div className="flex justify-between gap-1.5 sm:gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="w-11 sm:w-12 h-13 sm:h-14 text-center font-display font-black text-xl text-clay rounded-2xl bg-creme-100/60 border-2 border-clay-border focus:bg-white focus:border-terracotta focus:shadow-xs transition outline-none"
                />
              ))}
            </div>

            {/* Validate Button */}
            <button
              type="button"
              onClick={() => executeVerify()}
              disabled={loading || otpDigits.join('').length < 6}
              className="w-full py-3 px-4 rounded-2xl bg-sage hover:bg-sage-dark disabled:opacity-50 text-white text-xs font-display font-bold shadow-soft transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider et entrer sur Geo.io</span>
                </>
              )}
            </button>

            {/* Actions: Resend & Change Email */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick(360);
                  setStep('email');
                  setOtpDigits(['', '', '', '', '', '']);
                  setError(null);
                }}
                className="text-clay-muted hover:text-clay font-medium underline underline-offset-2 transition cursor-pointer"
              >
                ← Changer d'email
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-terracotta hover:text-terracotta-dark disabled:opacity-40 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
