import "server-only";

import { getUser } from "@/features/auth/server/get-user";
import { getUserPlan } from "@/features/billing/server/get-user-plan";
import type { UserPlan } from "@/features/billing/types";

type ViewerPlan = {
  userId: string | null;
  plan: UserPlan | null;
};

export async function getViewerPlan(): Promise<ViewerPlan> {
  const user = await getUser();

  if (!user) {
    return {
      userId: null,
      plan: null,
    };
  }

  const plan = await getUserPlan({ userId: user.id });

  return {
    userId: user.id,
    plan,
  };
}