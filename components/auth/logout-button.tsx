"use client";

import { useRouter } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm text-stone-400 transition-colors hover:text-stone-700"
    >
      Salir
    </button>
  );
}
