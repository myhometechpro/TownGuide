alter table public.businesses
  add column if not exists location_type text not null default 'physical',
  add column if not exists lodging_type text;

alter table public.businesses drop constraint if exists businesses_location_type_check;
alter table public.businesses add constraint businesses_location_type_check
  check (location_type in ('physical','service_area','online'));

create index if not exists businesses_map_eligible_idx
  on public.businesses(active,location_type) where latitude is not null and longitude is not null;

comment on column public.businesses.location_type is
  'physical = public destination, service_area = no storefront required, online = internet-only';
comment on column public.businesses.lodging_type is
  'Optional normalized lodging filter such as Cabins, Hotels, Vacation Rentals, RV, or Camping';

alter table public.events
  add column if not exists latitude numeric,
  add column if not exists longitude numeric;
