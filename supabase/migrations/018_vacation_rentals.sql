-- Dedicated vacation-rental advertising. Additive and safe for existing data.
create table if not exists public.vacation_rental_products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  duration_days integer not null default 365 check (duration_days > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.vacation_rental_products(code,name,price_cents,duration_days)
values ('founding-annual','Founding Vacation Rental Listing',7900,365)
on conflict (code) do nothing;

create table if not exists public.vacation_rentals (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  owner_user_id uuid references auth.users(id) on delete set null,
  owner_name text not null,
  owner_email text not null,
  owner_phone text not null,
  preferred_contact text not null check (preferred_contact in ('email','phone')),
  authorized_to_advertise boolean not null,
  property_name text not null,
  slug text not null unique,
  location text not null check (location in ('Heber','Overgaard','Forest Lakes','Nearby area')),
  general_area text,
  property_type text not null check (property_type in ('Cabin','House','Condo','Guesthouse','Other')),
  short_description text not null,
  description text not null,
  max_guests smallint not null check (max_guests between 1 and 100),
  bedrooms numeric(4,1) not null check (bedrooms between 0 and 50),
  bathrooms numeric(4,1) not null check (bathrooms between 0 and 50),
  pet_friendly boolean not null default false,
  amenities text[] not null default '{}',
  highlights text[] not null default '{}',
  airbnb_url text,
  vrbo_url text,
  direct_booking_url text,
  approximate_latitude numeric check (approximate_latitude between -90 and 90),
  approximate_longitude numeric check (approximate_longitude between -180 and 180),
  map_is_approximate boolean not null default true check (map_is_approximate),
  featured_image_url text,
  photo_urls text[] not null default '{}',
  status text not null default 'payment_pending' check (status in ('draft','submitted','payment_pending','needs_review','changes_requested','approved','published','rejected','expired','archived')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','cancelled','refunded')),
  advertising_start_date date,
  advertising_expires_at date,
  featured boolean not null default false,
  published boolean not null default false,
  admin_notes text,
  agreement_version text not null,
  agreement_accepted_at timestamptz not null,
  agreement_snapshot text not null,
  acknowledgements jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(photo_urls) <= 10),
  check (airbnb_url is not null or vrbo_url is not null or direct_booking_url is not null),
  check (advertising_expires_at is null or advertising_start_date is not null),
  check (not published or status = 'published')
);

create table if not exists public.vacation_rental_orders (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.vacation_rentals(id) on delete restrict,
  product_id uuid not null references public.vacation_rental_products(id),
  amount_cents integer not null check (amount_cents >= 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled','refunded')),
  stripe_payment_link_id text unique,
  stripe_payment_link_url text,
  stripe_checkout_session_id text unique,
  stripe_paid_at timestamptz,
  agreement_version text not null,
  agreement_accepted_at timestamptz not null,
  agreement_snapshot text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.advertising_agreement_deliveries alter column campaign_id drop not null;
alter table public.advertising_agreement_deliveries add column if not exists rental_id uuid references public.vacation_rentals(id) on delete cascade;
alter table public.advertising_agreement_deliveries add column if not exists order_id uuid references public.vacation_rental_orders(id) on delete cascade;
alter table public.advertising_agreement_deliveries drop constraint if exists advertising_agreement_delivery_subject_check;
alter table public.advertising_agreement_deliveries add constraint advertising_agreement_delivery_subject_check
  check ((campaign_id is not null)::int + (rental_id is not null)::int = 1);
create index if not exists rental_agreement_deliveries_idx on public.advertising_agreement_deliveries(rental_id,created_at desc);

create index if not exists vacation_rentals_admin_idx on public.vacation_rentals(status,payment_status,created_at desc);
create index if not exists vacation_rentals_public_idx on public.vacation_rentals(published,status,advertising_expires_at);

alter table public.vacation_rental_products enable row level security;
alter table public.vacation_rentals enable row level security;
alter table public.vacation_rental_orders enable row level security;
create policy "public reads active rental products" on public.vacation_rental_products for select using(active);
create policy "admins manage rental products" on public.vacation_rental_products for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "admins manage vacation rentals" on public.vacation_rentals for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "owners read own vacation rentals" on public.vacation_rentals for select to authenticated using(owner_user_id=auth.uid());
create policy "admins manage rental orders" on public.vacation_rental_orders for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));

-- This projection is the only anonymous rental surface. It intentionally omits all owner,
-- payment, agreement, exact-location and administration fields.
create or replace view public.public_vacation_rentals with (security_barrier=true) as
select id,property_name,slug,location,general_area,property_type,short_description,description,
  max_guests,bedrooms,bathrooms,pet_friendly,amenities,highlights,airbnb_url,vrbo_url,
  direct_booking_url,approximate_latitude,approximate_longitude,map_is_approximate,
  featured_image_url,photo_urls,featured,advertising_start_date,advertising_expires_at,updated_at
from public.vacation_rentals
where published and status='published' and payment_status='paid'
  and advertising_start_date <= current_date and advertising_expires_at >= current_date;
revoke all on public.public_vacation_rentals from public;
grant select on public.public_vacation_rentals to anon, authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('vacation-rental-images','vacation-rental-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create policy "public reads rental images" on storage.objects for select using(bucket_id='vacation-rental-images');
create policy "admins manage rental images" on storage.objects for all to authenticated
  using(bucket_id='vacation-rental-images' and (select public.is_admin()))
  with check(bucket_id='vacation-rental-images' and (select public.is_admin()));

create or replace function public.refresh_vacation_rental_statuses()
returns void language plpgsql security definer set search_path='public' as $$
begin
  update vacation_rentals set status='expired',published=false,updated_at=now()
  where published and advertising_expires_at < current_date;
end $$;
revoke all on function public.refresh_vacation_rental_statuses() from public;
grant execute on function public.refresh_vacation_rental_statuses() to authenticated;
