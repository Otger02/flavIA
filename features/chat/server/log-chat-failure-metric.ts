import "server-only";

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
  // chat_failure_metrics table does not exist in the current schema.
  // Silently discard until the table is created.
  void errorCode;
  void errorMessage;
  void sessionId;
  void userId;
}
