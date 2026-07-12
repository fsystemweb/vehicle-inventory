"use server";

import { redirect } from "next/navigation";
import {
  createVehicle,
  deleteVehicle,
  updateVehicle,
} from "@/server/services/vehicle-service";
import type {
  VehicleCondition,
  VehicleInput,
  VehicleStatus,
} from "@/types/vehicle";

export type VehicleActionState = {
  error: string | null;
};

function toRequiredString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableString(value: FormDataEntryValue | null): string | null {
  const trimmed = toRequiredString(value);
  return trimmed ? trimmed : null;
}

function toRequiredNumber(value: FormDataEntryValue | null): number {
  if (typeof value !== "string" || value.trim() === "") {
    return NaN;
  }
  return Number(value);
}

function toNullableNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseVehicleInput(formData: FormData): VehicleInput {
  return {
    vin: toRequiredString(formData.get("vin")),
    stock_number: toRequiredString(formData.get("stock_number")),
    make: toRequiredString(formData.get("make")),
    model: toRequiredString(formData.get("model")),
    year: toRequiredNumber(formData.get("year")),
    trim: toNullableString(formData.get("trim")),
    color: toNullableString(formData.get("color")),
    interior_color: toNullableString(formData.get("interior_color")),
    mileage: toRequiredNumber(formData.get("mileage")),
    msrp: toNullableNumber(formData.get("msrp")),
    invoice_cost: toNullableNumber(formData.get("invoice_cost")),
    status: (formData.get("status") as VehicleStatus) || "IN_STOCK",
    condition: formData.get("condition") as VehicleCondition,
    location: toNullableString(formData.get("location")),
    received_date: toNullableString(formData.get("received_date")),
    sold_date: toNullableString(formData.get("sold_date")),
    notes: toNullableString(formData.get("notes")),
  };
}

export async function createVehicleAction(
  _prevState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  const input = parseVehicleInput(formData);
  const result = await createVehicle(input);

  if (!result.success) {
    return { error: result.error };
  }

  redirect(`/dashboard/vehicles/${result.vehicle.id}`);
}

export async function updateVehicleAction(
  _prevState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    return { error: "Invalid vehicle." };
  }

  const input = parseVehicleInput(formData);
  const result = await updateVehicle(id, input);

  if (!result.success) {
    return { error: result.error };
  }

  redirect(`/dashboard/vehicles/${result.vehicle.id}`);
}

export async function deleteVehicleAction(
  _prevState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    return { error: "Invalid vehicle." };
  }

  const result = await deleteVehicle(id);

  if (!result.success) {
    return { error: result.error };
  }

  redirect("/dashboard");
}
