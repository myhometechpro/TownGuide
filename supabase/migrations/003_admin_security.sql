create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
insert into public.admin_users(user_id)
select id from auth.users order by created_at asc limit 1
on conflict do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()) $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
create policy "admins read own membership" on public.admin_users for select to authenticated using(user_id=auth.uid());

drop policy if exists "authenticated manages businesses" on public.businesses;
drop policy if exists "authenticated manages attractions" on public.attractions;
drop policy if exists "authenticated manages trails" on public.trails;
drop policy if exists "authenticated manages events" on public.events;
drop policy if exists "authenticated manages deals" on public.deals;
drop policy if exists "authenticated manages qr" on public.qr_locations;
drop policy if exists "authenticated reads scans" on public.qr_scans;
drop policy if exists "authenticated reads analytics" on public.analytics_events;
drop policy if exists "authenticated manages inquiries" on public.business_inquiries;

create policy "admins manage businesses" on public.businesses for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "admins manage attractions" on public.attractions for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "admins manage trails" on public.trails for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "admins manage events" on public.events for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "admins manage deals" on public.deals for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "admins manage qr" on public.qr_locations for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy "admins read scans" on public.qr_scans for select to authenticated using((select public.is_admin()));
create policy "admins read analytics" on public.analytics_events for select to authenticated using((select public.is_admin()));
create policy "admins manage inquiries" on public.business_inquiries for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));

drop policy if exists "authenticated uploads content images" on storage.objects;
drop policy if exists "authenticated updates content images" on storage.objects;
drop policy if exists "authenticated deletes content images" on storage.objects;
create policy "admins upload content images" on storage.objects for insert to authenticated with check(bucket_id='content-images' and (select public.is_admin()));
create policy "admins update content images" on storage.objects for update to authenticated using(bucket_id='content-images' and (select public.is_admin())) with check(bucket_id='content-images' and (select public.is_admin()));
create policy "admins delete content images" on storage.objects for delete to authenticated using(bucket_id='content-images' and (select public.is_admin()));
