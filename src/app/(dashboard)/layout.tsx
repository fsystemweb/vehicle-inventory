import { logoutAction } from "@/server/actions/logout-action";
import { getCurrentUser } from "@/server/services/auth-service";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <span className="text-sm font-semibold text-foreground">
          Vehicle Inventory
        </span>
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-sm text-muted">{user.email}</span>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-violet hover:text-violet"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col p-8">{children}</main>
    </div>
  );
}
