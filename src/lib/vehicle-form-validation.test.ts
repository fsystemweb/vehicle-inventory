import { describe, expect, it } from "vitest";
import {
  getVehicleFormErrors,
  isVehicleFormValid,
  type VehicleFormFieldValues,
} from "@/lib/vehicle-form-validation";

const now = new Date("2026-07-12T00:00:00Z");

const validValues: VehicleFormFieldValues = {
  vin: "4T1BF1FK5NU123001",
  stock_number: "STK1001",
  make: "Toyota",
  model: "Camry",
  year: "2026",
  mileage: "5",
  msrp: "32500",
  invoice_cost: "29800",
  condition: "NEW",
};

describe("getVehicleFormErrors", () => {
  it("returns no errors for a fully valid set of values", () => {
    expect(getVehicleFormErrors(validValues, now)).toEqual({});
  });

  it("flags each required field as invalid as soon as it is empty, before submission", () => {
    // This is the regression case for the "no real-time validation" bug:
    // as the user clears/edits a required field, the error must show up
    // immediately rather than only after the form is submitted.
    const errors = getVehicleFormErrors(
      { ...validValues, vin: "", make: "" },
      now,
    );

    expect(errors.vin).toBe("VIN is required.");
    expect(errors.make).toBe("Make is required.");
    expect(errors.model).toBeUndefined();
  });

  it("flags a VIN with the wrong length", () => {
    const errors = getVehicleFormErrors(
      { ...validValues, vin: "SHORTVIN" },
      now,
    );
    expect(errors.vin).toBe("VIN must be 17 characters.");
  });

  it("flags a year outside the allowed range", () => {
    const errors = getVehicleFormErrors({ ...validValues, year: "1900" }, now);
    expect(errors.year).toBe("Year must be between 1980 and 2026.");
  });

  it("flags a year greater than the current year", () => {
    // Regression test: the year field must never accept a value beyond the
    // current year (previously the max bound was erroneously current year + 2).
    const errors = getVehicleFormErrors({ ...validValues, year: "2027" }, now);
    expect(errors.year).toBe("Year must be between 1980 and 2026.");
  });

  it("does not flag a year equal to the current year", () => {
    const errors = getVehicleFormErrors({ ...validValues, year: "2026" }, now);
    expect(errors.year).toBeUndefined();
  });

  it("flags negative mileage", () => {
    const errors = getVehicleFormErrors({ ...validValues, mileage: "-1" }, now);
    expect(errors.mileage).toBe("Mileage cannot be negative.");
  });

  it("does not flag optional MSRP/invoice cost when left blank", () => {
    const errors = getVehicleFormErrors(
      { ...validValues, msrp: "", invoice_cost: "" },
      now,
    );
    expect(errors.msrp).toBeUndefined();
    expect(errors.invoice_cost).toBeUndefined();
  });

  it("flags a negative MSRP or invoice cost when provided", () => {
    const errors = getVehicleFormErrors(
      { ...validValues, msrp: "-1", invoice_cost: "-1" },
      now,
    );
    expect(errors.msrp).toBe("MSRP cannot be negative.");
    expect(errors.invoice_cost).toBe("Invoice cost cannot be negative.");
  });

  it("flags a missing condition", () => {
    const errors = getVehicleFormErrors({ ...validValues, condition: "" }, now);
    expect(errors.condition).toBe(
      "Condition must be one of NEW, USED, or CPO.",
    );
  });
});

describe("isVehicleFormValid", () => {
  it("is true when every field passes validation", () => {
    expect(isVehicleFormValid(validValues, now)).toBe(true);
  });

  it("is false when any single field is invalid", () => {
    expect(isVehicleFormValid({ ...validValues, stock_number: "" }, now)).toBe(
      false,
    );
  });
});
