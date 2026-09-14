-- Daily missions and weekly competition. Additive: existing profiles, XP and scores are untouched.

create table if not exists public.competition_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  day_key date not null,
  week_key date not null,
  slot smallint not null check (slot in (1, 2)),
  mode text not null check (mode in ('clic_carte', 'qcm', 'silhouette', 'enquete_logique')),
  seed text not null,
  status text not null default 'started' check (status in ('started', 'completed')),
  correct_count smallint,
  total_questions smallint,
  answers jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.competition_mission_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id text not null,
  day_key date not null,
  week_key date not null,
  mode text not null,
  points smallint not null check (points in (20, 35, 45)),
  accuracy smallint not null check (accuracy between 0 and 100),
  completed_at timestamptz not null default now(),
  unique (user_id, mission_id)
);

create table if not exists public.competition_streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  days integer not null default 0,
  last_completed_day date,
  joker_week_key date,
  joker_used boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.competition_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_key date not null,
  reward_id text not null,
  reward_kind text not null check (reward_kind in ('badge', 'title', 'frame', 'medal')),
  label text not null,
  awarded_at timestamptz not null default now(),
  unique (user_id, week_key, reward_id)
);

create table if not exists public.competition_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('missions_viewed', 'attempt_started', 'mission_completed')),
  day_key date not null,
  created_at timestamptz not null default now()
);

create index if not exists competition_completions_week_idx
  on public.competition_mission_completions (week_key, user_id);
create index if not exists competition_attempts_owner_idx
  on public.competition_attempts (user_id, day_key);

alter table public.competition_attempts enable row level security;
alter table public.competition_mission_completions enable row level security;
alter table public.competition_streaks enable row level security;
alter table public.competition_rewards enable row level security;
alter table public.competition_events enable row level security;

create policy "Own competition attempts" on public.competition_attempts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Competition results are readable" on public.competition_mission_completions
  for select using (true);
create policy "Own competition streak" on public.competition_streaks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Competition rewards are readable" on public.competition_rewards
  for select using (true);

create or replace view public.competition_weekly_leaderboard
with (security_invoker = true) as
select
  row_number() over (
    partition by c.week_key
    order by sum(c.points) desc, count(*) desc, round(avg(c.accuracy)) desc, max(c.completed_at) asc
  ) as rank,
  c.week_key,
  c.user_id,
  p.pseudo,
  p.avatar_id,
  sum(c.points)::integer as points,
  count(*)::integer as missions_completed,
  round(avg(c.accuracy))::integer as accuracy,
  max(c.completed_at) as reached_at
from public.competition_mission_completions c
join public.profiles p on p.id = c.user_id
group by c.week_key, c.user_id, p.pseudo, p.avatar_id;

create or replace function public.update_competition_progress()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  current_streak public.competition_streaks%rowtype;
begin
  select * into current_streak from public.competition_streaks where user_id = new.user_id for update;
  if not found then
    insert into public.competition_streaks (user_id, days, last_completed_day, joker_week_key, joker_used)
    values (new.user_id, 1, new.day_key, new.week_key, false);
  elsif current_streak.last_completed_day is distinct from new.day_key then
    update public.competition_streaks set
      days = case
        when current_streak.last_completed_day = new.day_key - 1 then current_streak.days + 1
        when current_streak.last_completed_day = new.day_key - 2
          and (current_streak.joker_week_key is distinct from new.week_key or not current_streak.joker_used)
          then current_streak.days + 1
        else 1
      end,
      joker_week_key = new.week_key,
      joker_used = case
        when current_streak.last_completed_day = new.day_key - 2
          and (current_streak.joker_week_key is distinct from new.week_key or not current_streak.joker_used)
          then true
        when current_streak.joker_week_key is distinct from new.week_key then false
        else current_streak.joker_used
      end,
      last_completed_day = new.day_key,
      updated_at = now()
    where user_id = new.user_id;
  end if;

  insert into public.competition_rewards (user_id, week_key, reward_id, reward_kind, label)
  select new.user_id, new.week_key, reward_id, reward_kind, label
  from (values
    (200, 'weekly-badge', 'badge', 'Explorateur de la semaine'),
    (400, 'weekly-title', 'title', 'Cartographe régulier'),
    (600, 'weekly-frame', 'frame', 'Cadre Grand Tour')
  ) as rewards(threshold, reward_id, reward_kind, label)
  where (select coalesce(sum(points), 0) from public.competition_mission_completions where user_id = new.user_id and week_key = new.week_key) >= threshold
  on conflict (user_id, week_key, reward_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_competition_completion on public.competition_mission_completions;
create trigger on_competition_completion
after insert on public.competition_mission_completions
for each row execute function public.update_competition_progress();

create or replace function public.finalize_competition_week(target_week date)
returns void language sql security definer set search_path = public as $$
  insert into public.competition_rewards (user_id, week_key, reward_id, reward_kind, label)
  select user_id, week_key, 'weekly-podium-' || rank::text, 'medal',
    case rank when 1 then 'Médaille d’or hebdomadaire' when 2 then 'Médaille d’argent hebdomadaire' else 'Médaille de bronze hebdomadaire' end
  from public.competition_weekly_leaderboard
  where week_key = target_week and rank <= 3
  on conflict (user_id, week_key, reward_id) do nothing;
$$;

revoke all on function public.update_competition_progress() from public, anon, authenticated;
revoke all on function public.finalize_competition_week(date) from public, anon, authenticated;
