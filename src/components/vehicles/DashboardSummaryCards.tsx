import { KpiCard } from "@/components/vehicles/KpiCard";
import { formatCurrency } from "@/lib/format";
import type { DashboardSummary } from "@/types/vehicle";

export function DashboardSummaryCards({
  summary,
}: {
  summary: DashboardSummary;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard label="In Stock" value={summary.inStockCount} tone="success" />
      <KpiCard label="Pending" value={summary.pendingCount} tone="warning" />
      <KpiCard label="In Transit" value={summary.inTransitCount} />
      <KpiCard label="Sold This Month" value={summary.soldThisMonthCount} />
      <KpiCard
        label="Total In-Stock Value"
        value={formatCurrency(summary.totalInStockValue)}
      />
    </div>
  );
}
