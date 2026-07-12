import { createClient } from "@/lib/supabase/server";
import type {
  Vehicle,
  VehicleInput,
  VehicleListFilters,
} from "@/types/vehicle";
import type { PostgrestError } from "@supabase/supabase-js";

export type RepositoryResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

/**
 * Lists vehicles matching the given filters. This is the only layer allowed
 * to call the Supabase client directly.
 */
export async function listVehicles(
  filters: VehicleListFilters,
): Promise<RepositoryResult<Vehicle[]>> {
  const supabase = await createClient();

  let query = supabase.from("vehicles").select("*");

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

  query = query.order(filters.sort ?? "received_date", {
    ascending: filters.direction === "asc",
  });

  const { data, error } = await query;

  return { data, error };
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
