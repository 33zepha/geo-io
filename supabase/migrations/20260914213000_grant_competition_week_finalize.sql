-- Only the server-side service role may finalize weekly podium rewards.
grant execute on function public.finalize_competition_week(date) to service_role;
