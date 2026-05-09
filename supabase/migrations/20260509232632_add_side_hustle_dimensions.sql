-- migration: add side hustle dimensions to assessments
alter table public.assessments
  add column if not exists target_industry text,
  add column if not exists hands_off_preference numeric,
  add column if not exists setup_aversion numeric;
