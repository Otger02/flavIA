import { getPublicEnv, getServerEnv } from "@/lib/env";

export function getSupabasePublicConfig() {
  const env = getPublicEnv();

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function getSupabaseServerConfig() {
  const env = getServerEnv();

  return {
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}