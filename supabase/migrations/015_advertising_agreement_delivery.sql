alter table public.ad_campaigns
  add column if not exists agreement_version text,
  add column if not exists agreement_accepted_at timestamptz,
  add column if not exists onboarding_request_id uuid;

create unique index if not exists ad_campaigns_onboarding_request_id_idx
  on public.ad_campaigns(onboarding_request_id)
  where onboarding_request_id is not null;

create table if not exists public.advertising_agreement_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  recipient_email text not null,
  agreement_version text not null,
  agreement_last_updated date not null,
  agreement_snapshot text not null,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  provider_message_id text,
  failure_reason text,
  delivery_key text not null unique,
  retry_of uuid references public.advertising_agreement_deliveries(id),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists advertising_agreement_deliveries_campaign_idx
  on public.advertising_agreement_deliveries(campaign_id,created_at desc);

alter table public.advertising_agreement_deliveries enable row level security;
create policy "admins read agreement deliveries" on public.advertising_agreement_deliveries
  for select to authenticated using((select public.is_admin()));
create policy "admins insert agreement deliveries" on public.advertising_agreement_deliveries
  for insert to authenticated with check((select public.is_admin()));
create policy "admins update agreement deliveries" on public.advertising_agreement_deliveries
  for update to authenticated using((select public.is_admin())) with check((select public.is_admin()));
