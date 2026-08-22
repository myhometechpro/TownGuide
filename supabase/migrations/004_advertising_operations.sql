create table if not exists public.ad_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  duration_days integer not null check (duration_days > 0),
  placement text not null default 'homepage' check (placement in ('homepage','business_profile','homepage_and_profile')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid not null references public.ad_products(id),
  headline text not null,
  ad_copy text,
  image_url text,
  destination_url text,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  approved boolean not null default false,
  paid boolean not null default false,
  status text not null default 'draft' check (status in ('draft','pending_payment','scheduled','active','expired','cancelled')),
  billing_url text,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_events (
  id bigint generated always as identity primary key,
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  event_type text not null check (event_type in ('impression','click')),
  created_at timestamptz not null default now(),
  metadata_json jsonb not null default '{}'
);
create index if not exists ad_events_campaign_time_idx on public.ad_events(campaign_id,created_at desc);
create index if not exists ad_campaigns_dates_idx on public.ad_campaigns(status,start_date,end_date);

alter table public.ad_products enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.ad_events enable row level security;
create policy "admins manage ad products" on public.ad_products for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "admins manage ad campaigns" on public.ad_campaigns for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "admins read ad events" on public.ad_events for select to authenticated using((select public.is_admin()));
create policy "public reads active ad products" on public.ad_products for select using(active);
create policy "public reads live ad campaigns" on public.ad_campaigns for select using(status not in ('cancelled','expired') and approved and paid and start_date<=current_date and end_date>=current_date);

create or replace function public.refresh_ad_campaign_statuses()
returns void language plpgsql security definer set search_path='public'
as $$ begin
  update ad_campaigns set status='expired',updated_at=now()
    where status not in ('cancelled','expired') and end_date < current_date;
  update ad_campaigns set status='active',updated_at=now()
    where approved and paid and start_date<=current_date and end_date>=current_date and status in ('scheduled','pending_payment','draft');
  update ad_campaigns set status='scheduled',updated_at=now()
    where approved and paid and start_date>current_date and status not in ('cancelled','expired');
end $$;
revoke all on function public.refresh_ad_campaign_statuses() from public;
grant execute on function public.refresh_ad_campaign_statuses() to authenticated;

insert into public.ad_products(name,description,price_cents,duration_days,placement)
select * from (values
 ('Featured Homepage — 30 Days','Clearly labeled sponsored card on the homepage.',9900,30,'homepage'),
 ('Enhanced Profile — 30 Days','Photo-enhanced business profile with sponsored disclosure.',4900,30,'business_profile'),
 ('Homepage + Profile — 30 Days','Sponsored homepage card and enhanced business profile.',12900,30,'homepage_and_profile')
) as seed(name,description,price_cents,duration_days,placement)
where not exists(select 1 from public.ad_products);

-- Supabase Cron is optional. Run this block after enabling the Cron integration.
-- select cron.schedule('refresh-ad-campaigns','15 * * * *',$$select public.refresh_ad_campaign_statuses();$$);
