-- Avatars storage bucket + profile avatar_url column

alter table public.profiles
  add column if not exists avatar_url text;

-- Create a public-read avatars bucket. Files are public so they can render
-- in <Image /> without signed URLs, but writes are restricted by RLS below.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Files are stored under a per-user folder: avatars/{auth.uid()}/<filename>.
-- The first path segment must match the authenticated user's id.

create policy "Avatars are publicly readable"
on storage.objects
for select
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own avatar"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own avatar"
on storage.objects
for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
