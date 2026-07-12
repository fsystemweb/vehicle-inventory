import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — Vehicle Inventory",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold text-foreground">Log in</h1>
        <p className="text-sm text-muted">
          Sign in to manage vehicle inventory.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
