-- migration: create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  plan_name text not null,
  amount integer not null,
  status text not null default 'completed',
  created_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

create policy "Users can insert own orders" on public.orders
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view own orders" on public.orders
  for select to authenticated
  using (auth.uid() = user_id);
