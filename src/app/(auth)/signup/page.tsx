import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up — Vehicle Inventory",
};

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold text-foreground">Sign up</h1>
        <p className="text-sm text-muted">
          Create an account to manage vehicle inventory.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
