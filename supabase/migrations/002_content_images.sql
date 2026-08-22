insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('content-images', 'content-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true, file_size_limit=5242880, allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];

create policy "public reads content images" on storage.objects for select using (bucket_id='content-images');
create policy "authenticated uploads content images" on storage.objects for insert to authenticated with check (bucket_id='content-images');
create policy "authenticated updates content images" on storage.objects for update to authenticated using (bucket_id='content-images') with check (bucket_id='content-images');
create policy "authenticated deletes content images" on storage.objects for delete to authenticated using (bucket_id='content-images');
