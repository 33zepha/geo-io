-- ==========================================================
-- GEO.IO - initial Supabase schema
-- ==========================================================

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

CREATE TABLE IF NOT EXISTS public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL,
  score INTEGER NOT NULL,
  accuracy INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
