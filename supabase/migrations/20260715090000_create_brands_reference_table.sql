-- Brands reference table: powers the "Make" autocomplete on the vehicle
-- add/edit forms. vehicles.make stays free-text (varchar(50), no FK) — this
-- table is purely a suggestion source, not a constraint.
-- See CLAUDE.md for the FE/BE boundary rules that govern how this schema is
-- accessed (only src/server/repositories/** may query these tables directly).

create table if not exists brands (
  id bigint generated always as identity primary key,
  name varchar(50) not null unique
);

-- RLS: no dealer/role model exists yet, so any authenticated user has full
-- read/write access (matches the pattern used for vehicles, vehicle_options,
-- and inventory_movements). Anonymous access is denied by default once RLS
-- is on.
alter table brands enable row level security;
create policy "authenticated_full_access" on brands
  for all to authenticated using (true) with check (true);

-- Seed data: distinct make values currently used by the demo rows in
-- supabase/seed.sql. seed.sql itself is demo-only and does not run against
-- the remote project, so this reference data is seeded here instead to
-- ensure it exists in every environment.
insert into brands (name) values
  ('Toyota'),
  ('Honda'),
  ('Ford'),
  ('Chevrolet'),
  ('BMW'),
  ('Hyundai'),
  ('Nissan'),
  ('Kia'),
  ('Subaru'),
  ('Mazda')
on conflict (name) do nothing;
