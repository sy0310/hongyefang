-- migration: add industry_experience and monthly_debt columns to assessments
alter table public.assessments
  add column if not exists industry_experience numeric,
  add column if not exists monthly_debt numeric;
