import { beforeEach, describe, expect, it, vi } from "vitest";
import { listBrandNames } from "@/server/services/brand-service";
import * as brandRepository from "@/server/repositories/brand-repository";

vi.mock("@/server/repositories/brand-repository");

const mockedRepo = vi.mocked(brandRepository);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("listBrandNames", () => {
  it("returns brands from the repository on success", async () => {
    const brands = [
      { id: 1, name: "Honda" },
      { id: 2, name: "Toyota" },
    ];
    mockedRepo.listBrands.mockResolvedValue({ data: brands, error: null });

    const result = await listBrandNames();

    expect(result).toEqual({ success: true, brands });
  });

  it("returns an empty list when the repository returns no data", async () => {
    mockedRepo.listBrands.mockResolvedValue({ data: null, error: null });

    const result = await listBrandNames();

    expect(result).toEqual({ success: true, brands: [] });
  });

  it("returns a generic error when the repository fails", async () => {
    mockedRepo.listBrands.mockResolvedValue({
      data: null,
      error: { message: "connection error" } as never,
    });

    const result = await listBrandNames();

    expect(result).toEqual({
      success: false,
      error: "Failed to load brands.",
    });
  });
});
