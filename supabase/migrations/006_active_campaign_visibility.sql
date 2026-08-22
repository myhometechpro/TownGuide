drop policy if exists "public reads live ad campaigns" on public.ad_campaigns;
create policy "public reads live ad campaigns" on public.ad_campaigns
for select using(status='active' and start_date<=current_date and end_date>=current_date);
