import { VEHICLE_CONDITIONS, type VehicleCondition } from "@/types/vehicle";

/**
 * Raw string values as they come out of controlled form inputs, before
 * they're parsed into a `VehicleInput` by the server action.
 *
 * This mirrors the required-field/format rules enforced server-side in
 * `validateVehicleInput` (src/server/services/vehicle-service.ts) so the
 * form can surface errors as the user types instead of only after a round
 * trip to the server. It is a client-side UX nicety only — the server
 * action/service remains the source of truth and re-validates independently,
 * since the form is not the only caller (see the `react-form` skill).
 */
export type VehicleFormFieldValues = {
  vin: string;
  stock_number: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  msrp: string;
  invoice_cost: string;
  condition: string;
};

export type VehicleFormFieldErrors = Partial<
  Record<keyof VehicleFormFieldValues, string>
>;

const VIN_LENGTH = 17;
const MIN_YEAR = 1980;

/**
 * Computes per-field validation errors for the fields that have required or
 * format rules. Fields with no entry in the returned object are valid.
 */
export function getVehicleFormErrors(
  values: VehicleFormFieldValues,
  now: Date = new Date(),
): VehicleFormFieldErrors {
  const errors: VehicleFormFieldErrors = {};

  const vin = values.vin.trim();
  if (!vin) {
    errors.vin = "VIN is required.";
  } else if (vin.length !== VIN_LENGTH) {
    errors.vin = "VIN must be 17 characters.";
  }

  if (!values.stock_number.trim()) {
    errors.stock_number = "Stock number is required.";
  }

  if (!values.make.trim()) {
    errors.make = "Make is required.";
  }

  if (!values.model.trim()) {
    errors.model = "Model is required.";
  }

  const maxYear = now.getUTCFullYear();
  const year = values.year.trim() === "" ? NaN : Number(values.year);
  if (Number.isNaN(year) || year < MIN_YEAR || year > maxYear) {
    errors.year = `Year must be between ${MIN_YEAR} and ${maxYear}.`;
  }

  const mileage = values.mileage.trim() === "" ? NaN : Number(values.mileage);
  if (Number.isNaN(mileage)) {
    errors.mileage = "Mileage is required.";
  } else if (mileage < 0) {
    errors.mileage = "Mileage cannot be negative.";
  }

  if (values.msrp.trim() !== "") {
    const msrp = Number(values.msrp);
    if (Number.isNaN(msrp) || msrp < 0) {
      errors.msrp = "MSRP cannot be negative.";
    }
  }

  if (values.invoice_cost.trim() !== "") {
    const invoiceCost = Number(values.invoice_cost);
    if (Number.isNaN(invoiceCost) || invoiceCost < 0) {
      errors.invoice_cost = "Invoice cost cannot be negative.";
    }
  }

  if (
    !values.condition ||
    !VEHICLE_CONDITIONS.includes(values.condition as VehicleCondition)
  ) {
    errors.condition = "Condition must be one of NEW, USED, or CPO.";
  }

  return errors;
}

/** Whether the fields covered by `getVehicleFormErrors` are all valid. */
export function isVehicleFormValid(
  values: VehicleFormFieldValues,
  now: Date = new Date(),
): boolean {
  return Object.keys(getVehicleFormErrors(values, now)).length === 0;
}
