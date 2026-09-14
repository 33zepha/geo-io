-- Prevent cloud progress from ever decreasing (fresh device / failed sync safety net).
CREATE OR REPLACE FUNCTION public.profiles_progress_never_decrease()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.xp := GREATEST(COALESCE(OLD.xp, 0), COALESCE(NEW.xp, 0));
  NEW.level := GREATEST(COALESCE(OLD.level, 1), COALESCE(NEW.level, 1));
  NEW.streak := GREATEST(COALESCE(OLD.streak, 0), COALESCE(NEW.streak, 0));
  NEW.mastered_depts := GREATEST(COALESCE(OLD.mastered_depts, 0), COALESCE(NEW.mastered_depts, 0));
  NEW.accuracy := GREATEST(COALESCE(OLD.accuracy, 0), COALESCE(NEW.accuracy, 0));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_progress_never_decrease ON public.profiles;
CREATE TRIGGER trg_profiles_progress_never_decrease
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_progress_never_decrease();
