-- Local/demo data for the Vehicle Inventory dashboard. Applied automatically by
-- `supabase db reset`. Idempotent via `on conflict do nothing` on the natural
-- unique keys (vin, stock_number) so it's safe to re-run against a seeded DB.

insert into vehicles
  (vin, stock_number, make, model, year, trim, color, interior_color, mileage, msrp, invoice_cost, status, condition, location, received_date, sold_date)
values
  ('4T1BF1FK5NU123001', 'STK1001', 'Toyota', 'Camry', 2026, 'XLE', 'Blue', 'Black', 5, 32500.00, 29800.00, 'IN_STOCK', 'NEW', 'Lot A-12', '2026-06-01', null),
  ('4T1BF1FK5NU123002', 'STK1002', 'Toyota', 'RAV4', 2026, 'XLE', 'White', 'Gray', 8, 34200.00, 31500.00, 'IN_STOCK', 'NEW', 'Lot A-14', '2026-06-03', null),
  ('1HGCV1F34NA123003', 'STK1003', 'Honda', 'Accord', 2025, 'Sport', 'Black', 'Black', 12, 29800.00, 27200.00, 'SOLD', 'NEW', 'Showroom', '2026-05-10', '2026-07-05'),
  ('7FARW2H85NE123004', 'STK1004', 'Honda', 'CR-V', 2026, 'EX-L', 'Silver', 'Black', 3, 33900.00, 31000.00, 'PENDING', 'NEW', 'Lot B-03', '2026-06-20', null),
  ('1FTFW1E85NF123005', 'STK1005', 'Ford', 'F-150', 2026, 'XLT', 'Red', 'Black', 0, 45300.00, 41800.00, 'IN_TRANSIT', 'NEW', 'In Transit', null, null),
  ('1FMCU9G65NU123006', 'STK1006', 'Ford', 'Escape', 2025, 'SE', 'Blue', 'Gray', 18500, 24500.00, 21000.00, 'SOLD', 'USED', 'Showroom', '2026-04-15', '2026-06-28'),
  ('3GCUYDED5NG123007', 'STK1007', 'Chevrolet', 'Silverado', 2026, 'LT', 'White', 'Black', 6, 47800.00, 44200.00, 'IN_STOCK', 'NEW', 'Lot A-01', '2026-06-25', null),
  ('3GNAXUEV5NL123008', 'STK1008', 'Chevrolet', 'Equinox', 2024, 'LS', 'Gray', 'Black', 32100, 21900.00, 18500.00, 'IN_STOCK', 'USED', 'Lot C-08', '2026-05-01', null),
  ('WBA5R7C05ND123009', 'STK1009', 'BMW', '3 Series', 2025, '330i', 'Black', 'Tan', 14200, 38900.00, 35000.00, 'IN_STOCK', 'CPO', 'Showroom', '2026-05-20', null),
  ('5UXCR6C05NL123010', 'STK1010', 'BMW', 'X5', 2023, 'xDrive40i', 'White', 'Black', 28900, 52400.00, 47000.00, 'IN_STOCK', 'USED', 'Lot A-20', '2026-04-02', null),
  ('KMHLM4AG5NU123011', 'STK1011', 'Hyundai', 'Elantra', 2026, 'SEL', 'Silver', 'Black', 4, 23400.00, 21000.00, 'IN_STOCK', 'NEW', 'Lot B-10', '2026-06-28', null),
  ('5NMJBCAE5NH123012', 'STK1012', 'Hyundai', 'Tucson', 2025, 'SEL', 'Blue', 'Gray', 9, 28900.00, 26200.00, 'SOLD', 'NEW', 'Showroom', '2026-05-15', '2026-07-01'),
  ('1N4BL4EV5NN123013', 'STK1013', 'Nissan', 'Altima', 2024, 'SV', 'Gray', 'Black', 24300, 19800.00, 16500.00, 'PENDING', 'USED', 'Lot C-02', '2026-05-28', null),
  ('5N1AT3AB5NC123014', 'STK1014', 'Nissan', 'Rogue', 2026, 'SV', 'Black', 'Black', 0, 30200.00, 27600.00, 'IN_TRANSIT', 'NEW', 'In Transit', null, null),
  ('KNDPM3AC5N7123015', 'STK1015', 'Kia', 'Sportage', 2025, 'LX', 'White', 'Black', 11, 27500.00, 25000.00, 'IN_STOCK', 'NEW', 'Lot A-18', '2026-06-10', null),
  ('5XYP34HC5NG123016', 'STK1016', 'Kia', 'Telluride', 2024, 'SX', 'Blue', 'Black', 21000, 41200.00, 37500.00, 'SOLD', 'USED', 'Showroom', '2026-03-20', '2026-06-15'),
  ('4S4BTANC5N3123017', 'STK1017', 'Subaru', 'Outback', 2025, 'Limited', 'Green', 'Black', 7, 34800.00, 31900.00, 'IN_STOCK', 'NEW', 'Lot A-22', '2026-06-18', null),
  ('JM3KFBDM5N0123018', 'STK1018', 'Mazda', 'CX-5', 2023, 'Touring', 'Red', 'Black', 26700, 25900.00, 22800.00, 'IN_STOCK', 'CPO', 'Lot C-15', '2026-04-25', null)
on conflict (vin) do nothing;

-- Optional equipment for a handful of vehicles.
insert into vehicle_options (vehicle_id, option_name, option_code, price)
select id, opt.option_name, opt.option_code, opt.price
from vehicles
cross join lateral (
  values
    ('STK1001', 'Sunroof', 'SUNRF', 895.00),
    ('STK1001', 'Navigation', 'NAV', 1200.00),
    ('STK1005', 'Tow Package', 'TOW', 650.00),
    ('STK1005', 'Bed Liner', 'BEDLN', 375.00),
    ('STK1009', 'Leather Seats', 'LTHR', 1450.00),
    ('STK1009', 'Premium Package', 'PREM', 2200.00),
    ('STK1010', 'Panoramic Roof', 'PANO', 1600.00),
    ('STK1017', 'Navigation', 'NAV', 1100.00),
    ('STK1017', 'Roof Rack', 'ROOF', 450.00)
) as opt(stock_number, option_name, option_code, price)
where vehicles.stock_number = opt.stock_number;

-- Status history for vehicles that have moved since arriving.
insert into inventory_movements (vehicle_id, old_status, new_status, changed_by, changed_at)
select id, mv.old_status, mv.new_status, mv.changed_by, mv.changed_at::timestamptz
from vehicles
cross join lateral (
  values
    ('STK1003', null, 'IN_STOCK', 'system', '2026-05-10 09:00:00'),
    ('STK1003', 'IN_STOCK', 'SOLD', 'facu.cappella@gmail.com', '2026-07-05 14:30:00'),
    ('STK1006', null, 'IN_STOCK', 'system', '2026-04-15 09:00:00'),
    ('STK1006', 'IN_STOCK', 'SOLD', 'facu.cappella@gmail.com', '2026-06-28 16:10:00'),
    ('STK1012', null, 'IN_STOCK', 'system', '2026-05-15 09:00:00'),
    ('STK1012', 'IN_STOCK', 'SOLD', 'facu.cappella@gmail.com', '2026-07-01 11:45:00'),
    ('STK1016', null, 'IN_STOCK', 'system', '2026-03-20 09:00:00'),
    ('STK1016', 'IN_STOCK', 'SOLD', 'facu.cappella@gmail.com', '2026-06-15 13:20:00'),
    ('STK1004', null, 'IN_STOCK', 'system', '2026-06-20 09:00:00'),
    ('STK1004', 'IN_STOCK', 'PENDING', 'facu.cappella@gmail.com', '2026-07-08 10:05:00'),
    ('STK1013', null, 'IN_STOCK', 'system', '2026-05-28 09:00:00'),
    ('STK1013', 'IN_STOCK', 'PENDING', 'facu.cappella@gmail.com', '2026-07-02 15:50:00')
) as mv(stock_number, old_status, new_status, changed_by, changed_at)
where vehicles.stock_number = mv.stock_number;
