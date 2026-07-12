"use server";

import { redirect } from "next/navigation";
import { login } from "@/server/services/auth-service";

export type LoginActionState = {
  error: string | null;
};

export const initialLoginState: LoginActionState = { error: null };

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Invalid form submission." };
  }

  const result = await login(email, password);

  if (!result.success) {
    return { error: result.error };
  }

  redirect("/dashboard");
}
