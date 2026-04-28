-- migration: create_assessments
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  annual_capital numeric,
  weekly_time numeric,
  expected_return numeric,
  investment_amount numeric,
  status text default 'in_progress' check (status in ('in_progress', 'completed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.assessments enable row level security;

create policy "Users can create their own assessments" on public.assessments
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own assessments" on public.assessments
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own assessments" on public.assessments
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
