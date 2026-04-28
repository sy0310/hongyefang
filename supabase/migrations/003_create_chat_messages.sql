-- migration: create_chat_messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can create chat messages for their assessments" on public.chat_messages
  for insert to authenticated
  with check (
    exists (
      select 1 from public.assessments
      where id = chat_messages.assessment_id
      and user_id = auth.uid()
    )
  );

create policy "Users can view chat messages from their assessments" on public.chat_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.assessments
      where id = chat_messages.assessment_id
      and user_id = auth.uid()
    )
  );
