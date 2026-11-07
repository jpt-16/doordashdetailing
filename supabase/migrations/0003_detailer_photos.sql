-- Detailer photos: a table of photo records plus a public Storage bucket for the files.
-- Files live at  detailer-photos/<detailer_id>/<uuid>.<ext>  so Storage policies can check ownership by folder.

create table public.detailer_photos (
  id uuid primary key default gen_random_uuid(),
  detailer_id uuid not null references public.detailers (id) on delete cascade,
  path text not null unique,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index detailer_photos_detailer_idx on public.detailer_photos (detailer_id, position, created_at);

-- Max 10 photos per detailer. Trigger-only function, locked down like the others (see 0002).
create or replace function public.limit_detailer_photos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.detailer_photos where detailer_id = new.detailer_id) >= 10 then
    raise exception 'A detailer can have at most 10 photos';
  end if;
  return new;
end;
$$;

create trigger limit_detailer_photos
  before insert on public.detailer_photos
  for each row execute function public.limit_detailer_photos();

revoke execute on function public.limit_detailer_photos() from public, anon, authenticated;

alter table public.detailer_photos enable row level security;

-- Anyone can see photos of approved detailers.
create policy "photos: public reads approved" on public.detailer_photos
  for select using (
    exists (select 1 from public.detailers d where d.id = detailer_id and d.status = 'approved')
  );

-- Owners manage their own photos, including while pending approval.
create policy "photos: owner reads own" on public.detailer_photos
  for select using (
    exists (select 1 from public.detailers d where d.id = detailer_id and d.user_id = auth.uid())
  );

create policy "photos: owner inserts own" on public.detailer_photos
  for insert with check (
    exists (select 1 from public.detailers d where d.id = detailer_id and d.user_id = auth.uid())
  );

create policy "photos: owner deletes own" on public.detailer_photos
  for delete using (
    exists (select 1 from public.detailers d where d.id = detailer_id and d.user_id = auth.uid())
  );

create policy "photos: admin all" on public.detailer_photos
  for all using (public.is_admin()) with check (public.is_admin());

-- Storage bucket: public read, 5 MB per file, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('detailer-photos', 'detailer-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Anyone can read the files (they are public marketing photos).
create policy "detailer-photos: public read" on storage.objects
  for select using (bucket_id = 'detailer-photos');

-- Writes only inside the folder named after the user's own detailer id.
create policy "detailer-photos: owner uploads" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'detailer-photos'
    and exists (
      select 1 from public.detailers d
      where d.user_id = auth.uid() and d.id::text = (storage.foldername(name))[1]
    )
  );

create policy "detailer-photos: owner deletes" on storage.objects
  for delete to authenticated using (
    bucket_id = 'detailer-photos'
    and exists (
      select 1 from public.detailers d
      where d.user_id = auth.uid() and d.id::text = (storage.foldername(name))[1]
    )
  );

create policy "detailer-photos: admin deletes" on storage.objects
  for delete to authenticated using (bucket_id = 'detailer-photos' and public.is_admin());
