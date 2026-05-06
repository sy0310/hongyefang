-- partner_profiles: opt-in pool entries
create table public.partner_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  is_active     boolean not null default true,
  project_desc  text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(user_id)
);

alter table public.partner_profiles enable row level security;

create policy "authenticated can read active profiles"
  on public.partner_profiles for select to authenticated
  using (is_active = true);

create policy "users insert own profile"
  on public.partner_profiles for insert to authenticated
  with check (user_id = auth.uid());

create policy "users update own profile"
  on public.partner_profiles for update to authenticated
  using (user_id = auth.uid());

-- partner_interests: connection requests (admin-mediated)
create table public.partner_interests (
  id           uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id   uuid not null references auth.users(id) on delete cascade,
  status       text not null default 'pending',
  admin_notes  text,
  created_at   timestamptz not null default now(),
  unique(from_user_id, to_user_id),
  check (from_user_id <> to_user_id)
);

alter table public.partner_interests enable row level security;

create policy "users view own interests"
  on public.partner_interests for select to authenticated
  using (from_user_id = auth.uid() or to_user_id = auth.uid());

create policy "users create interests"
  on public.partner_interests for insert to authenticated
  with check (from_user_id = auth.uid());
