import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { updateVehicleAction } from "@/server/actions/vehicle-actions";
import { getVehicle } from "@/server/services/vehicle-service";

type EditVehiclePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Vehicle — Vehicle Inventory",
};

export default async function EditVehiclePage({
  params,
}: EditVehiclePageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id)) {
    notFound();
  }

  const result = await getVehicle(id);

  if (!result.success) {
    if (result.error === "Vehicle not found.") {
      notFound();
    }

    return (
      <p className="rounded-lg border border-line p-4 text-sm text-danger">
        {result.error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/dashboard/vehicles/${id}`}
          className="text-sm text-muted hover:text-violet"
        >
          ← Back to vehicle
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Edit Vehicle
        </h1>
        <p className="font-mono text-sm text-muted">
          Stock #{result.vehicle.stock_number} · VIN {result.vehicle.vin}
        </p>
      </div>

      <VehicleForm
        action={updateVehicleAction}
        defaultValues={result.vehicle}
        submitLabel="Save Changes"
      />
    </div>
  );
}
