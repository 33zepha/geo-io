-- Soft-ban profils (admin) — appliquer dans Supabase SQL Editor.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_is_banned_idx
  ON public.profiles (is_banned)
  WHERE is_banned = true;

CREATE OR REPLACE FUNCTION public.admin_set_banned(target_id uuid, banned boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
BEGIN
  IF caller_email IS DISTINCT FROM '22hendrxkd@gmail.com' THEN
    RAISE EXCEPTION 'Accès admin refusé';
  END IF;

  UPDATE public.profiles
  SET is_banned = banned
  WHERE id = target_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_banned(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_banned(uuid, boolean) TO authenticated;
