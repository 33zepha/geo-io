'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, AuthSession } from '../types/auth';
import { supabase, isSupabaseConfigured } from './supabase';
import { loadPlayerStats } from './storage';

const LOCAL_PROFILE_KEY = 'geo_io_local_user_profile_v1';

interface AuthContextType extends AuthSession {
  signInWithEmail: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, pass: string, pseudo?: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  continueAsGuest: (pseudo?: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateDefaultProfile(pseudo = 'Explorateur_L1'): UserProfile {
  const stats = loadPlayerStats();
  const masteredCount = Object.values(stats.departmentStats || {}).filter(
    (d) => d.attempts >= 2 && d.correct / d.attempts >= 0.7
  ).length;

  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 85;

  return {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    pseudo,
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Initialize session
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile from supabase table 'profiles'
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileData) {
              setUser({
                id: profileData.id,
                email: session.user.email,
                pseudo: profileData.pseudo || 'Étudiant',
                avatarId: profileData.avatar_id || 'boussole',
                favoriteDept: profileData.favorite_dept || '75',
                university: profileData.university || '',
                level: profileData.level || 1,
                xp: profileData.xp || 0,
                streak: profileData.streak || 1,
                masteredDeptsCount: profileData.mastered_depts || 0,
                accuracy: profileData.accuracy || 0,
                createdAt: profileData.created_at || new Date().toISOString(),
              });
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Supabase auth init notice:', e);
        }
      }

      // Local storage fallback (Guest or local persistent profile)
      try {
        const local = localStorage.getItem(LOCAL_PROFILE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          // Sync with local game stats
          const stats = loadPlayerStats();
          parsed.level = stats.level;
          parsed.xp = stats.xp;
          parsed.streak = stats.streak;
          setUser(parsed);
          setIsGuest(true);
        } else {
          // Initialize fresh local profile
          const initial = generateDefaultProfile();
          setUser(initial);
          setIsGuest(true);
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(initial));
        }
      } catch {
        setUser(generateDefaultProfile());
        setIsGuest(true);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) return { error: error.message };
      if (data.user) {
        setIsGuest(false);
      }
      return { error: null };
    }

    // Local mirror sign-in
    const localProfile = generateDefaultProfile(email.split('@')[0]);
    localProfile.email = email;
    setUser(localProfile);
    setIsGuest(false);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(localProfile));
    return { error: null };
  };

  const signUpWithEmail = async (email: string, pass: string, pseudo?: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { pseudo: pseudo || email.split('@')[0] },
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    }

    // Local mirror sign-up
    const p = generateDefaultProfile(pseudo || email.split('@')[0]);
    p.email = email;
    setUser(p);
    setIsGuest(false);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(p));
    return { error: null };
  };

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      return { error: error?.message || null };
    }

    // Local simulation
    const p = generateDefaultProfile('Étudiant_Google');
    p.email = 'etudiant@univ.fr';
    setUser(p);
    setIsGuest(false);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(p));
    return { error: null };
  };

  const signInWithApple = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: window.location.origin },
      });
      return { error: error?.message || null };
    }

    // Local simulation
    const p = generateDefaultProfile('Étudiant_Apple');
    p.email = 'etudiant@icloud.com';
    setUser(p);
    setIsGuest(false);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(p));
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    const freshGuest = generateDefaultProfile();
    setUser(freshGuest);
    setIsGuest(true);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(freshGuest));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase && !isGuest) {
      try {
        await supabase
          .from('profiles')
          .update({
            pseudo: updated.pseudo,
            avatar_id: updated.avatarId,
            favorite_dept: updated.favoriteDept,
            university: updated.university,
          })
          .eq('id', user.id);
      } catch (e) {
        console.warn('Could not sync profile to Supabase:', e);
      }
    }
  };

  const continueAsGuest = (pseudo?: string) => {
    const guest = generateDefaultProfile(pseudo || 'Explorateur_L1');
    setUser(guest);
    setIsGuest(true);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(guest));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && !isGuest),
        isLoading,
        isGuest,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signOut,
        updateProfile,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
