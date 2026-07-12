import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Vehicle Inventory",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="text-sm text-muted">
        Vehicle inventory workspace — no feature UI yet.
      </p>
    </div>
  );
}
