-- Follow-up for environments where migration 018 was applied before payment-link URLs were retained.
alter table public.vacation_rental_orders
  add column if not exists stripe_payment_link_url text;
