"use server";

import { redirect } from "next/navigation";
import { signup } from "@/server/services/auth-service";

export type SignupActionState = {
  error: string | null;
  success: boolean;
  needsEmailConfirmation: boolean;
};

export async function signupAction(
  _prevState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return {
      error: "Invalid form submission.",
      success: false,
      needsEmailConfirmation: false,
    };
  }

  const result = await signup(email, password);

  if (!result.success) {
    return {
      error: result.error,
      success: false,
      needsEmailConfirmation: false,
    };
  }

  if (!result.needsEmailConfirmation) {
    redirect("/dashboard");
  }

  return {
    error: null,
    success: true,
    needsEmailConfirmation: true,
  };
}
