-- Create storage buckets for avatars and media
select storage.create_bucket('avatars', public := true); -- avatars made public for simplicity
select storage.create_bucket('media', public := false);

-- Policies for avatars (public read, authenticated write)
create policy if not exists "Avatar public read" on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy if not exists "Avatar owner write" on storage.objects for insert to authenticated
  with check ( bucket_id = 'avatars' );

create policy if not exists "Avatar update del" on storage.objects for update to authenticated using ( bucket_id = 'avatars' )
  with check ( bucket_id = 'avatars' );

-- Policies for media (private; signed URLs recommended). Read only if authenticated (adjust as needed).
create policy if not exists "Media read auth" on storage.objects for select to authenticated using ( bucket_id = 'media' );
create policy if not exists "Media write auth" on storage.objects for insert to authenticated with check ( bucket_id = 'media' );
create policy if not exists "Media change auth" on storage.objects for update to authenticated using ( bucket_id = 'media' ) with check ( bucket_id = 'media' );
