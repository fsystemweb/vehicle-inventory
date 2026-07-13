import type { PostgrestError } from "@supabase/supabase-js";
import {
  createVehicle as createVehicleInRepo,
  deleteVehicle as deleteVehicleFromRepo,
  getVehicleAggregateRows,
  getVehicleById,
  listVehicles as listVehiclesFromRepo,
  updateVehicle as updateVehicleInRepo,
} from "@/server/repositories/vehicle-repository";
import {
  VEHICLE_CONDITIONS,
  VEHICLE_LIST_PAGE_SIZE,
  VEHICLE_SORT_FIELDS,
  VEHICLE_STATUSES,
  type DashboardSummary,
  type Vehicle,
  type VehicleInput,
  type VehicleListFilters,
  type VehiclePaginationMeta,
} from "@/types/vehicle";

export type VehicleListResult =
  | {
      success: true;
      vehicles: Vehicle[];
      pagination: VehiclePaginationMeta;
    }
  | { success: false; error: string };

export type DashboardSummaryResult =
  | { success: true; summary: DashboardSummary }
  | { success: false; error: string };

export type VehicleResult =
  { success: true; vehicle: Vehicle } | { success: false; error: string };

export type VehicleDeleteResult =
  { success: true } | { success: false; error: string };

const VIN_LENGTH = 17;
const MIN_YEAR = 1980;

/**
 * Validates a create/update payload. Returns the first validation error
 * found, or `null` when the payload is valid. Keeps the rule "a single
 * `error: string` is fine" from CLAUDE.md.
 */
function validateVehicleInput(
  input: VehicleInput,
  now: Date = new Date(),
): string | null {
  if (!input.vin || !input.vin.trim()) {
    return "VIN is required.";
  }

  if (input.vin.trim().length !== VIN_LENGTH) {
    return "VIN must be 17 characters.";
  }

  if (!input.stock_number || !input.stock_number.trim()) {
    return "Stock number is required.";
  }

  if (!input.make || !input.make.trim()) {
    return "Make is required.";
  }

  if (!input.model || !input.model.trim()) {
    return "Model is required.";
  }

  const maxYear = now.getUTCFullYear();
  if (
    input.year == null ||
    Number.isNaN(input.year) ||
    input.year < MIN_YEAR ||
    input.year > maxYear
  ) {
    return `Year must be between ${MIN_YEAR} and ${maxYear}.`;
  }

  if (input.mileage == null || Number.isNaN(input.mileage)) {
    return "Mileage is required.";
  }

  if (input.mileage < 0) {
    return "Mileage cannot be negative.";
  }

  if (input.msrp != null && input.msrp < 0) {
    return "MSRP cannot be negative.";
  }

  if (input.invoice_cost != null && input.invoice_cost < 0) {
    return "Invoice cost cannot be negative.";
  }

  if (!input.condition || !VEHICLE_CONDITIONS.includes(input.condition)) {
    return "Condition must be one of NEW, USED, or CPO.";
  }

  if (!input.status || !VEHICLE_STATUSES.includes(input.status)) {
    return "Status must be one of IN_STOCK, SOLD, PENDING, or IN_TRANSIT.";
  }

  return null;
}

/**
 * Translates a Postgres unique-violation on `vehicles` into a friendly,
 * field-specific message when the constraint name makes it obvious which
 * column collided.
 */
function friendlyUniqueViolationError(error: PostgrestError): string {
  const message = error.message.toLowerCase();

  if (message.includes("vin")) {
    return "A vehicle with this VIN already exists.";
  }

  if (message.includes("stock_number")) {
    return "A vehicle with this stock number already exists.";
  }

  return "A vehicle with this VIN or stock number already exists.";
}

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

/**
 * Escapes ILIKE wildcards (`%`/`_`) out of a single-column text filter so a
 * raw value can't be used to widen or break the pattern match. Unlike
 * `sanitizeSearchTerm`, commas are left alone since these values are never
 * combined into an `.or()` filter.
 */
function sanitizeTextFilter(rawValue: string): string {
  return rawValue.trim().replace(/[%_]/g, (match) => `\\${match}`);
}

/**
 * Normalizes a min/max numeric range pair: non-finite values are dropped,
 * and a min greater than max is treated as no constraint on either end
 * (an impossible range from stale/tampered URL params, not a real filter).
 */
function normalizeRange(
  min: number | undefined,
  max: number | undefined,
): { min?: number; max?: number } {
  const validMin = min != null && Number.isFinite(min) ? min : undefined;
  const validMax = max != null && Number.isFinite(max) ? max : undefined;

  if (validMin != null && validMax != null && validMin > validMax) {
    return {};
  }

  return { min: validMin, max: validMax };
}

/**
 * Normalizes a from/to date-string range pair. Malformed dates and an
 * inverted range (from after to) are dropped rather than treated as errors,
 * since these arrive via editable URL search params.
 */
function normalizeDateRange(
  from: string | undefined,
  to: string | undefined,
): { from?: string; to?: string } {
  const validFrom = from && !Number.isNaN(Date.parse(from)) ? from : undefined;
  const validTo = to && !Number.isNaN(Date.parse(to)) ? to : undefined;

  if (validFrom && validTo && validFrom > validTo) {
    return {};
  }

  return { from: validFrom, to: validTo };
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

  if (filters.vin) {
    const sanitized = sanitizeTextFilter(filters.vin);
    if (sanitized) normalized.vin = sanitized;
  }

  if (filters.stockNumber) {
    const sanitized = sanitizeTextFilter(filters.stockNumber);
    if (sanitized) normalized.stockNumber = sanitized;
  }

  if (filters.make) {
    const sanitized = sanitizeTextFilter(filters.make);
    if (sanitized) normalized.make = sanitized;
  }

  if (filters.model) {
    const sanitized = sanitizeTextFilter(filters.model);
    if (sanitized) normalized.model = sanitized;
  }

  if (filters.location) {
    const sanitized = sanitizeTextFilter(filters.location);
    if (sanitized) normalized.location = sanitized;
  }

  const yearRange = normalizeRange(filters.yearMin, filters.yearMax);
  normalized.yearMin = yearRange.min;
  normalized.yearMax = yearRange.max;

  const mileageRange = normalizeRange(filters.mileageMin, filters.mileageMax);
  normalized.mileageMin = mileageRange.min;
  normalized.mileageMax = mileageRange.max;

  const msrpRange = normalizeRange(filters.msrpMin, filters.msrpMax);
  normalized.msrpMin = msrpRange.min;
  normalized.msrpMax = msrpRange.max;

  const receivedDateRange = normalizeDateRange(
    filters.receivedDateFrom,
    filters.receivedDateTo,
  );
  normalized.receivedDateFrom = receivedDateRange.from;
  normalized.receivedDateTo = receivedDateRange.to;

  normalized.sort =
    filters.sort && VEHICLE_SORT_FIELDS.includes(filters.sort)
      ? filters.sort
      : "received_date";

  normalized.direction = filters.direction === "asc" ? "asc" : "desc";

  normalized.page =
    filters.page != null && Number.isFinite(filters.page) && filters.page >= 1
      ? Math.floor(filters.page)
      : 1;

  normalized.pageSize = VEHICLE_LIST_PAGE_SIZE;

  return normalized;
}

/**
 * PostgREST's error code for a `.range()` offset that starts beyond the
 * actual number of matching rows (an out-of-range page — e.g. a stale
 * bookmark, or a filter change that shrank the result set). PostgREST
 * rejects the request outright rather than returning an empty page.
 */
const RANGE_NOT_SATISFIABLE_CODE = "PGRST103";

/**
 * Retries a repository call exactly once when it fails. Immediately after
 * login, the very first request on a page can race the session cookie
 * still propagating (or a plain cold-start blip) and fail transiently —
 * the same request reliably succeeds a moment later, which is exactly what
 * a manual refresh does today. One immediate retry smooths over that race
 * without masking a real, repeatable failure (which still surfaces after
 * the retry also fails).
 */
async function withOneRetry<T>(
  run: () => Promise<T>,
  shouldRetry: (result: T) => boolean,
): Promise<T> {
  const first = await run();
  return shouldRetry(first) ? run() : first;
}

/**
 * Lists vehicles for the dashboard table. Unrecognized filter values (which
 * can arrive via editable URL search params) are ignored rather than
 * treated as errors.
 *
 * A requested `page` past the end of the result set is recovered rather
 * than surfaced as a failure: page 1 is always a valid offset, so it's used
 * to learn the real count, and — when there's more than one page — a
 * follow-up fetch lands on the actual last page instead of silently
 * substituting page 1.
 */
export async function listVehicles(
  filters: VehicleListFilters,
): Promise<VehicleListResult> {
  const normalized = normalizeFilters(filters);
  let { data, error, count } = await withOneRetry(
    () => listVehiclesFromRepo(normalized),
    // Out-of-range pagination is a real, deterministic condition handled
    // explicitly below — retrying it verbatim would just fail again, so
    // only transient (non-pagination) errors get the extra attempt.
    (result) =>
      result.error != null && result.error.code !== RANGE_NOT_SATISFIABLE_CODE,
  );
  let page = normalized.page ?? 1;
  const pageSize = normalized.pageSize ?? VEHICLE_LIST_PAGE_SIZE;

  if (error?.code === RANGE_NOT_SATISFIABLE_CODE && page > 1) {
    const firstPage = await listVehiclesFromRepo({ ...normalized, page: 1 });
    const totalPages = Math.max(
      1,
      Math.ceil((firstPage.count ?? 0) / pageSize),
    );

    if (totalPages > 1) {
      ({ data, error, count } = await listVehiclesFromRepo({
        ...normalized,
        page: totalPages,
      }));
      page = totalPages;
    } else {
      ({ data, error, count } = firstPage);
      page = 1;
    }
  }

  if (error) {
    return {
      success: false,
      error: "Unable to load vehicles. Please try again.",
    };
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    success: true,
    vehicles: data ?? [],
    pagination: { page, pageSize, totalCount, totalPages },
  };
}

/**
 * Computes the dashboard KPI summary. `now` is injectable so "sold this
 * month" is deterministic in tests instead of depending on the system clock.
 */
export async function getDashboardSummary(
  now: Date = new Date(),
): Promise<DashboardSummaryResult> {
  const { data, error } = await withOneRetry(
    () => getVehicleAggregateRows(),
    (result) => result.error != null || !result.data,
  );

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

/**
 * Fetches a single vehicle for the detail page, distinguishing "not found"
 * from a real repository failure.
 */
export async function getVehicle(id: number): Promise<VehicleResult> {
  const { data, error } = await getVehicleById(id);

  if (error) {
    return {
      success: false,
      error: "Unable to load this vehicle. Please try again.",
    };
  }

  if (!data) {
    return { success: false, error: "Vehicle not found." };
  }

  return { success: true, vehicle: data };
}

/**
 * Creates a new vehicle after validating the payload. `status` defaults to
 * `IN_STOCK` when omitted.
 */
export async function createVehicle(
  input: VehicleInput,
): Promise<VehicleResult> {
  const normalizedInput: VehicleInput = {
    ...input,
    status: input.status ?? "IN_STOCK",
  };

  const validationError = validateVehicleInput(normalizedInput);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const { data, error } = await createVehicleInRepo(normalizedInput);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: friendlyUniqueViolationError(error) };
    }

    return {
      success: false,
      error: "Unable to create this vehicle. Please try again.",
    };
  }

  if (!data) {
    return {
      success: false,
      error: "Unable to create this vehicle. Please try again.",
    };
  }

  return { success: true, vehicle: data };
}

/**
 * Updates an existing vehicle after validating the payload, using the same
 * rules as `createVehicle`.
 */
export async function updateVehicle(
  id: number,
  input: VehicleInput,
): Promise<VehicleResult> {
  const normalizedInput: VehicleInput = {
    ...input,
    status: input.status ?? "IN_STOCK",
  };

  const validationError = validateVehicleInput(normalizedInput);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const { data, error } = await updateVehicleInRepo(id, normalizedInput);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: friendlyUniqueViolationError(error) };
    }

    return {
      success: false,
      error: "Unable to update this vehicle. Please try again.",
    };
  }

  if (!data) {
    return {
      success: false,
      error: "Unable to update this vehicle. Please try again.",
    };
  }

  return { success: true, vehicle: data };
}

/**
 * Deletes a vehicle by id.
 */
export async function deleteVehicle(id: number): Promise<VehicleDeleteResult> {
  const { error } = await deleteVehicleFromRepo(id);

  if (error) {
    return {
      success: false,
      error: "Unable to delete this vehicle. Please try again.",
    };
  }

  return { success: true };
}
