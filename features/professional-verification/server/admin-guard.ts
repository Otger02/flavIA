import "server-only";

import { redirect } from "next/navigation";

import { getUser } from "@/features/auth/server/get-user";
import { ADMIN_EMAILS } from "@/lib/constants";

/**
 * Mirror of the admin gate used elsewhere in /admin/*. Throws via
 * redirect to /dashboard when the caller isn't an admin. Keep behavior
 * identical to the existing admin pages so any future change to the
 * admin model only needs to update this and `lib/constants.ts`.
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const user = await getUser();

  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect("/dashboard");
  }

  return { id: user.id, email: user.email };
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && ADMIN_EMAILS.includes(email));
}
