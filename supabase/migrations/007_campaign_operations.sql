alter table public.ad_campaigns
  add column if not exists stripe_paid_at timestamptz,
  add column if not exists stripe_checkout_session_id text;

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);
alter table public.stripe_webhook_events enable row level security;
create policy "admins read stripe webhook events" on public.stripe_webhook_events
for select to authenticated using((select public.is_admin()));
