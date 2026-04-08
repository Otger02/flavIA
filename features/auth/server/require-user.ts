import { redirect } from "next/navigation";

import { getUser } from "@/features/auth/server/get-user";

// Use this helper from protected server layouts, pages and actions.
export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  return user;
}