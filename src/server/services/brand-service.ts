import { listBrands } from "@/server/repositories/brand-repository";
import type { Brand } from "@/types/brand";

export type BrandListResult =
  { success: true; brands: Brand[] } | { success: false; error: string };

/**
 * Lists every known brand, used to populate the "Make" autocomplete
 * suggestions on the vehicle add/edit forms. This is a suggestion source
 * only — it never constrains what a caller can submit as a vehicle's make.
 */
export async function listBrandNames(): Promise<BrandListResult> {
  const { data, error } = await listBrands();

  if (error) {
    return { success: false, error: "Failed to load brands." };
  }

  return { success: true, brands: data ?? [] };
}
