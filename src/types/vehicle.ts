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
  vin?: string;
  stockNumber?: string;
  make?: string;
  model?: string;
  location?: string;
  yearMin?: number;
  yearMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  msrpMin?: number;
  msrpMax?: number;
  receivedDateFrom?: string;
  receivedDateTo?: string;
  sort?: VehicleSortField;
  direction?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

/**
 * Fixed page size for the vehicle list. Shared by the service (which
 * normalizes `pageSize` to this value) and the repository (which defends
 * against being called with an un-normalized filter object directly).
 */
export const VEHICLE_LIST_PAGE_SIZE = 20;

/**
 * Pagination metadata returned alongside a page of vehicles so the UI can
 * render prev/next controls and a "X of Y" indicator without recomputing
 * anything from the raw filters.
 */
export type VehiclePaginationMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

/**
 * Query-param keys for every filterable column, excluding `sort`/`direction`.
 * Shared by the filter stack UI (to render/clear chips) and by
 * `VehicleTable`'s sort-link builder (to carry active filters across a sort
 * change) so both stay in sync with `VehicleListFilters`.
 */
export const VEHICLE_FILTER_PARAM_KEYS = [
  "status",
  "condition",
  "search",
  "vin",
  "stockNumber",
  "make",
  "model",
  "location",
  "yearMin",
  "yearMax",
  "mileageMin",
  "mileageMax",
  "msrpMin",
  "msrpMax",
  "receivedDateFrom",
  "receivedDateTo",
] as const satisfies readonly (keyof VehicleListFilters)[];

export type DashboardSummary = {
  inStockCount: number;
  pendingCount: number;
  inTransitCount: number;
  soldThisMonthCount: number;
  totalInStockValue: number;
};
