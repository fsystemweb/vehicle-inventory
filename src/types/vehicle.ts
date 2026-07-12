export type VehicleStatus = "IN_STOCK" | "SOLD" | "PENDING" | "IN_TRANSIT";

export type VehicleCondition = "NEW" | "USED" | "CPO";

export const VEHICLE_STATUSES: VehicleStatus[] = [
  "IN_STOCK",
  "SOLD",
  "PENDING",
  "IN_TRANSIT",
];

export const VEHICLE_CONDITIONS: VehicleCondition[] = ["NEW", "USED", "CPO"];

export type Vehicle = {
  id: number;
  vin: string;
  stock_number: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  color: string | null;
  interior_color: string | null;
  mileage: number;
  msrp: number | null;
  invoice_cost: number | null;
  status: VehicleStatus;
  condition: VehicleCondition;
  location: string | null;
  received_date: string | null;
  sold_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type VehicleInput = {
  vin: string;
  stock_number: string;
  make: string;
  model: string;
  year: number;
  trim: string | null;
  color: string | null;
  interior_color: string | null;
  mileage: number;
  msrp: number | null;
  invoice_cost: number | null;
  status: VehicleStatus;
  condition: VehicleCondition;
  location: string | null;
  received_date: string | null;
  sold_date: string | null;
  notes: string | null;
};

export type VehicleSortField =
  "year" | "make" | "mileage" | "msrp" | "received_date";

export const VEHICLE_SORT_FIELDS: VehicleSortField[] = [
  "year",
  "make",
  "mileage",
  "msrp",
  "received_date",
];

export type VehicleListFilters = {
  status?: VehicleStatus;
  condition?: VehicleCondition;
  search?: string;
  sort?: VehicleSortField;
  direction?: "asc" | "desc";
};

export type DashboardSummary = {
  inStockCount: number;
  pendingCount: number;
  inTransitCount: number;
  soldThisMonthCount: number;
  totalInStockValue: number;
};
