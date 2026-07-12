import type { VehicleCondition } from "@/types/vehicle";

export const CONDITION_LABEL: Record<VehicleCondition, string> = {
  NEW: "New",
  USED: "Used",
  CPO: "CPO",
};

export function ConditionBadge({ condition }: { condition: VehicleCondition }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted">
      {CONDITION_LABEL[condition]}
    </span>
  );
}
