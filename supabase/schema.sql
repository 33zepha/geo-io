-- ==========================================================
-- GEO.IO - SCHÉMA DE DÉPLOIEMENT SUPABASE POSTGRESQL
-- Authentification, Profils Étudiants, Scores & Leaderboard
-- ==========================================================

-- 1. Table des Profils Étudiants
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  pseudo TEXT NOT NULL,
  avatar_id TEXT DEFAULT 'boussole',
  favorite_dept TEXT DEFAULT '75',
  university TEXT DEFAULT 'Paris 1 Panthéon-Sorbonne',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 1,
  mastered_depts INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 85,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des Scores & Parties
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL, -- 'pointage', 'master', 'silhouette', 'qcm'
  score INTEGER NOT NULL,
  accuracy INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Vue du Classement avec Calcul du Score d'Excellence
CREATE OR REPLACE VIEW public.leaderboard WITH (security_invoker = true) AS
SELECT
  p.id,
  p.pseudo,
  p.avatar_id,
  p.favorite_dept,
  p.university,
  p.level,
  p.xp,
  p.streak,
  p.mastered_depts,
  p.accuracy,
  -- Formule composite d'excellence : XP + (Maîtrise * 100) + (Précision * 20)
  (p.xp + (p.mastered_depts * 100) + (p.accuracy * 20)) AS excellence_score,
  p.created_at
FROM public.profiles p
ORDER BY excellence_score DESC;

-- 4. Sécurité & Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Lecture publique de tous les profils (nécessaire pour afficher le podium)
CREATE POLICY "Profils publics en lecture"
  ON public.profiles FOR SELECT
  USING (true);

-- Modification de profil restreinte au propriétaire du compte
CREATE POLICY "Modification de son propre profil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Création de profil
CREATE POLICY "Insertion de son propre profil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Scores en lecture publique
CREATE POLICY "Lecture publique des scores"
  ON public.scores FOR SELECT
  USING (true);

-- Insertion de scores par l'utilisateur connecté
CREATE POLICY "Insertion de ses propres scores"
  ON public.scores FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- 5. Trigger Automatique à la création d'un compte Auth Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, pseudo, avatar_id, favorite_dept, university)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'pseudo', split_part(NEW.email, '@', 1)),
    'boussole',
    '75',
    'Université'
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
