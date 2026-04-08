import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type LogChatFailureMetricParams = {
  errorCode: string;
  errorMessage: string;
  sessionId: string;
  userId: string;
};

export async function logChatFailureMetric({
  errorCode,
  errorMessage,
  sessionId,
  userId,
}: LogChatFailureMetricParams) {
  try {
    const supabase = await createServerSupabaseClient();

    await supabase.from("chat_failure_metrics").insert({
      session_id: sessionId,
      user_id: userId,
      error_code: errorCode.slice(0, 120),
      error_message: errorMessage.slice(0, 500),
    });
  } catch {
    // Metrics must never block chat responses.
  }
}