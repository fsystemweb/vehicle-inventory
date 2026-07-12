import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVehicle,
  deleteVehicle,
  getDashboardSummary,
  getVehicle,
  listVehicles,
  updateVehicle,
} from "@/server/services/vehicle-service";
import * as vehicleRepository from "@/server/repositories/vehicle-repository";
import type { Vehicle, VehicleInput } from "@/types/vehicle";

vi.mock("@/server/repositories/vehicle-repository");

const mockedRepo = vi.mocked(vehicleRepository);

beforeEach(() => {
  vi.resetAllMocks();
});

const vehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 1,
  vin: "4T1BF1FK5NU123001",
  stock_number: "STK1001",
  make: "Toyota",
  model: "Camry",
  year: 2026,
  trim: "XLE",
  color: "Blue",
  interior_color: "Black",
  mileage: 5,
  msrp: 32500,
  invoice_cost: 29800,
  status: "IN_STOCK",
  condition: "NEW",
  location: "Lot A-12",
  received_date: "2026-06-01",
  sold_date: null,
  notes: null,
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
  ...overrides,
});

describe("listVehicles", () => {
  it("returns vehicles from the repository on success", async () => {
    const vehicles = [vehicle()];
    mockedRepo.listVehicles.mockResolvedValue({ data: vehicles, error: null });

    const result = await listVehicles({});

    expect(result).toEqual({ success: true, vehicles });
  });

  it("ignores an unrecognized status filter", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({ status: "BOGUS" as never });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.not.objectContaining({ status: expect.anything() }),
    );
  });

  it("ignores an unrecognized condition filter", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({ condition: "BOGUS" as never });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.not.objectContaining({ condition: expect.anything() }),
    );
  });

  it("omits the search filter when the search term is empty or whitespace", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({ search: "   " });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.not.objectContaining({ search: expect.anything() }),
    );
  });

  it("sanitizes commas and wildcard characters out of the search term", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({ search: "toyota, 50%_off" });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.objectContaining({ search: "toyota 50\\%\\_off" }),
    );
  });

  it("defaults sort to received_date/desc when the sort field is invalid", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({ sort: "bogus" as never });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.objectContaining({ sort: "received_date", direction: "desc" }),
    );
  });

  it("returns a friendly error when the repository fails", async () => {
    mockedRepo.listVehicles.mockResolvedValue({
      data: null,
      error: { message: "connection error" } as never,
    });

    const result = await listVehicles({});

    expect(result).toEqual({
      success: false,
      error: "Unable to load vehicles. Please try again.",
    });
  });

  it("passes through sanitized single-column text filters", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({
      vin: " 1FTFW1E5%_",
      stockNumber: "STK_1001",
      make: "Toy%ota",
      model: "Camry",
      location: "Lot A",
    });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.objectContaining({
        vin: "1FTFW1E5\\%\\_",
        stockNumber: "STK\\_1001",
        make: "Toy\\%ota",
        model: "Camry",
        location: "Lot A",
      }),
    );
  });

  it("omits single-column text filters that are empty or whitespace", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({ vin: "   ", stockNumber: "" });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.not.objectContaining({
        vin: expect.anything(),
        stockNumber: expect.anything(),
      }),
    );
  });

  it("passes through year/mileage/msrp range filters", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({
      yearMin: 2020,
      yearMax: 2024,
      mileageMin: 0,
      mileageMax: 50000,
      msrpMin: 20000,
      msrpMax: 40000,
    });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.objectContaining({
        yearMin: 2020,
        yearMax: 2024,
        mileageMin: 0,
        mileageMax: 50000,
        msrpMin: 20000,
        msrpMax: 40000,
      }),
    );
  });

  it("drops a numeric range filter entirely when min is greater than max", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({ yearMin: 2024, yearMax: 2020 });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.not.objectContaining({
        yearMin: expect.anything(),
        yearMax: expect.anything(),
      }),
    );
  });

  it("ignores a non-finite numeric range value", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({ mileageMin: Number.NaN, mileageMax: 50000 });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.objectContaining({ mileageMax: 50000 }),
    );
    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.not.objectContaining({ mileageMin: expect.anything() }),
    );
  });

  it("passes through a valid received-date range", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({
      receivedDateFrom: "2026-01-01",
      receivedDateTo: "2026-06-30",
    });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.objectContaining({
        receivedDateFrom: "2026-01-01",
        receivedDateTo: "2026-06-30",
      }),
    );
  });

  it("drops a received-date range when from is after to", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({
      receivedDateFrom: "2026-06-30",
      receivedDateTo: "2026-01-01",
    });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.not.objectContaining({
        receivedDateFrom: expect.anything(),
        receivedDateTo: expect.anything(),
      }),
    );
  });

  it("drops a malformed received-date value", async () => {
    mockedRepo.listVehicles.mockResolvedValue({ data: [], error: null });

    await listVehicles({ receivedDateFrom: "not-a-date" });

    expect(mockedRepo.listVehicles).toHaveBeenCalledWith(
      expect.not.objectContaining({ receivedDateFrom: expect.anything() }),
    );
  });
});

describe("getDashboardSummary", () => {
  it("computes per-status counts and total in-stock value", async () => {
    mockedRepo.getVehicleAggregateRows.mockResolvedValue({
      data: [
        { status: "IN_STOCK", msrp: 30000, sold_date: null },
        { status: "IN_STOCK", msrp: null, sold_date: null },
        { status: "PENDING", msrp: 20000, sold_date: null },
        { status: "IN_TRANSIT", msrp: 40000, sold_date: null },
        { status: "SOLD", msrp: 25000, sold_date: "2026-07-05" },
        { status: "SOLD", msrp: 22000, sold_date: "2026-06-15" },
      ],
      error: null,
    });

    const result = await getDashboardSummary(new Date("2026-07-12T00:00:00Z"));

    expect(result).toEqual({
      success: true,
      summary: {
        inStockCount: 2,
        pendingCount: 1,
        inTransitCount: 1,
        soldThisMonthCount: 1,
        totalInStockValue: 30000,
      },
    });
  });

  it("treats a null msrp as 0 when summing in-stock value", async () => {
    mockedRepo.getVehicleAggregateRows.mockResolvedValue({
      data: [{ status: "IN_STOCK", msrp: null, sold_date: null }],
      error: null,
    });

    const result = await getDashboardSummary(new Date("2026-07-12T00:00:00Z"));

    expect(result).toEqual({
      success: true,
      summary: {
        inStockCount: 1,
        pendingCount: 0,
        inTransitCount: 0,
        soldThisMonthCount: 0,
        totalInStockValue: 0,
      },
    });
  });

  it("does not depend on the real system clock for sold-this-month", async () => {
    mockedRepo.getVehicleAggregateRows.mockResolvedValue({
      data: [{ status: "SOLD", msrp: 25000, sold_date: "2026-01-15" }],
      error: null,
    });

    const result = await getDashboardSummary(new Date("2026-07-12T00:00:00Z"));

    expect(result.success && result.summary.soldThisMonthCount).toBe(0);
  });

  it("returns a friendly error when the repository fails", async () => {
    mockedRepo.getVehicleAggregateRows.mockResolvedValue({
      data: null,
      error: { message: "connection error" } as never,
    });

    const result = await getDashboardSummary();

    expect(result).toEqual({
      success: false,
      error: "Unable to load dashboard summary. Please try again.",
    });
  });
});

const validInput = (overrides: Partial<VehicleInput> = {}): VehicleInput => ({
  vin: "4T1BF1FK5NU123001",
  stock_number: "STK1001",
  make: "Toyota",
  model: "Camry",
  year: 2026,
  trim: "XLE",
  color: "Blue",
  interior_color: "Black",
  mileage: 5,
  msrp: 32500,
  invoice_cost: 29800,
  status: "IN_STOCK",
  condition: "NEW",
  location: "Lot A-12",
  received_date: "2026-06-01",
  sold_date: null,
  notes: null,
  ...overrides,
});

describe("getVehicle", () => {
  it("returns the vehicle from the repository on success", async () => {
    const found = vehicle();
    mockedRepo.getVehicleById.mockResolvedValue({ data: found, error: null });

    const result = await getVehicle(1);

    expect(result).toEqual({ success: true, vehicle: found });
  });

  it("returns a distinct not-found error when no row matches", async () => {
    mockedRepo.getVehicleById.mockResolvedValue({ data: null, error: null });

    const result = await getVehicle(999);

    expect(result).toEqual({ success: false, error: "Vehicle not found." });
  });

  it("returns a generic error when the repository fails", async () => {
    mockedRepo.getVehicleById.mockResolvedValue({
      data: null,
      error: { message: "connection error" } as never,
    });

    const result = await getVehicle(1);

    expect(result).toEqual({
      success: false,
      error: "Unable to load this vehicle. Please try again.",
    });
  });
});

describe("createVehicle", () => {
  it("creates a vehicle when the payload is valid", async () => {
    const created = vehicle();
    mockedRepo.createVehicle.mockResolvedValue({ data: created, error: null });

    const result = await createVehicle(validInput());

    expect(result).toEqual({ success: true, vehicle: created });
    expect(mockedRepo.createVehicle).toHaveBeenCalledWith(
      expect.objectContaining({ vin: "4T1BF1FK5NU123001", status: "IN_STOCK" }),
    );
  });

  it("defaults status to IN_STOCK when omitted", async () => {
    const created = vehicle();
    mockedRepo.createVehicle.mockResolvedValue({ data: created, error: null });

    await createVehicle(validInput({ status: undefined as never }));

    expect(mockedRepo.createVehicle).toHaveBeenCalledWith(
      expect.objectContaining({ status: "IN_STOCK" }),
    );
  });

  it("rejects a VIN that isn't exactly 17 characters", async () => {
    const result = await createVehicle(validInput({ vin: "SHORTVIN" }));

    expect(result).toEqual({
      success: false,
      error: "VIN must be 17 characters.",
    });
    expect(mockedRepo.createVehicle).not.toHaveBeenCalled();
  });

  it("rejects a missing stock number", async () => {
    const result = await createVehicle(validInput({ stock_number: "" }));

    expect(result).toEqual({
      success: false,
      error: "Stock number is required.",
    });
  });

  it("rejects a missing make", async () => {
    const result = await createVehicle(validInput({ make: "" }));

    expect(result).toEqual({ success: false, error: "Make is required." });
  });

  it("rejects a missing model", async () => {
    const result = await createVehicle(validInput({ model: "" }));

    expect(result).toEqual({ success: false, error: "Model is required." });
  });

  it("rejects a year before 1980", async () => {
    const result = await createVehicle(validInput({ year: 1979 }));

    expect(result.success).toBe(false);
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining("Year must be between"),
    });
  });

  it("rejects a year more than two years in the future", async () => {
    const farFutureYear = new Date().getUTCFullYear() + 3;

    const result = await createVehicle(validInput({ year: farFutureYear }));

    expect(result.success).toBe(false);
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining("Year must be between"),
    });
  });

  it("rejects a year greater than the current year", async () => {
    // Regression test: the max bound was previously erroneously current
    // year + 2, letting future-dated vehicles slip through validation.
    const nextYear = new Date().getUTCFullYear() + 1;

    const result = await createVehicle(validInput({ year: nextYear }));

    expect(result.success).toBe(false);
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining("Year must be between"),
    });
    expect(mockedRepo.createVehicle).not.toHaveBeenCalled();
  });

  it("accepts a year equal to the current year", async () => {
    const currentYear = new Date().getUTCFullYear();
    const created = vehicle({ year: currentYear });
    mockedRepo.createVehicle.mockResolvedValue({ data: created, error: null });

    const result = await createVehicle(validInput({ year: currentYear }));

    expect(result).toEqual({ success: true, vehicle: created });
  });

  it("rejects negative mileage", async () => {
    const result = await createVehicle(validInput({ mileage: -1 }));

    expect(result).toEqual({
      success: false,
      error: "Mileage cannot be negative.",
    });
  });

  it("rejects negative msrp", async () => {
    const result = await createVehicle(validInput({ msrp: -100 }));

    expect(result).toEqual({
      success: false,
      error: "MSRP cannot be negative.",
    });
  });

  it("rejects negative invoice cost", async () => {
    const result = await createVehicle(validInput({ invoice_cost: -100 }));

    expect(result).toEqual({
      success: false,
      error: "Invoice cost cannot be negative.",
    });
  });

  it("rejects an unknown condition", async () => {
    const result = await createVehicle(
      validInput({ condition: "BOGUS" as never }),
    );

    expect(result).toEqual({
      success: false,
      error: "Condition must be one of NEW, USED, or CPO.",
    });
  });

  it("rejects an unknown status", async () => {
    const result = await createVehicle(
      validInput({ status: "BOGUS" as never }),
    );

    expect(result).toEqual({
      success: false,
      error: "Status must be one of IN_STOCK, SOLD, PENDING, or IN_TRANSIT.",
    });
  });

  it("returns a friendly VIN-specific error on a unique violation mentioning vin", async () => {
    mockedRepo.createVehicle.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        message:
          'duplicate key value violates unique constraint "vehicles_vin_key"',
      } as never,
    });

    const result = await createVehicle(validInput());

    expect(result).toEqual({
      success: false,
      error: "A vehicle with this VIN already exists.",
    });
  });

  it("returns a friendly stock-number-specific error on a unique violation mentioning stock_number", async () => {
    mockedRepo.createVehicle.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        message:
          'duplicate key value violates unique constraint "vehicles_stock_number_key"',
      } as never,
    });

    const result = await createVehicle(validInput());

    expect(result).toEqual({
      success: false,
      error: "A vehicle with this stock number already exists.",
    });
  });

  it("falls back to a generic duplicate message when the constraint can't be identified", async () => {
    mockedRepo.createVehicle.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        message: "duplicate key value violates unique constraint",
      } as never,
    });

    const result = await createVehicle(validInput());

    expect(result).toEqual({
      success: false,
      error: "A vehicle with this VIN or stock number already exists.",
    });
  });

  it("returns a generic error on a non-unique-violation repository failure", async () => {
    mockedRepo.createVehicle.mockResolvedValue({
      data: null,
      error: { code: "500", message: "connection error" } as never,
    });

    const result = await createVehicle(validInput());

    expect(result).toEqual({
      success: false,
      error: "Unable to create this vehicle. Please try again.",
    });
  });
});

describe("updateVehicle", () => {
  it("updates a vehicle when the payload is valid", async () => {
    const updated = vehicle({ mileage: 100 });
    mockedRepo.updateVehicle.mockResolvedValue({ data: updated, error: null });

    const result = await updateVehicle(1, validInput({ mileage: 100 }));

    expect(result).toEqual({ success: true, vehicle: updated });
    expect(mockedRepo.updateVehicle).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ mileage: 100 }),
    );
  });

  it("rejects an invalid payload without calling the repository", async () => {
    const result = await updateVehicle(1, validInput({ vin: "TOO_SHORT" }));

    expect(result).toEqual({
      success: false,
      error: "VIN must be 17 characters.",
    });
    expect(mockedRepo.updateVehicle).not.toHaveBeenCalled();
  });

  it("rejects a year greater than the current year on edit", async () => {
    // Regression test: editing a vehicle must be held to the same
    // current-year max bound as creating one.
    const nextYear = new Date().getUTCFullYear() + 1;

    const result = await updateVehicle(1, validInput({ year: nextYear }));

    expect(result.success).toBe(false);
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining("Year must be between"),
    });
    expect(mockedRepo.updateVehicle).not.toHaveBeenCalled();
  });

  it("returns a friendly error on a unique violation", async () => {
    mockedRepo.updateVehicle.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        message:
          'duplicate key value violates unique constraint "vehicles_vin_key"',
      } as never,
    });

    const result = await updateVehicle(1, validInput());

    expect(result).toEqual({
      success: false,
      error: "A vehicle with this VIN already exists.",
    });
  });

  it("returns a generic error when the repository fails", async () => {
    mockedRepo.updateVehicle.mockResolvedValue({
      data: null,
      error: { code: "500", message: "connection error" } as never,
    });

    const result = await updateVehicle(1, validInput());

    expect(result).toEqual({
      success: false,
      error: "Unable to update this vehicle. Please try again.",
    });
  });
});

describe("deleteVehicle", () => {
  it("succeeds when the repository succeeds", async () => {
    mockedRepo.deleteVehicle.mockResolvedValue({ data: null, error: null });

    const result = await deleteVehicle(1);

    expect(result).toEqual({ success: true });
  });

  it("returns a generic error when the repository fails", async () => {
    mockedRepo.deleteVehicle.mockResolvedValue({
      data: null,
      error: { message: "connection error" } as never,
    });

    const result = await deleteVehicle(1);

    expect(result).toEqual({
      success: false,
      error: "Unable to delete this vehicle. Please try again.",
    });
  });
});
