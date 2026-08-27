update public.business_inquiries
set status = lower(trim(status))
where status is not null;
update public.business_inquiries
set status = 'new'
where status is null or status not in ('new','reviewing','resolved','declined');
alter table public.business_inquiries alter column status set default 'new';
alter table public.business_inquiries alter column status set not null;
alter table public.business_inquiries drop constraint if exists business_inquiries_status_check;
alter table public.business_inquiries add constraint business_inquiries_status_check
  check (status in ('new','reviewing','resolved','declined'));
create index if not exists business_inquiries_status_created_idx
  on public.business_inquiries(status, created_at desc);
