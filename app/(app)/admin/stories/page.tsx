import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireUser } from "@/features/auth/server/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminStoryList } from "@/components/admin/admin-story-list";

const ADMIN_EMAILS = ["otger02@gmail.com"];

export const metadata: Metadata = {
  title: "Admin — Historias",
  description: "Panel de moderación de historias",
};

export default async function AdminStoriesPage() {
  const user = await requireUser();

  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect("/dashboard");
  }

  const supabase = await createServerSupabaseClient();

  const { data: stories } = await supabase
    .from("user_stories")
    .select("id, user_id, content, is_anonymous, status, created_at")
    .order("created_at", { ascending: false });

  const allStories = stories ?? [];

  // Group by status: pending first, then approved, then rejected
  const pending = allStories.filter((s) => s.status === "pending");
  const approved = allStories.filter((s) => s.status === "approved");
  const rejected = allStories.filter((s) => s.status === "rejected");
  const grouped = [...pending, ...approved, ...rejected];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          Admin
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-stone-900">
          Moderación de historias
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          {pending.length} pendiente{pending.length !== 1 ? "s" : ""} &middot;{" "}
          {approved.length} aprobada{approved.length !== 1 ? "s" : ""} &middot;{" "}
          {rejected.length} rechazada{rejected.length !== 1 ? "s" : ""}
        </p>
      </div>

      {grouped.length > 0 ? (
        <AdminStoryList stories={grouped} />
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-stone-200/60 bg-white/40 p-8 text-center">
          <p className="text-sm text-stone-500">
            No hay historias todavía.
          </p>
        </div>
      )}
    </div>
  );
}
