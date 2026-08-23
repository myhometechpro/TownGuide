alter table public.ad_campaigns
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

-- Preserve contact details previously stored inside customer request notes.
update public.ad_campaigns
set
  contact_name = coalesce(contact_name, nullif(substring(ad_copy from 'Contact: ([^\n\r]+)'), '')),
  contact_email = coalesce(contact_email, nullif(substring(ad_copy from 'Email: ([^\n\r]+)'), '')),
  contact_phone = coalesce(contact_phone, nullif(substring(ad_copy from 'Phone: ([^\n\r]+)'), ''))
where ad_copy like 'CUSTOMER ADVERTISING REQUEST%';
