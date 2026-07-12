import {
  getVehicleAggregateRows,
  listVehicles as listVehiclesFromRepo,
} from "@/server/repositories/vehicle-repository";
import {
  VEHICLE_CONDITIONS,
  VEHICLE_SORT_FIELDS,
  VEHICLE_STATUSES,
  type DashboardSummary,
  type Vehicle,
  type VehicleListFilters,
} from "@/types/vehicle";

export type VehicleListResult =
  { success: true; vehicles: Vehicle[] } | { success: false; error: string };

export type DashboardSummaryResult =
  | { success: true; summary: DashboardSummary }
  | { success: false; error: string };

/**
 * Strips characters that would break Postgrest's `.or()` filter syntax
 * (commas separate conditions, `%`/`_` are ILIKE wildcards) so a raw search
 * string can't be used to alter or break the query.
 */
function sanitizeSearchTerm(rawSearch: string): string {
  return rawSearch
    .trim()
    .replace(/,/g, "")
    .replace(/[%_]/g, (match) => `\\${match}`);
}

function normalizeFilters(filters: VehicleListFilters): VehicleListFilters {
  const normalized: VehicleListFilters = {};

  if (filters.status && VEHICLE_STATUSES.includes(filters.status)) {
    normalized.status = filters.status;
  }

  if (filters.condition && VEHICLE_CONDITIONS.includes(filters.condition)) {
    normalized.condition = filters.condition;
  }

  if (filters.search) {
    const sanitized = sanitizeSearchTerm(filters.search);
    if (sanitized) {
      normalized.search = sanitized;
    }
  }

  normalized.sort =
    filters.sort && VEHICLE_SORT_FIELDS.includes(filters.sort)
      ? filters.sort
      : "received_date";

  normalized.direction = filters.direction === "asc" ? "asc" : "desc";

  return normalized;
}

/**
 * Lists vehicles for the dashboard table. Unrecognized filter values (which
 * can arrive via editable URL search params) are ignored rather than
 * treated as errors.
 */
export async function listVehicles(
  filters: VehicleListFilters,
): Promise<VehicleListResult> {
  const { data, error } = await listVehiclesFromRepo(normalizeFilters(filters));

  if (error) {
    return {
      success: false,
      error: "Unable to load vehicles. Please try again.",
    };
  }

  return { success: true, vehicles: data ?? [] };
}

/**
 * Computes the dashboard KPI summary. `now` is injectable so "sold this
 * month" is deterministic in tests instead of depending on the system clock.
 */
export async function getDashboardSummary(
  now: Date = new Date(),
): Promise<DashboardSummaryResult> {
  const { data, error } = await getVehicleAggregateRows();

  if (error || !data) {
    return {
      success: false,
      error: "Unable to load dashboard summary. Please try again.",
    };
  }

  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  const summary: DashboardSummary = {
    inStockCount: 0,
    pendingCount: 0,
    inTransitCount: 0,
    soldThisMonthCount: 0,
    totalInStockValue: 0,
  };

  for (const row of data) {
    if (row.status === "IN_STOCK") {
      summary.inStockCount += 1;
      summary.totalInStockValue += row.msrp ?? 0;
    } else if (row.status === "PENDING") {
      summary.pendingCount += 1;
    } else if (row.status === "IN_TRANSIT") {
      summary.inTransitCount += 1;
    }

    if (row.status === "SOLD" && row.sold_date) {
      const soldDate = new Date(row.sold_date);
      if (
        soldDate.getUTCFullYear() === currentYear &&
        soldDate.getUTCMonth() === currentMonth
      ) {
        summary.soldThisMonthCount += 1;
      }
    }
  }

  return { success: true, summary };
}
