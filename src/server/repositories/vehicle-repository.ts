import { createClient } from "@/lib/supabase/server";
import {
  VEHICLE_LIST_PAGE_SIZE,
  type Vehicle,
  type VehicleInput,
  type VehicleListFilters,
} from "@/types/vehicle";
import type { PostgrestError } from "@supabase/supabase-js";

export type RepositoryResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

/**
 * Same shape as `RepositoryResult`, plus the total row count matching the
 * filters (independent of pagination) so the service layer can compute
 * total pages.
 */
export type VehicleListRepositoryResult = RepositoryResult<Vehicle[]> & {
  count: number | null;
};

/**
 * Lists vehicles matching the given filters, paginated via `filters.page`/
 * `filters.pageSize` (both default when omitted, defensively — callers are
 * expected to normalize these first, same as `sort`/`direction`). This is
 * the only layer allowed to call the Supabase client directly.
 */
export async function listVehicles(
  filters: VehicleListFilters,
): Promise<VehicleListRepositoryResult> {
  const supabase = await createClient();

  let query = supabase.from("vehicles").select("*", { count: "exact" });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.condition) {
    query = query.eq("condition", filters.condition);
  }

  if (filters.search) {
    const term = filters.search;
    query = query.or(
      `vin.ilike.%${term}%,stock_number.ilike.%${term}%,make.ilike.%${term}%,model.ilike.%${term}%`,
    );
  }

  if (filters.vin) {
    query = query.ilike("vin", `%${filters.vin}%`);
  }

  if (filters.stockNumber) {
    query = query.ilike("stock_number", `%${filters.stockNumber}%`);
  }

  if (filters.make) {
    query = query.ilike("make", `%${filters.make}%`);
  }

  if (filters.model) {
    query = query.ilike("model", `%${filters.model}%`);
  }

  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  if (filters.yearMin != null) {
    query = query.gte("year", filters.yearMin);
  }

  if (filters.yearMax != null) {
    query = query.lte("year", filters.yearMax);
  }

  if (filters.mileageMin != null) {
    query = query.gte("mileage", filters.mileageMin);
  }

  if (filters.mileageMax != null) {
    query = query.lte("mileage", filters.mileageMax);
  }

  if (filters.msrpMin != null) {
    query = query.gte("msrp", filters.msrpMin);
  }

  if (filters.msrpMax != null) {
    query = query.lte("msrp", filters.msrpMax);
  }

  if (filters.receivedDateFrom) {
    query = query.gte("received_date", filters.receivedDateFrom);
  }

  if (filters.receivedDateTo) {
    query = query.lte("received_date", filters.receivedDateTo);
  }

  query = query.order(filters.sort ?? "received_date", {
    ascending: filters.direction === "asc",
  });

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? VEHICLE_LIST_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  return { data, error, count };
}

/**
 * Returns a lean projection of every vehicle, used only to compute dashboard
 * KPIs. Kept narrow so the payload stays small even as the table grows.
 */
export async function getVehicleAggregateRows(): Promise<
  RepositoryResult<Pick<Vehicle, "status" | "msrp" | "sold_date">[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("status, msrp, sold_date");

  return { data, error };
}

/**
 * Fetches a single vehicle by id. `data` is `null` (with no error) when no
 * row matches, so callers can distinguish "not found" from a real failure.
 */
export async function getVehicleById(
  id: number,
): Promise<RepositoryResult<Vehicle | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return { data, error };
}

/**
 * Inserts a new vehicle row.
 */
export async function createVehicle(
  input: VehicleInput,
): Promise<RepositoryResult<Vehicle>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .insert(input)
    .select()
    .single();

  return { data, error };
}

/**
 * Updates an existing vehicle row by id.
 */
export async function updateVehicle(
  id: number,
  input: Partial<VehicleInput>,
): Promise<RepositoryResult<Vehicle>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

/**
 * Deletes a vehicle by id.
 */
export async function deleteVehicle(
  id: number,
): Promise<RepositoryResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", id);

  return { data: null, error };
}
