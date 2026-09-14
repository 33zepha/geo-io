-- ==========================================================
-- GEO.IO - Réalignement RLS production (idempotent)
-- Classement lisible, écritures owner-only, pas de DELETE/UPDATE scores.
-- À coller dans Supabase SQL Editor si les policies prod divergent du schéma.
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Anciennes / trop permissives
DROP POLICY IF EXISTS "Profils publics en lecture" ON public.profiles;
DROP POLICY IF EXISTS "Modification de son propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Insertion de son propre profil" ON public.profiles;
DROP POLICY IF EXISTS "Lecture publique des scores" ON public.scores;
DROP POLICY IF EXISTS "Insertion de ses propres scores" ON public.scores;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.scores;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.scores;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.scores;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.scores;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Scores are viewable by everyone" ON public.scores;
DROP POLICY IF EXISTS "Users can insert own scores" ON public.scores;

CREATE POLICY "Profils publics en lecture"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Modification de son propre profil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Insertion de son propre profil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Lecture publique des scores"
  ON public.scores FOR SELECT
  USING (true);

CREATE POLICY "Insertion de ses propres scores"
  ON public.scores FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

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
  (p.xp + (p.mastered_depts * 100) + (p.accuracy * 20)) AS excellence_score,
  p.created_at
FROM public.profiles p
ORDER BY excellence_score DESC;

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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.scores FROM anon;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.scores TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.scores TO authenticated;
