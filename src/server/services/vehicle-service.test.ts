import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDashboardSummary,
  listVehicles,
} from "@/server/services/vehicle-service";
import * as vehicleRepository from "@/server/repositories/vehicle-repository";
import type { Vehicle } from "@/types/vehicle";

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
