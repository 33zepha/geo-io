'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, AuthSession } from '../types/auth';
import { supabase, isSupabaseConfigured } from './supabase';
import { loadPlayerStats } from './storage';

export const LOCAL_AUTH_SESSION_KEY = 'geo_io_auth_session_v2';
export const PENDING_OTP_KEY = 'geo_io_pending_otp_v2';

interface AuthContextType extends AuthSession {
  sendEmailOtp: (email: string, pseudo?: string) => Promise<{ error: string | null; devCode?: string }>;
  verifyEmailOtp: (email: string, code: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateDefaultProfile(email: string, pseudo?: string): UserProfile {
  const stats = loadPlayerStats();
  const masteredCount = Object.values(stats.departmentStats || {}).filter(
    (d) => d.attempts >= 1 && d.correct >= 1
  ).length;

  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
    : 85;

  const resolvedPseudo = (pseudo && pseudo.trim()) || email.split('@')[0] || 'Étudiant_L1';

  return {
    id: 'user_' + Math.random().toString(36).substring(2, 10),
    email: email.trim().toLowerCase(),
    pseudo: resolvedPseudo,
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session and restore persistence
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. Check if Supabase session is active
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
          if (!sessionErr && session?.user?.email) {
            const userId = session.user.id;
            const userEmail = session.user.email;

            // Retrieve profile from PostgreSQL 'profiles'
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();

            let activeProfile: UserProfile;
            if (profileData) {
              activeProfile = {
                id: profileData.id,
                email: userEmail,
                pseudo: profileData.pseudo || session.user.user_metadata?.pseudo || userEmail.split('@')[0],
                avatarId: profileData.avatar_id || 'boussole',
                favoriteDept: profileData.favorite_dept || '75',
                university: profileData.university || '',
                level: profileData.level || 1,
                xp: profileData.xp || 0,
                streak: profileData.streak || 1,
                masteredDeptsCount: profileData.mastered_depts || 0,
                accuracy: profileData.accuracy || 85,
                createdAt: profileData.created_at || new Date().toISOString(),
              };
            } else {
              // Create profile in Supabase table
              activeProfile = generateDefaultProfile(
                userEmail,
                session.user.user_metadata?.pseudo
              );
              activeProfile.id = userId;

              try {
                await supabase.from('profiles').upsert({
                  id: userId,
                  pseudo: activeProfile.pseudo,
                  avatar_id: activeProfile.avatarId,
                  favorite_dept: activeProfile.favoriteDept,
                  university: activeProfile.university,
                  level: activeProfile.level,
                  xp: activeProfile.xp,
                  streak: activeProfile.streak,
                  mastered_depts: activeProfile.masteredDeptsCount,
                  accuracy: activeProfile.accuracy,
                }, { onConflict: 'id' });
              } catch {}
            }

            if (isMounted) {
              setUser(activeProfile);
              setIsAuthenticated(true);
              localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify({
                isAuthenticated: true,
                user: activeProfile,
              }));
              setIsLoading(false);
            }
            return;
          }
        } catch (e) {
          console.warn('Supabase session verification notice:', e);
        }
      }

      // 2. Check persistent local storage session
      try {
        const saved = localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.isAuthenticated && parsed?.user?.email) {
            // Re-sync local game stats to avoid stale XP
            const stats = loadPlayerStats();
            parsed.user.xp = Math.max(parsed.user.xp || 0, stats.xp || 0);
            parsed.user.level = Math.max(parsed.user.level || 1, stats.level || 1);
            parsed.user.streak = Math.max(parsed.user.streak || 1, stats.streak || 1);

            if (isMounted) {
              setUser(parsed.user);
              setIsAuthenticated(true);
              setIsLoading(false);
            }
            return;
          }
        }
      } catch (e) {
        console.warn('Local session read error:', e);
      }

      // 3. Not authenticated -> require connection
      if (isMounted) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }

    initAuth();

    // Supabase auth event listener
    let unsubscribe: (() => void) | undefined;
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
          }
        } else if (session?.user?.email) {
          const userEmail = session.user.email;
          const { data: profileData } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const activeProfile = profileData ? {
            id: profileData.id,
            email: userEmail,
            pseudo: profileData.pseudo || session.user.user_metadata?.pseudo || userEmail.split('@')[0],
            avatarId: profileData.avatar_id || 'boussole',
            favoriteDept: profileData.favorite_dept || '75',
            university: profileData.university || '',
            level: profileData.level || 1,
            xp: profileData.xp || 0,
            streak: profileData.streak || 1,
            masteredDeptsCount: profileData.mastered_depts || 0,
            accuracy: profileData.accuracy || 85,
            createdAt: profileData.created_at || new Date().toISOString(),
          } : generateDefaultProfile(userEmail, session.user.user_metadata?.pseudo);

          if (isMounted) {
            setUser(activeProfile);
            setIsAuthenticated(true);
            localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify({
              isAuthenticated: true,
              user: activeProfile,
            }));
          }
        }
      });
      unsubscribe = () => authListener.subscription.unsubscribe();
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /**
   * Envoyer un code de vérification par email (OTP)
   */
  const sendEmailOtp = async (email: string, pseudo?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { error: 'Veuillez saisir une adresse email valide.' };
    }

    // A. Supabase Cloud OTP
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
            data: {
              pseudo: pseudo?.trim() || cleanEmail.split('@')[0],
            },
          },
        });

        if (error) {
          const msg = (error.message || '').toLowerCase();
          // Fail-safe si la limite d'emails gratuits Supabase (3/heure) est atteinte
          if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit') || (error as any).status === 429) {
            const emergencyCode = Math.floor(100000 + Math.random() * 900000).toString();
            sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify({
              email: cleanEmail,
              pseudo: pseudo?.trim() || cleanEmail.split('@')[0],
              code: emergencyCode,
              expiresAt: Date.now() + 15 * 60 * 1000,
              isEmergency: true,
            }));
            return { error: null, devCode: emergencyCode };
          }
          return { error: error.message };
        }

        // Store pending in session
        sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify({
          email: cleanEmail,
          pseudo: pseudo?.trim() || cleanEmail.split('@')[0],
          sentAt: Date.now(),
        }));

        return { error: null };
      } catch (err: any) {
        return { error: err?.message || "Échec de l'envoi du code Supabase." };
      }
    }

    // B. Local Mirror / Dev OTP generator (Zero-config fail-safe)
    const devCode = Math.floor(100000 + Math.random() * 900000).toString();
    const pendingData = {
      email: cleanEmail,
      pseudo: pseudo?.trim() || cleanEmail.split('@')[0],
      code: devCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };

    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(pendingData));
    return { error: null, devCode };
  };

  /**
   * Valider le code de vérification à 6 chiffres
   */
  const verifyEmailOtp = async (email: string, code: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim().replace(/\s+/g, '');

    if (!cleanCode || cleanCode.length < 6) {
      return { error: 'Veuillez saisir un code à 6 chiffres.' };
    }

    // A. Supabase Cloud OTP verification
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanCode,
          type: 'email',
        });

        if (error) {
          // Secours d'urgence en cas de limite email
          const rawPending = sessionStorage.getItem(PENDING_OTP_KEY);
          if (rawPending) {
            try {
              const pending = JSON.parse(rawPending);
              if (pending.isEmergency && pending.email === cleanEmail && pending.code === cleanCode) {
                const profile = generateDefaultProfile(cleanEmail, pending.pseudo);
                setUser(profile);
                setIsAuthenticated(true);
                localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify({
                  isAuthenticated: true,
                  user: profile,
                }));
                sessionStorage.removeItem(PENDING_OTP_KEY);
                return { error: null };
              }
            } catch {}
          }
          return { error: error.message };
        }

        if (data?.user) {
          const rawPending = sessionStorage.getItem(PENDING_OTP_KEY);
          let requestedPseudo = cleanEmail.split('@')[0];
          if (rawPending) {
            try {
              const parsed = JSON.parse(rawPending);
              if (parsed.pseudo) requestedPseudo = parsed.pseudo;
            } catch {}
          }

          // Fetch or upsert profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          let activeProfile: UserProfile;
          if (profileData) {
            activeProfile = {
              id: profileData.id,
              email: cleanEmail,
              pseudo: profileData.pseudo || requestedPseudo,
              avatarId: profileData.avatar_id || 'boussole',
              favoriteDept: profileData.favorite_dept || '75',
              university: profileData.university || 'Université',
              level: profileData.level || 1,
              xp: profileData.xp || 0,
              streak: profileData.streak || 1,
              masteredDeptsCount: profileData.mastered_depts || 0,
              accuracy: profileData.accuracy || 85,
              createdAt: profileData.created_at || new Date().toISOString(),
            };
          } else {
            activeProfile = generateDefaultProfile(cleanEmail, requestedPseudo);
            activeProfile.id = data.user.id;
            try {
              await supabase.from('profiles').upsert({
                id: data.user.id,
                pseudo: activeProfile.pseudo,
                avatar_id: activeProfile.avatarId,
                favorite_dept: activeProfile.favoriteDept,
                university: activeProfile.university,
                level: activeProfile.level,
                xp: activeProfile.xp,
                streak: activeProfile.streak,
                mastered_depts: activeProfile.masteredDeptsCount,
                accuracy: activeProfile.accuracy,
              }, { onConflict: 'id' });
            } catch {}
          }

          setUser(activeProfile);
          setIsAuthenticated(true);
          localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify({
            isAuthenticated: true,
            user: activeProfile,
          }));
          sessionStorage.removeItem(PENDING_OTP_KEY);
          return { error: null };
        }

        return { error: 'Aucun utilisateur retourné par la vérification.' };
      } catch (err: any) {
        return { error: err?.message || 'Erreur lors de la validation du code.' };
      }
    }

    // B. Local Mirror / Dev OTP verification
    const rawPending = sessionStorage.getItem(PENDING_OTP_KEY);
    let isValid = false;
    let registeredPseudo = cleanEmail.split('@')[0];

    if (rawPending) {
      try {
        const pending = JSON.parse(rawPending);
        if (pending.email === cleanEmail && pending.code === cleanCode && Date.now() < pending.expiresAt) {
          isValid = true;
          if (pending.pseudo) registeredPseudo = pending.pseudo;
        }
      } catch {}
    }

    // Fallback bypass for universal dev testing: "123456"
    if (cleanCode === '123456') {
      isValid = true;
    }

    if (!isValid) {
      return { error: 'Code incorrect ou expiré. Veuillez vérifier les 6 chiffres reçus.' };
    }

    // Persist new verified student profile
    const profile = generateDefaultProfile(cleanEmail, registeredPseudo);
    setUser(profile);
    setIsAuthenticated(true);
    localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify({
      isAuthenticated: true,
      user: profile,
    }));
    sessionStorage.removeItem(PENDING_OTP_KEY);

    return { error: null };
  };

  /**
   * Déconnexion sécurisée
   */
  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e);
      }
    }

    localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
    sessionStorage.removeItem(PENDING_OTP_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Mise à jour du profil (pseudo, avatar, département, université)
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify({
      isAuthenticated: true,
      user: updated,
    }));

    if (isSupabaseConfigured && supabase) {
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
        console.warn('Could not sync profile update to Supabase:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        sendEmailOtp,
        verifyEmailOtp,
        signOut,
        updateProfile,
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
