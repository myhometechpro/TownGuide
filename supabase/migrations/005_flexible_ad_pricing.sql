alter table public.ad_products
  add column if not exists half_price_cents integer check (half_price_cents >= 0);

update public.ad_products
set half_price_cents=round(price_cents / 2.0)::integer
where half_price_cents is null;

update public.ad_products set name=replace(name,' — 30 Days','');

alter table public.ad_products alter column half_price_cents set not null;

alter table public.ad_campaigns
  add column if not exists billing_price_cents integer check (billing_price_cents >= 0),
  add column if not exists booked_duration_days integer check (booked_duration_days > 0),
  add column if not exists pricing_term text check (pricing_term in ('full','half'));

update public.ad_campaigns c
set billing_price_cents=coalesce(c.billing_price_cents,p.price_cents),
    booked_duration_days=coalesce(c.booked_duration_days,p.duration_days),
    pricing_term=coalesce(c.pricing_term,'full')
from public.ad_products p
where c.product_id=p.id;
