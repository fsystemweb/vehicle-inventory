import type { VehicleStatus } from "@/types/vehicle";

export const STATUS_LABEL: Record<VehicleStatus, string> = {
  IN_STOCK: "In Stock",
  SOLD: "Sold",
  PENDING: "Pending",
  IN_TRANSIT: "In Transit",
};

const STATUS_TEXT_CLASS: Record<VehicleStatus, string> = {
  IN_STOCK: "text-good",
  IN_TRANSIT: "text-info",
  PENDING: "text-warning",
  SOLD: "text-muted",
};

export function StatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-mist px-2.5 py-1 text-xs font-medium ${STATUS_TEXT_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
