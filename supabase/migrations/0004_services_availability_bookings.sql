-- Step 3-5: detailer services, weekly availability, and bookings.
-- Money is stored in cents. The deposit is 25% (keep in sync with config/brand.ts depositPercent).
-- Bookings are only created and changed through the functions below, never by direct table writes,
-- so prices, capacity and status changes are enforced in one place.

alter table public.detailers
  add column instant_book boolean not null default false,
  add column jobs_per_window smallint not null default 1 check (jobs_per_window between 1 and 4);

-- ---------- services ----------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  detailer_id uuid not null references public.detailers (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '' check (char_length(description) <= 300),
  minutes int not null check (minutes between 15 and 720),
  category text not null check (category in ('exterior', 'interior', 'full', 'ceramic', 'fleet')),
  price_sedan_cents int not null check (price_sedan_cents between 1000 and 200000),
  price_suv_cents int not null check (price_suv_cents between 1000 and 200000),
  price_truck_cents int not null check (price_truck_cents between 1000 and 200000),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index services_detailer_idx on public.services (detailer_id);

alter table public.services enable row level security;

create policy "services: public reads active of approved" on public.services
  for select using (
    active and exists (select 1 from public.detailers d where d.id = detailer_id and d.status = 'approved')
  );
create policy "services: owner manages" on public.services
  for all
  using (exists (select 1 from public.detailers d where d.id = detailer_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.detailers d where d.id = detailer_id and d.user_id = auth.uid()));
create policy "services: admin reads" on public.services
  for select using (public.is_admin());

-- ---------- availability ----------
-- Which weekday + arrival window combinations a detailer works. weekday: 0 = Monday ... 6 = Sunday.
create table public.availability (
  detailer_id uuid not null references public.detailers (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  win text not null check (win in ('morning', 'afternoon', 'evening')),
  primary key (detailer_id, weekday, win)
);

alter table public.availability enable row level security;

create policy "availability: public reads approved" on public.availability
  for select using (exists (select 1 from public.detailers d where d.id = detailer_id and d.status = 'approved'));
create policy "availability: owner manages" on public.availability
  for all
  using (exists (select 1 from public.detailers d where d.id = detailer_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.detailers d where d.id = detailer_id and d.user_id = auth.uid()));

-- ---------- bookings ----------
create type public.booking_status as enum
  ('requested', 'confirmed', 'en_route', 'in_progress', 'completed', 'declined', 'cancelled');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_id uuid not null references public.profiles (id),
  detailer_id uuid not null references public.detailers (id),
  service_id uuid references public.services (id) on delete set null,
  service_name text not null,
  vehicle text not null check (vehicle in ('sedan', 'suv', 'truck')),
  address text not null check (char_length(address) between 5 and 200),
  day date not null,
  win text not null check (win in ('morning', 'afternoon', 'evening')),
  note text not null default '' check (char_length(note) <= 500),
  price_cents int not null check (price_cents > 0),
  deposit_cents int not null check (deposit_cents > 0),
  deposit_paid boolean not null default false, -- flips to true when Stripe is added
  status public.booking_status not null,
  created_at timestamptz not null default now()
);
create index bookings_slot_idx on public.bookings (detailer_id, day, win);
create index bookings_customer_idx on public.bookings (customer_id, created_at desc);

alter table public.bookings enable row level security;

-- Read-only from the client. Customer sees their own; a detailer sees jobs for their business; admins see all.
create policy "bookings: customer reads own" on public.bookings
  for select using (customer_id = auth.uid());
create policy "bookings: detailer reads own jobs" on public.bookings
  for select using (exists (select 1 from public.detailers d where d.id = detailer_id and d.user_id = auth.uid()));
create policy "bookings: admin reads all" on public.bookings
  for select using (public.is_admin());

-- ---------- functions ----------
-- Public, aggregate-only: how many active bookings fill each day + window. No personal data.
create or replace function public.booked_windows(p_detailer uuid, p_from date, p_to date)
returns table (day date, win text, taken int)
language sql
stable
security definer
set search_path = public
as $$
  select b.day, b.win, count(*)::int
  from public.bookings b
  where b.detailer_id = p_detailer
    and b.day between p_from and p_to
    and b.status in ('requested', 'confirmed', 'en_route', 'in_progress')
  group by b.day, b.win;
$$;
revoke execute on function public.booked_windows(uuid, date, date) from public;
grant execute on function public.booked_windows(uuid, date, date) to anon, authenticated;

-- Create a booking. The price is read from the service row, never from the caller.
-- The detailer row is locked while we check capacity, so two customers cannot take the same last slot.
create or replace function public.create_booking(
  p_detailer uuid,
  p_service uuid,
  p_vehicle text,
  p_address text,
  p_day date,
  p_win text,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  d public.detailers%rowtype;
  s public.services%rowtype;
  today date := (now() at time zone 'America/New_York')::date;
  dow smallint := (extract(isodow from p_day)::int - 1);
  taken int;
  price int;
  new_id uuid;
begin
  if uid is null then raise exception 'Sign in to book'; end if;
  if not exists (select 1 from public.profiles where id = uid and role = 'customer') then
    raise exception 'Only customers can book';
  end if;
  if p_vehicle not in ('sedan', 'suv', 'truck') then raise exception 'Choose a vehicle size'; end if;
  if p_win not in ('morning', 'afternoon', 'evening') then raise exception 'Choose an arrival window'; end if;
  if p_day < today or p_day > today + 30 then raise exception 'Choose a day in the next 30 days'; end if;
  if char_length(trim(coalesce(p_address, ''))) < 5 then raise exception 'Enter the address'; end if;

  select * into d from public.detailers where id = p_detailer and status = 'approved' for update;
  if not found then raise exception 'That detailer is not available'; end if;

  select * into s from public.services where id = p_service and detailer_id = p_detailer and active;
  if not found then raise exception 'That service is not available'; end if;

  if not exists (select 1 from public.availability a where a.detailer_id = p_detailer and a.weekday = dow and a.win = p_win) then
    raise exception 'That time is not open';
  end if;

  select count(*) into taken from public.bookings b
  where b.detailer_id = p_detailer and b.day = p_day and b.win = p_win
    and b.status in ('requested', 'confirmed', 'en_route', 'in_progress');
  if taken >= d.jobs_per_window then raise exception 'That arrival window is full'; end if;

  price := case p_vehicle when 'sedan' then s.price_sedan_cents when 'suv' then s.price_suv_cents else s.price_truck_cents end;

  insert into public.bookings
    (code, customer_id, detailer_id, service_id, service_name, vehicle, address, day, win, note,
     price_cents, deposit_cents, status)
  values (
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
    uid, p_detailer, s.id, s.name, p_vehicle, trim(p_address), p_day, p_win, left(coalesce(p_note, ''), 500),
    price, round(price * 25 / 100.0)::int,
    case when d.instant_book then 'confirmed'::public.booking_status else 'requested'::public.booking_status end
  )
  returning id into new_id;
  return new_id;
end;
$$;
revoke execute on function public.create_booking(uuid, uuid, text, text, date, text, text) from public, anon;
grant execute on function public.create_booking(uuid, uuid, text, text, date, text, text) to authenticated;

-- Detailer accepts or declines a request.
create or replace function public.respond_booking(p_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings b
  set status = case when p_accept then 'confirmed'::public.booking_status else 'declined'::public.booking_status end
  where b.id = p_id and b.status = 'requested'
    and exists (select 1 from public.detailers d where d.id = b.detailer_id and d.user_id = auth.uid());
  if not found then raise exception 'Request not found'; end if;
end;
$$;
revoke execute on function public.respond_booking(uuid, boolean) from public, anon;
grant execute on function public.respond_booking(uuid, boolean) to authenticated;

-- Detailer moves a job forward: confirmed -> en route -> in progress -> completed.
create or replace function public.advance_booking(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings b
  set status = case b.status
    when 'confirmed' then 'en_route'::public.booking_status
    when 'en_route' then 'in_progress'::public.booking_status
    when 'in_progress' then 'completed'::public.booking_status
  end
  where b.id = p_id and b.status in ('confirmed', 'en_route', 'in_progress')
    and exists (select 1 from public.detailers d where d.id = b.detailer_id and d.user_id = auth.uid());
  if not found then raise exception 'Job not found'; end if;
end;
$$;
revoke execute on function public.advance_booking(uuid) from public, anon;
grant execute on function public.advance_booking(uuid) to authenticated;

-- Customer or detailer cancels a booking that has not started.
create or replace function public.cancel_booking(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings b
  set status = 'cancelled'
  where b.id = p_id and b.status in ('requested', 'confirmed')
    and (b.customer_id = auth.uid()
         or exists (select 1 from public.detailers d where d.id = b.detailer_id and d.user_id = auth.uid()));
  if not found then raise exception 'Booking not found'; end if;
end;
$$;
revoke execute on function public.cancel_booking(uuid) from public, anon;
grant execute on function public.cancel_booking(uuid) to authenticated;
