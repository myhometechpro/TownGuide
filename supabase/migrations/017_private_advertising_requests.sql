alter table public.ad_campaigns
  add column if not exists customer_request text;

comment on column public.ad_campaigns.customer_request is
  'Private, administrator-only copy of the original customer advertising submission. Never render publicly.';

update public.ad_campaigns
set customer_request = coalesce(customer_request, ad_copy),
    ad_copy = nullif(btrim(split_part(coalesce(customer_request, ad_copy), E'Customer message:\n', 2)), ''),
    approved = false,
    updated_at = now()
where onboarding_request_id is not null
  and (customer_request is not null or ad_copy like 'CUSTOMER ADVERTISING REQUEST%');

drop policy if exists "public reads live ad campaigns" on public.ad_campaigns;
