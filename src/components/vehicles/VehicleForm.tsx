"use client";

import { useActionState } from "react";
import { CONDITION_LABEL } from "@/components/vehicles/ConditionBadge";
import { STATUS_LABEL } from "@/components/vehicles/StatusBadge";
import type { VehicleActionState } from "@/server/actions/vehicle-actions";
import {
  VEHICLE_CONDITIONS,
  VEHICLE_STATUSES,
  type Vehicle,
} from "@/types/vehicle";

type VehicleFormAction = (
  prevState: VehicleActionState,
  formData: FormData,
) => Promise<VehicleActionState>;

const initialState: VehicleActionState = { error: null };

const inputClass =
  "rounded-md border border-line px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet";

const labelClass = "text-sm font-medium text-foreground";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function VehicleForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: VehicleFormAction;
  defaultValues?: Vehicle;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {defaultValues && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="VIN" htmlFor="vin">
          <input
            id="vin"
            name="vin"
            type="text"
            maxLength={17}
            required
            defaultValue={defaultValues?.vin}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field label="Stock #" htmlFor="stock_number">
          <input
            id="stock_number"
            name="stock_number"
            type="text"
            required
            defaultValue={defaultValues?.stock_number}
            className={inputClass}
          />
        </Field>

        <Field label="Year" htmlFor="year">
          <input
            id="year"
            name="year"
            type="number"
            required
            defaultValue={defaultValues?.year}
            className={inputClass}
          />
        </Field>

        <Field label="Make" htmlFor="make">
          <input
            id="make"
            name="make"
            type="text"
            required
            defaultValue={defaultValues?.make}
            className={inputClass}
          />
        </Field>

        <Field label="Model" htmlFor="model">
          <input
            id="model"
            name="model"
            type="text"
            required
            defaultValue={defaultValues?.model}
            className={inputClass}
          />
        </Field>

        <Field label="Trim" htmlFor="trim">
          <input
            id="trim"
            name="trim"
            type="text"
            defaultValue={defaultValues?.trim ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Exterior color" htmlFor="color">
          <input
            id="color"
            name="color"
            type="text"
            defaultValue={defaultValues?.color ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Interior color" htmlFor="interior_color">
          <input
            id="interior_color"
            name="interior_color"
            type="text"
            defaultValue={defaultValues?.interior_color ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Mileage" htmlFor="mileage">
          <input
            id="mileage"
            name="mileage"
            type="number"
            min={0}
            required
            defaultValue={defaultValues?.mileage}
            className={inputClass}
          />
        </Field>

        <Field label="MSRP" htmlFor="msrp">
          <input
            id="msrp"
            name="msrp"
            type="number"
            min={0}
            step="0.01"
            defaultValue={defaultValues?.msrp ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Invoice cost" htmlFor="invoice_cost">
          <input
            id="invoice_cost"
            name="invoice_cost"
            type="number"
            min={0}
            step="0.01"
            defaultValue={defaultValues?.invoice_cost ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Status" htmlFor="status">
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "IN_STOCK"}
            className={inputClass}
          >
            {VEHICLE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Condition" htmlFor="condition">
          <select
            id="condition"
            name="condition"
            required
            defaultValue={defaultValues?.condition ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select condition…
            </option>
            {VEHICLE_CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {CONDITION_LABEL[condition]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Location" htmlFor="location">
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={defaultValues?.location ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Received date" htmlFor="received_date">
          <input
            id="received_date"
            name="received_date"
            type="date"
            defaultValue={defaultValues?.received_date ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Sold date" htmlFor="sold_date">
          <input
            id="sold_date"
            name="sold_date"
            type="date"
            defaultValue={defaultValues?.sold_date ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={defaultValues?.notes ?? ""}
          className={inputClass}
        />
      </Field>

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
