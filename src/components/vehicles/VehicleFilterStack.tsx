"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CONDITION_LABEL } from "@/components/vehicles/ConditionBadge";
import { STATUS_LABEL } from "@/components/vehicles/StatusBadge";
import { formatCurrency, formatMileage } from "@/lib/format";
import {
  VEHICLE_CONDITIONS,
  VEHICLE_FILTER_PARAM_KEYS,
  VEHICLE_STATUSES,
  type VehicleCondition,
  type VehicleStatus,
} from "@/types/vehicle";

const DEBOUNCE_MS = 300;

const TEXT_FIELDS = [
  { key: "search", label: "Search", ariaLabel: "Search vehicles" },
  { key: "vin", label: "VIN", ariaLabel: "Filter by VIN" },
  {
    key: "stockNumber",
    label: "Stock #",
    ariaLabel: "Filter by stock number",
  },
  { key: "make", label: "Make", ariaLabel: "Filter by make" },
  { key: "model", label: "Model", ariaLabel: "Filter by model" },
  { key: "location", label: "Location", ariaLabel: "Filter by location" },
] as const;

const NUMBER_RANGE_FIELDS = [
  { label: "Year", minKey: "yearMin", maxKey: "yearMax" },
  { label: "Mileage", minKey: "mileageMin", maxKey: "mileageMax" },
  { label: "MSRP", minKey: "msrpMin", maxKey: "msrpMax" },
] as const;

const DATE_RANGE_FIELD = {
  label: "Received Date",
  fromKey: "receivedDateFrom",
  toKey: "receivedDateTo",
} as const;

const DEBOUNCED_KEYS = [
  ...TEXT_FIELDS.map((field) => field.key),
  ...NUMBER_RANGE_FIELDS.flatMap((field) => [field.minKey, field.maxKey]),
  DATE_RANGE_FIELD.fromKey,
  DATE_RANGE_FIELD.toKey,
] as const;

type DebouncedKey = (typeof DEBOUNCED_KEYS)[number];

type Draft = Record<DebouncedKey, string>;

const FILTER_CHIP_LABEL: Record<string, string> = {
  status: "Status",
  condition: "Condition",
  search: "Search",
  vin: "VIN",
  stockNumber: "Stock #",
  make: "Make",
  model: "Model",
  location: "Location",
  yearMin: "Year (min)",
  yearMax: "Year (max)",
  mileageMin: "Mileage (min)",
  mileageMax: "Mileage (max)",
  msrpMin: "MSRP (min)",
  msrpMax: "MSRP (max)",
  receivedDateFrom: "Received (from)",
  receivedDateTo: "Received (to)",
};

function formatChipValue(key: string, rawValue: string): string {
  if (key === "status") {
    return STATUS_LABEL[rawValue as VehicleStatus] ?? rawValue;
  }

  if (key === "condition") {
    return CONDITION_LABEL[rawValue as VehicleCondition] ?? rawValue;
  }

  if (key === "mileageMin" || key === "mileageMax") {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? formatMileage(parsed) : rawValue;
  }

  if (key === "msrpMin" || key === "msrpMax") {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? formatCurrency(parsed) : rawValue;
  }

  return rawValue;
}

function isInvertedRange(min: string, max: string): boolean {
  if (!min || !max) return false;
  const minNum = Number(min);
  const maxNum = Number(max);
  if (Number.isNaN(minNum) || Number.isNaN(maxNum)) return false;
  return minNum > maxNum;
}

function isInvertedDateRange(from: string, to: string): boolean {
  if (!from || !to) return false;
  return from > to;
}

function initDraft(searchParams: URLSearchParams): Draft {
  return Object.fromEntries(
    DEBOUNCED_KEYS.map((key) => [key, searchParams.get(key) ?? ""]),
  ) as Draft;
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3"
    >
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="inline-flex size-4 items-center justify-center rounded-full text-muted hover:bg-mist hover:text-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet"
      >
        <CloseIcon />
      </button>
    </span>
  );
}

const FIELD_CLASS =
  "w-full rounded-md border border-line px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet";
const LABEL_CLASS = "mb-1 block text-xs font-medium text-muted";

export function VehicleFilterStack() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [draft, setDraft] = useState<Draft>(() => initDraft(searchParams));
  const draftRef = useRef(draft);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function navigate(params: URLSearchParams) {
    router.replace(params.size > 0 ? `${pathname}?${params}` : pathname);
  }

  function commitDraft(nextDraft: Draft) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of DEBOUNCED_KEYS) {
      const value = nextDraft[key];
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    // A filter change can put the current page out of range, so drop it
    // and let the list land back on page 1 rather than stranding the user.
    params.delete("page");
    navigate(params);
  }

  function handleDebouncedChange(key: DebouncedKey, value: string) {
    const nextDraft = { ...draftRef.current, [key]: value };
    draftRef.current = nextDraft;
    setDraft(nextDraft);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commitDraft(nextDraft), DEBOUNCE_MS);
  }

  function updateImmediateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Same rationale as commitDraft: a filter change can invalidate the
    // current page, so reset back to page 1.
    params.delete("page");
    navigate(params);
  }

  function removeFilter(key: string) {
    if (timerRef.current) clearTimeout(timerRef.current);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    navigate(params);

    if ((DEBOUNCED_KEYS as readonly string[]).includes(key)) {
      const nextDraft = { ...draftRef.current, [key]: "" };
      draftRef.current = nextDraft;
      setDraft(nextDraft);
    }
  }

  function clearAll() {
    if (timerRef.current) clearTimeout(timerRef.current);

    const params = new URLSearchParams(searchParams.toString());
    for (const key of VEHICLE_FILTER_PARAM_KEYS) {
      params.delete(key);
    }
    params.delete("page");
    navigate(params);

    const resetDraft = Object.fromEntries(
      DEBOUNCED_KEYS.map((key) => [key, ""]),
    ) as Draft;
    draftRef.current = resetDraft;
    setDraft(resetDraft);
  }

  const activeChips = VEHICLE_FILTER_PARAM_KEYS.map((key) => {
    const value = searchParams.get(key);
    if (!value) return null;
    return {
      key,
      label: `${FILTER_CHIP_LABEL[key] ?? key}: ${formatChipValue(key, value)}`,
    };
  }).filter((chip) => chip !== null);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-line bg-mist p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Filters</h2>
          <span className="rounded-full border border-line bg-white px-2 py-0.5 text-xs font-medium text-muted">
            {activeChips.length} filter{activeChips.length === 1 ? "" : "s"}{" "}
            applied
          </span>
        </div>
        <button
          type="button"
          onClick={clearAll}
          disabled={activeChips.length === 0}
          className="text-xs font-medium text-violet hover:underline disabled:pointer-events-none disabled:opacity-50"
        >
          Clear all
        </button>
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              onRemove={() => removeFilter(chip.key)}
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label htmlFor="filter-search" className={LABEL_CLASS}>
              Search
            </label>
            <input
              id="filter-search"
              type="search"
              value={draft.search}
              onChange={(event) =>
                handleDebouncedChange("search", event.target.value)
              }
              placeholder="Search VIN, stock #, make, model…"
              aria-label="Search vehicles"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="filter-status" className={LABEL_CLASS}>
              Status
            </label>
            <select
              id="filter-status"
              value={searchParams.get("status") ?? ""}
              onChange={(event) =>
                updateImmediateParam("status", event.target.value)
              }
              aria-label="Filter by status"
              className={FIELD_CLASS}
            >
              <option value="">All statuses</option>
              {VEHICLE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-condition" className={LABEL_CLASS}>
              Condition
            </label>
            <select
              id="filter-condition"
              value={searchParams.get("condition") ?? ""}
              onChange={(event) =>
                updateImmediateParam("condition", event.target.value)
              }
              aria-label="Filter by condition"
              className={FIELD_CLASS}
            >
              <option value="">All conditions</option>
              {VEHICLE_CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {CONDITION_LABEL[condition]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEXT_FIELDS.filter((field) => field.key !== "search").map(
            (field) => (
              <div key={field.key}>
                <label htmlFor={`filter-${field.key}`} className={LABEL_CLASS}>
                  {field.label}
                </label>
                <input
                  id={`filter-${field.key}`}
                  type="text"
                  value={draft[field.key]}
                  onChange={(event) =>
                    handleDebouncedChange(field.key, event.target.value)
                  }
                  placeholder={field.label}
                  aria-label={field.ariaLabel}
                  className={FIELD_CLASS}
                />
              </div>
            ),
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {NUMBER_RANGE_FIELDS.map((field) => {
            const inverted = isInvertedRange(
              draft[field.minKey],
              draft[field.maxKey],
            );
            return (
              <div key={field.label}>
                <label className={LABEL_CLASS}>{field.label}</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={draft[field.minKey]}
                    onChange={(event) =>
                      handleDebouncedChange(field.minKey, event.target.value)
                    }
                    placeholder="Min"
                    aria-label={`${field.label} minimum`}
                    className={FIELD_CLASS}
                  />
                  <span aria-hidden="true" className="text-muted">
                    –
                  </span>
                  <input
                    type="number"
                    value={draft[field.maxKey]}
                    onChange={(event) =>
                      handleDebouncedChange(field.maxKey, event.target.value)
                    }
                    placeholder="Max"
                    aria-label={`${field.label} maximum`}
                    className={FIELD_CLASS}
                  />
                </div>
                {inverted ? (
                  <p className="mt-1 text-xs text-danger">
                    Min must be less than or equal to max.
                  </p>
                ) : null}
              </div>
            );
          })}

          <div>
            <label className={LABEL_CLASS}>{DATE_RANGE_FIELD.label}</label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={draft[DATE_RANGE_FIELD.fromKey]}
                onChange={(event) =>
                  handleDebouncedChange(
                    DATE_RANGE_FIELD.fromKey,
                    event.target.value,
                  )
                }
                aria-label="Received date from"
                className={FIELD_CLASS}
              />
              <span aria-hidden="true" className="text-muted">
                –
              </span>
              <input
                type="date"
                value={draft[DATE_RANGE_FIELD.toKey]}
                onChange={(event) =>
                  handleDebouncedChange(
                    DATE_RANGE_FIELD.toKey,
                    event.target.value,
                  )
                }
                aria-label="Received date to"
                className={FIELD_CLASS}
              />
            </div>
            {isInvertedDateRange(
              draft[DATE_RANGE_FIELD.fromKey],
              draft[DATE_RANGE_FIELD.toKey],
            ) ? (
              <p className="mt-1 text-xs text-danger">
                From date must be on or before the to date.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
