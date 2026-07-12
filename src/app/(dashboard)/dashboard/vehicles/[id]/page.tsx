import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConditionBadge } from "@/components/vehicles/ConditionBadge";
import { DeleteVehicleButton } from "@/components/vehicles/DeleteVehicleButton";
import { StatusBadge } from "@/components/vehicles/StatusBadge";
import { formatCurrency, formatMileage } from "@/lib/format";
import { getVehicle } from "@/server/services/vehicle-service";

type VehicleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: VehicleDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Vehicle ${id} — Vehicle Inventory` };
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className="text-sm text-foreground">{value ?? "—"}</p>
    </div>
  );
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
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

  const vehicle = result.vehicle;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted hover:text-violet"
        >
          ← Back to dashboard
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
              {vehicle.trim ? ` ${vehicle.trim}` : ""}
            </h1>
            <p className="font-mono text-sm text-muted">
              Stock #{vehicle.stock_number} · VIN {vehicle.vin}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={vehicle.status} />
            <ConditionBadge condition={vehicle.condition} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 rounded-lg border border-line p-6 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Exterior color" value={vehicle.color} />
        <DetailField label="Interior color" value={vehicle.interior_color} />
        <DetailField label="Mileage" value={formatMileage(vehicle.mileage)} />
        <DetailField
          label="MSRP"
          value={vehicle.msrp != null ? formatCurrency(vehicle.msrp) : null}
        />
        <DetailField
          label="Invoice cost"
          value={
            vehicle.invoice_cost != null
              ? formatCurrency(vehicle.invoice_cost)
              : null
          }
        />
        <DetailField label="Location" value={vehicle.location} />
        <DetailField label="Received date" value={vehicle.received_date} />
        <DetailField label="Sold date" value={vehicle.sold_date} />
      </div>

      {vehicle.notes && (
        <div className="rounded-lg border border-line p-6">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            Notes
          </p>
          <p className="mt-2 text-sm whitespace-pre-wrap text-foreground">
            {vehicle.notes}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/vehicles/${vehicle.id}/edit`}
          className="rounded-md bg-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-dark"
        >
          Edit
        </Link>
        <DeleteVehicleButton id={vehicle.id} />
      </div>
    </div>
  );
}
