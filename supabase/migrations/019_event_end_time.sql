alter table public.events
  add column if not exists end_time time;
