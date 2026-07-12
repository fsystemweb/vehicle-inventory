import Link from "next/link";
import { ConditionBadge } from "@/components/vehicles/ConditionBadge";
import { StatusBadge } from "@/components/vehicles/StatusBadge";
import { Tooltip } from "@/components/ui/Tooltip";
import { formatCurrency, formatMileage } from "@/lib/format";
import {
  VEHICLE_FILTER_PARAM_KEYS,
  type Vehicle,
  type VehicleListFilters,
  type VehicleSortField,
} from "@/types/vehicle";

const SORTABLE_COLUMNS: {
  field: VehicleSortField;
  label: string;
  tooltip?: string;
}[] = [
  { field: "year", label: "Year" },
  { field: "make", label: "Make / Model" },
  { field: "mileage", label: "Mileage" },
  {
    field: "msrp",
    label: "MSRP",
    tooltip: "Manufacturer's Suggested Retail Price",
  },
  { field: "received_date", label: "Received" },
];

function buildSortHref(filters: VehicleListFilters, field: VehicleSortField) {
  const params = new URLSearchParams();

  for (const key of VEHICLE_FILTER_PARAM_KEYS) {
    const value = filters[key];
    if (value != null && value !== "") {
      params.set(key, String(value));
    }
  }

  params.set("sort", field);
  const nextDirection =
    filters.sort === field && filters.direction === "asc" ? "desc" : "asc";
  params.set("direction", nextDirection);

  return `?${params}`;
}

function sortIndicator(filters: VehicleListFilters, field: VehicleSortField) {
  if (filters.sort !== field) return null;
  return filters.direction === "asc" ? " ▲" : " ▼";
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />
    </svg>
  );
}

export function VehicleTable({
  vehicles,
  filters,
}: {
  vehicles: Vehicle[];
  filters: VehicleListFilters;
}) {
  if (vehicles.length === 0) {
    return (
      <p className="rounded-lg border border-line p-8 text-center text-sm text-muted">
        No vehicles match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
            <th className="px-4 py-3 font-semibold">Stock #</th>
            <th className="px-4 py-3 font-semibold">VIN</th>
            {SORTABLE_COLUMNS.map((column) => (
              <th key={column.field} className="px-4 py-3 font-semibold">
                <span className="inline-flex items-center gap-1">
                  <Link
                    href={buildSortHref(filters, column.field)}
                    className="hover:text-violet"
                  >
                    {column.label}
                    {sortIndicator(filters, column.field)}
                  </Link>
                  {column.tooltip ? <Tooltip label={column.tooltip} /> : null}
                </span>
              </th>
            ))}
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Condition</th>
            <th className="px-4 py-3 font-semibold">Location</th>
            <th className="px-4 py-3 font-semibold">
              <span className="sr-only">View details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className="group relative border-b border-line transition-colors last:border-0 hover:bg-mist"
            >
              <td className="px-4 py-3 font-mono text-xs">
                <Link
                  href={`/dashboard/vehicles/${vehicle.id}`}
                  className="font-semibold text-violet after:absolute after:inset-0 hover:underline"
                >
                  {vehicle.stock_number}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted">
                {vehicle.vin}
              </td>
              <td className="px-4 py-3 text-foreground">{vehicle.year}</td>
              <td className="px-4 py-3 text-foreground">
                {vehicle.make} {vehicle.model}
                {vehicle.trim ? ` ${vehicle.trim}` : ""}
              </td>
              <td className="px-4 py-3 text-foreground">
                {formatMileage(vehicle.mileage)}
              </td>
              <td className="px-4 py-3 text-foreground">
                {vehicle.msrp != null ? formatCurrency(vehicle.msrp) : "—"}
              </td>
              <td className="px-4 py-3 text-foreground">
                {vehicle.received_date ?? "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={vehicle.status} />
              </td>
              <td className="px-4 py-3">
                <ConditionBadge condition={vehicle.condition} />
              </td>
              <td className="px-4 py-3 text-muted">
                {vehicle.location ?? "—"}
              </td>
              <td className="px-4 py-3 text-right text-foreground transition-colors group-hover:text-violet">
                <ChevronRightIcon />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
