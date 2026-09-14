'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { UserProfile, AuthSession } from '../types/auth';
import { supabase, isSupabaseConfigured } from './supabase';
import { loadPlayerStats, hydrateLocalStatsFromCloud } from './storage';

export const LOCAL_AUTH_SESSION_KEY = 'geo_io_auth_session_v2';

interface AuthContextType extends AuthSession {
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, pseudo: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateDefaultProfile(email: string, pseudo?: string): UserProfile {
  const stats = loadPlayerStats();
  const masteredCount = Object.values(stats.departmentStats || {}).filter(
    (department) => department.attempts >= 1 && department.correct >= 1
  ).length;
  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 85;

  return {
    id: '',
    email: email.trim().toLowerCase(),
    pseudo: pseudo?.trim() || email.split('@')[0] || 'Étudiant_L1',
    avatarId: 'boussole',
    favoriteDept: '75',
    university: 'Paris 1 Panthéon-Sorbonne',
    level: stats.level || 1,
    xp: stats.xp || 0,
    streak: stats.streak || 1,
    masteredDeptsCount: masteredCount,
    accuracy,
    createdAt: new Date().toISOString(),
  };
}

function profileFromRow(row: Record<string, any>, authUser: User): UserProfile {
  const email = authUser.email || '';
  return {
    id: row.id,
    email,
    pseudo: row.pseudo || authUser.user_metadata?.pseudo || email.split('@')[0],
    avatarId: row.avatar_id || 'boussole',
    favoriteDept: row.favorite_dept || '75',
    university: row.university || '',
    level: row.level || 1,
    xp: row.xp || 0,
    streak: row.streak || 1,
    masteredDeptsCount: row.mastered_depts || 0,
    accuracy: row.accuracy || 85,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

async function loadAuthenticatedProfile(authUser: User): Promise<UserProfile> {
  if (!supabase || !authUser.email) throw new Error('Session Supabase invalide.');

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (profileRow) return profileFromRow(profileRow, authUser);

  const profile = generateDefaultProfile(authUser.email, authUser.user_metadata?.pseudo);
  profile.id = authUser.id;
  // Insert-only: never upsert XP/level — a race that "misses" an existing row
  // used to overwrite high cloud progress with fresh localStorage (0 XP).
  const { error: insertError } = await supabase.from('profiles').insert({
    id: profile.id,
    pseudo: profile.pseudo,
    avatar_id: profile.avatarId,
    favorite_dept: profile.favoriteDept,
    university: profile.university,
    level: profile.level,
    xp: profile.xp,
    streak: profile.streak,
    mastered_depts: profile.masteredDeptsCount,
    accuracy: profile.accuracy,
  });

  if (insertError) {
    // Profile already exists (race / concurrent login) — reload the real cloud row.
    if (insertError.code === '23505') {
      const { data: existing, error: reloadError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      if (reloadError) throw reloadError;
      if (existing) return profileFromRow(existing, authUser);
    }
    throw insertError;
  }
  return profile;
}

function authErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || '');
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Adresse email ou mot de passe incorrect.';
  }
  if (normalized.includes('user already registered')) {
    return 'Un compte existe déjà avec cette adresse email.';
  }
  if (normalized.includes('password') && normalized.includes('characters')) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }
  if (normalized.includes('email not confirmed')) {
    return "La confirmation email est encore activée dans Supabase. Désactivez-la pour autoriser la connexion immédiate.";
  }
  if (normalized.includes('fetch') || normalized.includes('network')) {
    return 'Impossible de contacter le service de connexion. Vérifiez votre réseau.';
  }

  return message || 'Une erreur de connexion est survenue.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthenticatedProfile = (profile: UserProfile) => {
    // Always pull cloud progress into local stats BEFORE any game can sync back.
    hydrateLocalStatsFromCloud({
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      masteredDeptsCount: profile.masteredDeptsCount,
      accuracy: profile.accuracy,
    });
    setUser(profile);
    setIsAuthenticated(true);
    localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify({
      isAuthenticated: true,
      user: profile,
    }));
  };

  const clearAuthenticatedProfile = () => {
    localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    let isMounted = true;

    const isLocalMobilePreview =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('mobilePreview') === '1' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      process.env.NODE_ENV === 'development';

    async function initializeAuth() {
      // Local-only UI preview (?mobilePreview=1) — no session persisted, never in production builds.
      if (isLocalMobilePreview) {
        if (isMounted) {
          setUser({
            id: 'mobile-preview',
            email: 'preview@localhost',
            pseudo: 'MobilePreview',
            avatarId: 'boussole',
            favoriteDept: '75',
            university: 'Paris 1 Panthéon-Sorbonne',
            level: 3,
            xp: 420,
            streak: 2,
            masteredDeptsCount: 12,
            accuracy: 78,
            createdAt: new Date().toISOString(),
          });
          setIsAuthenticated(true);
          setIsLoading(false);
        }
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        if (isMounted) clearAuthenticatedProfile();
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user?.email) {
          if (isMounted) clearAuthenticatedProfile();
          return;
        }

        const profile = await loadAuthenticatedProfile(data.user);
        if (isMounted) applyAuthenticatedProfile(profile);
      } catch (error) {
        console.warn('Supabase session verification failed:', error);
        if (isMounted) clearAuthenticatedProfile();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void initializeAuth();

    if (isLocalMobilePreview) {
      return () => {
        isMounted = false;
      };
    }

    const authListener = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user?.email) {
        if (event === 'SIGNED_OUT' && isMounted) clearAuthenticatedProfile();
        return;
      }

      window.setTimeout(() => {
        void loadAuthenticatedProfile(session.user)
          .then((profile) => {
            if (isMounted) applyAuthenticatedProfile(profile);
          })
          .catch((error) => {
            console.warn('Supabase profile refresh failed:', error);
          });
      }, 0);
    });

    return () => {
      isMounted = false;
      authListener?.data.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Veuillez saisir une adresse email valide.' };
    }
    if (password.length < 6) {
      return { error: 'Le mot de passe doit contenir au moins 6 caractères.' };
    }
    if (!isSupabaseConfigured || !supabase) {
      return { error: "Le service de connexion Supabase n'est pas configuré." };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) return { error: authErrorMessage(error) };
      if (!data.user?.email || !data.session) {
        return { error: 'Supabase n’a pas retourné de session valide.' };
      }

      const profile = await loadAuthenticatedProfile(data.user);
      applyAuthenticatedProfile(profile);
      return { error: null };
    } catch (error) {
      return { error: authErrorMessage(error) };
    }
  };

  const signUpWithEmail = async (email: string, password: string, pseudo: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPseudo = pseudo.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Veuillez saisir une adresse email valide.' };
    }
    if (!cleanPseudo) {
      return { error: 'Veuillez choisir un pseudo pour le classement.' };
    }
    if (password.length < 6) {
      return { error: 'Le mot de passe doit contenir au moins 6 caractères.' };
    }
    if (!isSupabaseConfigured || !supabase) {
      return { error: "Le service de connexion Supabase n'est pas configuré." };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { pseudo: cleanPseudo } },
      });
      if (error) return { error: authErrorMessage(error) };
      if (!data.user?.email || !data.session) {
        return {
          error: "Le compte a été créé sans session. Désactivez « Confirm email » dans Supabase, puis réessayez.",
        };
      }

      const profile = await loadAuthenticatedProfile(data.user);
      applyAuthenticatedProfile(profile);
      return { error: null };
    } catch (error) {
      return { error: authErrorMessage(error) };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn('Supabase sign out failed:', error);
      }
    }
    clearAuthenticatedProfile();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !isAuthenticated || !supabase) return;

    const updated: UserProfile = { ...user, ...updates };
    const { error } = await supabase
      .from('profiles')
      .update({
        pseudo: updated.pseudo,
        avatar_id: updated.avatarId,
        favorite_dept: updated.favoriteDept,
        university: updated.university,
      })
      .eq('id', user.id);

    if (error) throw error;
    applyAuthenticatedProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
