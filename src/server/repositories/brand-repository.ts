import { createClient } from "@/lib/supabase/server";
import type { RepositoryResult } from "@/server/repositories/vehicle-repository";
import type { Brand } from "@/types/brand";

/**
 * Lists every brand, alphabetically by name. `brands` is a pure suggestion
 * source for the "Make" autocomplete — this is the only layer allowed to
 * query it directly.
 */
export async function listBrands(): Promise<RepositoryResult<Brand[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  return { data, error };
}
