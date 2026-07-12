"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CONDITION_LABEL } from "@/components/vehicles/ConditionBadge";
import { STATUS_LABEL } from "@/components/vehicles/StatusBadge";
import { VEHICLE_CONDITIONS, VEHICLE_STATUSES } from "@/types/vehicle";

const SEARCH_DEBOUNCE_MS = 300;

export function VehicleFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(params.size > 0 ? `${pathname}?${params}` : pathname);
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      updateParam("search", search);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // Only re-run when the debounced value itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search VIN, stock #, make, model…"
        aria-label="Search vehicles"
        className="w-64 rounded-md border border-line px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet"
      />
      <select
        value={searchParams.get("status") ?? ""}
        onChange={(event) => updateParam("status", event.target.value)}
        aria-label="Filter by status"
        className="rounded-md border border-line px-3 py-1.5 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet"
      >
        <option value="">All statuses</option>
        {VEHICLE_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABEL[status]}
          </option>
        ))}
      </select>
      <select
        value={searchParams.get("condition") ?? ""}
        onChange={(event) => updateParam("condition", event.target.value)}
        aria-label="Filter by condition"
        className="rounded-md border border-line px-3 py-1.5 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet"
      >
        <option value="">All conditions</option>
        {VEHICLE_CONDITIONS.map((condition) => (
          <option key={condition} value={condition}>
            {CONDITION_LABEL[condition]}
          </option>
        ))}
      </select>
    </div>
  );
}
