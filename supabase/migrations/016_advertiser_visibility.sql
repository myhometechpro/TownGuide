alter table public.businesses
  add column if not exists listing_visibility text not null default 'directory';

alter table public.businesses drop constraint if exists businesses_listing_visibility_check;
alter table public.businesses add constraint businesses_listing_visibility_check
  check (listing_visibility in ('directory','advertiser_only','private'));

comment on column public.businesses.listing_visibility is
  'directory = public profile and directory; advertiser_only = public profile reached from ads only; private = admin-only advertiser record';

drop policy if exists "public reads active businesses" on public.businesses;
drop policy if exists "public reads public business profiles" on public.businesses;
create policy "public reads public business profiles" on public.businesses
  for select using(active and listing_visibility in ('directory','advertiser_only'));

create index if not exists businesses_public_visibility_idx
  on public.businesses(active,listing_visibility,name);
