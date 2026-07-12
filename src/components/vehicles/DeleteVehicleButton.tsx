"use client";

import { useActionState } from "react";
import {
  deleteVehicleAction,
  type VehicleActionState,
} from "@/server/actions/vehicle-actions";

const initialState: VehicleActionState = { error: null };

export function DeleteVehicleButton({ id }: { id: number }) {
  const [state, formAction, isPending] = useActionState(
    deleteVehicleAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm("Delete this vehicle? This action cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {state.error && (
        <p role="alert" className="mb-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:border-danger disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
    </form>
  );
}
