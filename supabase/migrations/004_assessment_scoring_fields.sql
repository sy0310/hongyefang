-- migration: add scoring fields to assessments
alter table public.assessments
  add column if not exists score integer,
  add column if not exists tier text check (tier in ('高度适配', '中度适配', '需要准备')),
  add column if not exists is_wishing_type boolean default false,
  add column if not exists ai_narrative text;
