import { createClient } from "@/lib/supabase/server";
import type { Vehicle, VehicleListFilters } from "@/types/vehicle";
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
