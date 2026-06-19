-- ParkSens — schema for the 6-spot prototype demo (reservations + admin control).
-- Applied once via scripts/migrate.mjs against DATABASE_URL (Neon, Vercel Marketplace).

create extension if not exists pgcrypto;

create table if not exists spots (
  id serial primary key,
  num int not null unique,
  label text not null,
  zone text not null,
  status text not null default 'free' check (status in ('free', 'occupied', 'maintenance')),
  updated_at timestamptz not null default now()
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  spot_id int not null references spots(id) on delete cascade,
  full_name text not null,
  email text not null,
  plate text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists reservations_spot_time_idx on reservations (spot_id, start_time, end_time);

insert into spots (num, label, zone, status) values
  (1, 'Place 1', 'entrance', 'free'),
  (2, 'Place 2', 'entrance', 'free'),
  (3, 'Place 3', 'core', 'free'),
  (4, 'Place 4 (PMR)', 'entrance', 'free'),
  (5, 'Place 5', 'core', 'free'),
  (6, 'Place 6', 'core', 'free')
on conflict (num) do nothing;
