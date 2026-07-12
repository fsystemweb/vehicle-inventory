"use client";

import { useActionState, useMemo, useState } from "react";
import { CONDITION_LABEL } from "@/components/vehicles/ConditionBadge";
import { STATUS_LABEL } from "@/components/vehicles/StatusBadge";
import {
  getVehicleFormErrors,
  type VehicleFormFieldErrors,
  type VehicleFormFieldValues,
} from "@/lib/vehicle-form-validation";
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
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
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

  // Real-time validation for the fields with required/format rules (mirrors
  // `validateVehicleInput` in server/services/vehicle-service.ts — a UX
  // nicety only; the server action re-validates independently). Tracked
  // separately from the uncontrolled fields below so the submit button can
  // be gated on validity instead of only surfacing errors after submit.
  const [validatedValues, setValidatedValues] =
    useState<VehicleFormFieldValues>({
      vin: defaultValues?.vin ?? "",
      stock_number: defaultValues?.stock_number ?? "",
      make: defaultValues?.make ?? "",
      model: defaultValues?.model ?? "",
      year: defaultValues?.year != null ? String(defaultValues.year) : "",
      mileage:
        defaultValues?.mileage != null ? String(defaultValues.mileage) : "",
      msrp: defaultValues?.msrp != null ? String(defaultValues.msrp) : "",
      invoice_cost:
        defaultValues?.invoice_cost != null
          ? String(defaultValues.invoice_cost)
          : "",
      condition: defaultValues?.condition ?? "",
    });
  const [touched, setTouched] = useState<
    Partial<Record<keyof VehicleFormFieldValues, boolean>>
  >({});

  const errors: VehicleFormFieldErrors = useMemo(
    () => getVehicleFormErrors(validatedValues),
    [validatedValues],
  );
  const isFormValid = Object.keys(errors).length === 0;

  function updateField(field: keyof VehicleFormFieldValues) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValidatedValues((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };
  }

  function markTouched(field: keyof VehicleFormFieldValues) {
    return () => setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function fieldError(field: keyof VehicleFormFieldValues) {
    return touched[field] ? errors[field] : undefined;
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {defaultValues && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="VIN" htmlFor="vin" error={fieldError("vin")}>
          <input
            id="vin"
            name="vin"
            type="text"
            maxLength={17}
            required
            value={validatedValues.vin}
            onChange={updateField("vin")}
            onBlur={markTouched("vin")}
            aria-invalid={Boolean(fieldError("vin"))}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <Field
          label="Stock #"
          htmlFor="stock_number"
          error={fieldError("stock_number")}
        >
          <input
            id="stock_number"
            name="stock_number"
            type="text"
            required
            value={validatedValues.stock_number}
            onChange={updateField("stock_number")}
            onBlur={markTouched("stock_number")}
            aria-invalid={Boolean(fieldError("stock_number"))}
            className={inputClass}
          />
        </Field>

        <Field label="Year" htmlFor="year" error={fieldError("year")}>
          <input
            id="year"
            name="year"
            type="number"
            required
            value={validatedValues.year}
            onChange={updateField("year")}
            onBlur={markTouched("year")}
            aria-invalid={Boolean(fieldError("year"))}
            className={inputClass}
          />
        </Field>

        <Field label="Make" htmlFor="make" error={fieldError("make")}>
          <input
            id="make"
            name="make"
            type="text"
            required
            value={validatedValues.make}
            onChange={updateField("make")}
            onBlur={markTouched("make")}
            aria-invalid={Boolean(fieldError("make"))}
            className={inputClass}
          />
        </Field>

        <Field label="Model" htmlFor="model" error={fieldError("model")}>
          <input
            id="model"
            name="model"
            type="text"
            required
            value={validatedValues.model}
            onChange={updateField("model")}
            onBlur={markTouched("model")}
            aria-invalid={Boolean(fieldError("model"))}
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

        <Field label="Mileage" htmlFor="mileage" error={fieldError("mileage")}>
          <input
            id="mileage"
            name="mileage"
            type="number"
            min={0}
            required
            value={validatedValues.mileage}
            onChange={updateField("mileage")}
            onBlur={markTouched("mileage")}
            aria-invalid={Boolean(fieldError("mileage"))}
            className={inputClass}
          />
        </Field>

        <Field label="MSRP" htmlFor="msrp" error={fieldError("msrp")}>
          <input
            id="msrp"
            name="msrp"
            type="number"
            min={0}
            step="0.01"
            value={validatedValues.msrp}
            onChange={updateField("msrp")}
            onBlur={markTouched("msrp")}
            aria-invalid={Boolean(fieldError("msrp"))}
            className={inputClass}
          />
        </Field>

        <Field
          label="Invoice cost"
          htmlFor="invoice_cost"
          error={fieldError("invoice_cost")}
        >
          <input
            id="invoice_cost"
            name="invoice_cost"
            type="number"
            min={0}
            step="0.01"
            value={validatedValues.invoice_cost}
            onChange={updateField("invoice_cost")}
            onBlur={markTouched("invoice_cost")}
            aria-invalid={Boolean(fieldError("invoice_cost"))}
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

        <Field
          label="Condition"
          htmlFor="condition"
          error={fieldError("condition")}
        >
          <select
            id="condition"
            name="condition"
            required
            value={validatedValues.condition}
            onChange={updateField("condition")}
            onBlur={markTouched("condition")}
            aria-invalid={Boolean(fieldError("condition"))}
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
          disabled={isPending || !isFormValid}
          aria-disabled={isPending || !isFormValid}
          className="rounded-md bg-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
