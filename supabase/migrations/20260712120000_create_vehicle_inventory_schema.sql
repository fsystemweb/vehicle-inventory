-- Vehicle Inventory schema: vehicles, vehicle_options, inventory_movements.
-- See CLAUDE.md for the FE/BE boundary rules that govern how this schema is accessed
-- (only src/server/repositories/** may query these tables directly).

create table if not exists vehicles (
  id bigint generated always as identity primary key,
  vin varchar(17) not null unique,
  stock_number varchar(20) not null unique,
  make varchar(50) not null,
  model varchar(50) not null,
  year int not null,
  trim varchar(50),
  color varchar(30),
  interior_color varchar(30),
  mileage int not null default 0 check (mileage >= 0),
  msrp numeric(10, 2),
  invoice_cost numeric(10, 2),
  status varchar(20) not null default 'IN_STOCK'
    check (status in ('IN_STOCK', 'SOLD', 'PENDING', 'IN_TRANSIT')),
  condition varchar(10) not null
    check (condition in ('NEW', 'USED', 'CPO')),
  location varchar(50),
  received_date date,
  sold_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vehicles_status on vehicles (status);

create table if not exists vehicle_options (
  id bigint generated always as identity primary key,
  vehicle_id bigint not null references vehicles (id) on delete cascade,
  option_name varchar(100) not null,
  option_code varchar(20),
  price numeric(10, 2)
);

create index if not exists idx_vehicle_options_vehicle_id on vehicle_options (vehicle_id);

create table if not exists inventory_movements (
  id bigint generated always as identity primary key,
  vehicle_id bigint not null references vehicles (id) on delete cascade,
  old_status varchar(20)
    check (old_status in ('IN_STOCK', 'SOLD', 'PENDING', 'IN_TRANSIT')),
  new_status varchar(20) not null
    check (new_status in ('IN_STOCK', 'SOLD', 'PENDING', 'IN_TRANSIT')),
  changed_by varchar(100) not null,
  changed_at timestamptz not null default now()
);

create index if not exists idx_inventory_movements_vehicle_id on inventory_movements (vehicle_id);

-- Keep vehicles.updated_at current on every row update.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vehicles_set_updated_at on vehicles;
create trigger vehicles_set_updated_at
before update on vehicles
for each row
execute function set_updated_at();

-- RLS: no dealer/role model exists yet, so any authenticated user has full
-- read/write access on all three tables (matches the project's current
-- single-role setup). Anonymous access is denied by default once RLS is on.
alter table vehicles enable row level security;
create policy "authenticated_full_access" on vehicles
  for all to authenticated using (true) with check (true);

alter table vehicle_options enable row level security;
create policy "authenticated_full_access" on vehicle_options
  for all to authenticated using (true) with check (true);

alter table inventory_movements enable row level security;
create policy "authenticated_full_access" on inventory_movements
  for all to authenticated using (true) with check (true);
