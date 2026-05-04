import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { VerifiedProfessionalPublic } from "@/features/professional-verification/types";

const PUBLIC_FIELDS = "user_id, professional_type, specialty, bio, linkedin_url, website_url, display_name, approved_at";

type ViewRow = {
  user_id: string;
  professional_type: "psychologist" | "sexologist" | "doctor";
  specialty: string | null;
  bio: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  display_name: string;
  approved_at: string | null;
};

function mapView(row: ViewRow): VerifiedProfessionalPublic {
  return {
    userId: row.user_id,
    professionalType: row.professional_type,
    specialty: row.specialty,
    bio: row.bio,
    linkedinUrl: row.linkedin_url,
    websiteUrl: row.website_url,
    displayName: row.display_name,
    approvedAt: row.approved_at,
  };
}

/**
 * Returns the public-facing record for a given user_id, or null if the
 * user is not currently a verified professional. Reads from the
 * `verified_professionals` view, so only the safe projection fields
 * surface — license number, document paths, legal name never leak.
 */
export async function getVerifiedProfessionalByUserId(
  userId: string,
): Promise<VerifiedProfessionalPublic | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("verified_professionals" as unknown as never)
    .select(PUBLIC_FIELDS)
    .eq("user_id", userId)
    .maybeSingle<ViewRow>();

  if (error) {
    console.error("[verification] getVerifiedProfessionalByUserId failed", error);
    return null;
  }

  return data ? mapView(data) : null;
}

/**
 * Batch fetch — used to badge multiple comments / threads in a single
 * query. Returns a Map<userId, VerifiedProfessionalPublic>. Missing
 * users (not verified) simply aren't in the map.
 */
export async function getVerifiedProfessionalsByUserIds(
  userIds: string[],
): Promise<Map<string, VerifiedProfessionalPublic>> {
  const result = new Map<string, VerifiedProfessionalPublic>();
  if (userIds.length === 0) return result;

  const unique = Array.from(new Set(userIds));
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("verified_professionals" as unknown as never)
    .select(PUBLIC_FIELDS)
    .in("user_id", unique)
    .returns<ViewRow[]>();

  if (error) {
    console.error("[verification] getVerifiedProfessionalsByUserIds failed", error);
    return result;
  }

  for (const row of data ?? []) {
    result.set(row.user_id, mapView(row));
  }
  return result;
}
