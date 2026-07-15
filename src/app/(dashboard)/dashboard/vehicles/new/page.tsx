import type { Metadata } from "next";
import Link from "next/link";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { createVehicleAction } from "@/server/actions/vehicle-actions";
import { listBrandNames } from "@/server/services/brand-service";

export const metadata: Metadata = {
  title: "Add Vehicle — Vehicle Inventory",
};

export default async function NewVehiclePage() {
  const brandsResult = await listBrandNames();
  const brands = brandsResult.success
    ? brandsResult.brands.map((b) => b.name)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-violet"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Add Vehicle
        </h1>
        <p className="text-sm text-muted">
          Add a new vehicle to the inventory.
        </p>
      </div>

      <VehicleForm
        action={createVehicleAction}
        submitLabel="Add Vehicle"
        brands={brands}
      />
    </div>
  );
}
