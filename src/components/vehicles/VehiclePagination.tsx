import Link from "next/link";
import {
  VEHICLE_FILTER_PARAM_KEYS,
  type VehicleListFilters,
  type VehiclePaginationMeta,
} from "@/types/vehicle";

/**
 * Builds an href that preserves every active filter and the current sort,
 * only changing `page`. Mirrors `buildSortHref` in `VehicleTable` — omits
 * `page` entirely for page 1 so the URL stays clean when landing back at
 * the start of the list.
 */
function buildPageHref(filters: VehicleListFilters, page: number) {
  const params = new URLSearchParams();

  for (const key of VEHICLE_FILTER_PARAM_KEYS) {
    const value = filters[key];
    if (value != null && value !== "") {
      params.set(key, String(value));
    }
  }

  if (filters.sort) params.set("sort", filters.sort);
  if (filters.direction) params.set("direction", filters.direction);
  if (page > 1) params.set("page", String(page));

  return `?${params}`;
}

const NAV_LINK_CLASS =
  "rounded-md border border-line px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-violet hover:text-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet";
const NAV_DISABLED_CLASS =
  "rounded-md border border-line px-3 py-1.5 text-sm font-medium text-muted opacity-50";

export function VehiclePagination({
  filters,
  pagination,
}: {
  filters: VehicleListFilters;
  pagination: VehiclePaginationMeta;
}) {
  const { page, pageSize, totalCount, totalPages } = pagination;

  if (totalCount === 0) {
    return null;
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm">
      <p className="text-muted">
        Showing{" "}
        <span className="font-medium text-foreground">{rangeStart}</span>–
        <span className="font-medium text-foreground">{rangeEnd}</span> of{" "}
        <span className="font-medium text-foreground">{totalCount}</span>{" "}
        vehicles
      </p>

      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={buildPageHref(filters, page - 1)}
            className={NAV_LINK_CLASS}
            aria-label="Previous page"
          >
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={NAV_DISABLED_CLASS}>
            Previous
          </span>
        )}

        <span className="px-1 text-xs font-medium text-muted">
          Page {page} of {totalPages}
        </span>

        {hasNext ? (
          <Link
            href={buildPageHref(filters, page + 1)}
            className={NAV_LINK_CLASS}
            aria-label="Next page"
          >
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className={NAV_DISABLED_CLASS}>
            Next
          </span>
        )}
      </div>
    </div>
  );
}
