"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv } from "@/lib/env";
import type { Database } from "@/types/db";

let browserClient: SupabaseClient<Database> | undefined;

// Use this client in browser-only code such as client components and hooks.
export function createBrowserSupabaseClient() {
  if (browserClient) {
    return browserClient;
  }

  const env = getPublicEnv();

  browserClient = createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return browserClient;
}