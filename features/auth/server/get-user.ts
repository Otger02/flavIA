import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});
