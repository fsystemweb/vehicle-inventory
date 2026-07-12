import type { Metadata } from "next";
import Link from "next/link";
import { DashboardSummaryCards } from "@/components/vehicles/DashboardSummaryCards";
import { VehicleFilterStack } from "@/components/vehicles/VehicleFilterStack";
import { VehiclePagination } from "@/components/vehicles/VehiclePagination";
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
    vin?: string;
    stockNumber?: string;
    make?: string;
    model?: string;
    location?: string;
    yearMin?: string;
    yearMax?: string;
    mileageMin?: string;
    mileageMax?: string;
    msrpMin?: string;
    msrpMax?: string;
    receivedDateFrom?: string;
    receivedDateTo?: string;
    sort?: string;
    direction?: string;
    page?: string;
  }>;
};

/**
 * Parses a query-param string into a number, returning `undefined` when the
 * param is missing or doesn't parse cleanly — raw search params can't be
 * trusted, so a non-numeric value is dropped rather than forwarded as NaN.
 */
function parseNumberParam(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? undefined : parsed;
}

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

  return {
    status,
    condition,
    search: params.search,
    vin: params.vin,
    stockNumber: params.stockNumber,
    make: params.make,
    model: params.model,
    location: params.location,
    yearMin: parseNumberParam(params.yearMin),
    yearMax: parseNumberParam(params.yearMax),
    mileageMin: parseNumberParam(params.mileageMin),
    mileageMax: parseNumberParam(params.mileageMax),
    msrpMin: parseNumberParam(params.msrpMin),
    msrpMax: parseNumberParam(params.msrpMax),
    receivedDateFrom: params.receivedDateFrom,
    receivedDateTo: params.receivedDateTo,
    sort,
    direction,
    page: parseNumberParam(params.page),
  };
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

      <VehicleFilterStack />

      {vehiclesResult.success ? (
        <>
          <VehicleTable vehicles={vehiclesResult.vehicles} filters={filters} />
          <VehiclePagination
            filters={filters}
            pagination={vehiclesResult.pagination}
          />
        </>
      ) : (
        <p className="rounded-lg border border-line p-4 text-sm text-danger">
          {vehiclesResult.error}
        </p>
      )}
    </div>
  );
}
