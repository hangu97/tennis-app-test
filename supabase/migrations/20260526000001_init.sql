-- Rally — core schema, row-level security, and automation.
-- Client (browser) talks to these tables directly through supabase-js; RLS is
-- what keeps each player scoped to their own data.

/* ----------------------------- Tables ----------------------------- */

-- One row per player. For real users, profiles.id == auth.users.id (wired up by
-- the handle_new_user trigger). Demo players are seeded with their own ids and
-- have no auth account, so they're discoverable but never log in.
create table public.profiles (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  ntrp       text not null default '3.5',
  area       text not null default '',
  is_demo    boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.availability (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  slots      text[] not null default '{}',
  note       text not null default '',
  updated_at timestamptz not null default now()
);

create table public.requests (
  id         uuid primary key default gen_random_uuid(),
  from_user  uuid not null references public.profiles(id) on delete cascade,
  to_user    uuid not null references public.profiles(id) on delete cascade,
  play_date  date not null,
  play_time  text not null,
  message    text not null default '',
  status     text not null default 'pending'
             check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);
create index requests_to_user_idx on public.requests (to_user);
create index requests_from_user_idx on public.requests (from_user);

create table public.games (
  id         uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests(id) on delete cascade,
  players    uuid[] not null,
  play_date  date not null,
  play_time  text not null,
  created_at timestamptz not null default now()
);
create index games_players_idx on public.games using gin (players);

/* --------------------------- Row-level security --------------------------- */

alter table public.profiles     enable row level security;
alter table public.availability enable row level security;
alter table public.requests     enable row level security;
alter table public.games        enable row level security;

-- Profiles: any signed-in player can read all (needed for discovery); you can
-- only create/update your own.
create policy profiles_select_all on public.profiles
  for select to authenticated using (true);
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Availability: readable by all signed-in players; writable only by its owner.
create policy availability_select_all on public.availability
  for select to authenticated using (true);
create policy availability_insert_own on public.availability
  for insert to authenticated with check (auth.uid() = user_id);
create policy availability_update_own on public.availability
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Requests: visible to the two parties; created by the sender; the recipient
-- (and sender) can update status.
create policy requests_select_mine on public.requests
  for select to authenticated using (auth.uid() = from_user or auth.uid() = to_user);
create policy requests_insert_sender on public.requests
  for insert to authenticated with check (auth.uid() = from_user);
create policy requests_update_party on public.requests
  for update to authenticated
  using (auth.uid() = to_user or auth.uid() = from_user)
  with check (auth.uid() = to_user or auth.uid() = from_user);

-- Games: only the two players can see them. Rows are created by the trigger
-- below (security definer), so no client INSERT policy is needed.
create policy games_select_players on public.games
  for select to authenticated using (auth.uid() = any (players));

/* ------------------------------ Automation ------------------------------ */

-- When someone signs up, mirror them into profiles using the metadata passed to
-- supabase.auth.signUp, and give them a couple of incoming requests from demo
-- players so the app has activity to act on right away.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  demo record;
  i int := 0;
  new_ntrp text := coalesce(nullif(new.raw_user_meta_data->>'ntrp', ''), '3.5');
  first_name text := split_part(coalesce(new.raw_user_meta_data->>'name', 'there'), ' ', 1);
begin
  insert into public.profiles (id, name, email, ntrp, area)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new_ntrp,
    coalesce(new.raw_user_meta_data->>'area', '')
  );

  for demo in
    select id, name, area, ntrp from public.profiles
    where is_demo = true
    order by abs(ntrp::numeric - new_ntrp::numeric), random()
    limit 2
  loop
    insert into public.requests (from_user, to_user, play_date, play_time, message, status)
    values (
      demo.id,
      new.id,
      current_date + (2 + i * 2),
      case when i = 0 then 'Evening' else 'Morning' end,
      case when i = 0
        then 'Hey ' || first_name || '! Saw you just joined — want to hit this week? I''m around ' || demo.area || '.'
        else 'Welcome to Rally! I''m a ' || demo.ntrp || ' too. Down for a relaxed hit?'
      end,
      'pending'
    );
    i := i + 1;
  end loop;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- When a request is accepted, materialize a scheduled game for both players.
create or replace function public.handle_request_accepted()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.games (request_id, players, play_date, play_time)
    values (new.id, array[new.from_user, new.to_user], new.play_date, new.play_time);
  end if;
  return new;
end;
$$;

create trigger on_request_accepted
  after update on public.requests
  for each row execute function public.handle_request_accepted();
