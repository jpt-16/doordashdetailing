-- Step 2: profiles, detailers (pending/approved), roles, RLS.
-- Later steps add services, availability, bookings, reviews, etc. in new migrations.

create type public.user_role as enum ('customer', 'detailer', 'admin');
create type public.detailer_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text not null default '',
  phone text,
  saved_address text,
  saved_vehicle_size text check (saved_vehicle_size in ('sedan', 'suv', 'truck')),
  created_at timestamptz not null default now()
);

create table public.detailers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  slug text not null unique,
  business_name text not null default '',
  bio text not null default '',
  town text not null default '',
  zip text not null default '',
  service_zips text[] not null default '{}',
  avatar_url text,
  status public.detailer_status not null default 'pending',
  verified boolean not null default false, -- manual flag, stands in for background/insurance checks
  stripe_account_id text,
  created_at timestamptz not null default now()
);

-- Helper: is the calling user an admin? SECURITY DEFINER avoids RLS recursion on profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- On signup: create the profile and, for detailers, a pending detailer row.
-- Role comes from signup metadata but 'admin' can never be self-assigned.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested text := new.raw_user_meta_data ->> 'role';
  new_role public.user_role := case when requested = 'detailer' then 'detailer' else 'customer' end;
  display_name text := coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1));
begin
  insert into public.profiles (id, role, full_name) values (new.id, new_role, display_name);

  if new_role = 'detailer' then
    insert into public.detailers (user_id, slug, business_name)
    values (
      new.id,
      coalesce(nullif(trim(both '-' from lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g'))), ''), 'detailer')
        || '-' || substr(md5(new.id::text), 1, 5),
      display_name
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Guard fields users must not change themselves. Service role / SQL editor (auth.uid() is null) and admins are exempt.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() and new.role is distinct from old.role then
    raise exception 'role cannot be changed';
  end if;
  return new;
end;
$$;

create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

create or replace function public.guard_detailer_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() and (
    new.status is distinct from old.status
    or new.verified is distinct from old.verified
    or new.stripe_account_id is distinct from old.stripe_account_id
    or new.user_id is distinct from old.user_id
  ) then
    raise exception 'status, verified, and payout account are managed by the platform';
  end if;
  return new;
end;
$$;

create trigger guard_detailer_admin_fields
  before update on public.detailers
  for each row execute function public.guard_detailer_admin_fields();

-- RLS
alter table public.profiles enable row level security;
alter table public.detailers enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Inserts only happen via the signup trigger (security definer), so no insert policy.

create policy "detailers: public reads approved" on public.detailers
  for select using (status = 'approved');

create policy "detailers: owner reads own" on public.detailers
  for select using (user_id = auth.uid());

create policy "detailers: admin reads all" on public.detailers
  for select using (public.is_admin());

create policy "detailers: owner updates own" on public.detailers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "detailers: admin updates all" on public.detailers
  for update using (public.is_admin()) with check (public.is_admin());
