import type { Metadata } from "next";
import Link from "next/link";
import { DashboardSummaryCards } from "@/components/vehicles/DashboardSummaryCards";
import { VehicleFilterBar } from "@/components/vehicles/VehicleFilterBar";
import { VehicleTable } from "@/components/vehicles/VehicleTable";
import {
  getDashboardSummary,
  listVehicles,
} from "@/server/services/vehicle-service";
import {
  VEHICLE_CONDITIONS,
  VEHICLE_SORT_FIELDS,
  VEHICLE_STATUSES,
  type VehicleCondition,
  type VehicleListFilters,
  type VehicleSortField,
  type VehicleStatus,
} from "@/types/vehicle";

export const metadata: Metadata = {
  title: "Dashboard — Vehicle Inventory",
};

type DashboardPageProps = {
  searchParams: Promise<{
    status?: string;
    condition?: string;
    search?: string;
    sort?: string;
    direction?: string;
  }>;
};

function parseFilters(
  params: Awaited<DashboardPageProps["searchParams"]>,
): VehicleListFilters {
  const status = VEHICLE_STATUSES.includes(params.status as VehicleStatus)
    ? (params.status as VehicleStatus)
    : undefined;

  const condition = VEHICLE_CONDITIONS.includes(
    params.condition as VehicleCondition,
  )
    ? (params.condition as VehicleCondition)
    : undefined;

  const sort = VEHICLE_SORT_FIELDS.includes(params.sort as VehicleSortField)
    ? (params.sort as VehicleSortField)
    : "received_date";

  const direction = params.direction === "asc" ? "asc" : "desc";

  return { status, condition, search: params.search, sort, direction };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const [summaryResult, vehiclesResult] = await Promise.all([
    getDashboardSummary(),
    listVehicles(filters),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted">Vehicle inventory overview.</p>
        </div>
        <Link
          href="/dashboard/vehicles/new"
          className="rounded-md bg-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-dark"
        >
          Add Vehicle
        </Link>
      </div>

      {summaryResult.success ? (
        <DashboardSummaryCards summary={summaryResult.summary} />
      ) : (
        <p className="rounded-lg border border-line p-4 text-sm text-danger">
          {summaryResult.error}
        </p>
      )}

      <VehicleFilterBar />

      {vehiclesResult.success ? (
        <VehicleTable vehicles={vehiclesResult.vehicles} filters={filters} />
      ) : (
        <p className="rounded-lg border border-line p-4 text-sm text-danger">
          {vehiclesResult.error}
        </p>
      )}
    </div>
  );
}
