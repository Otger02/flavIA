import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";
import { TrackViewEvent } from "@/components/analytics/track-view-event";
import { ANALYTICS_EVENTS } from "@/lib/analytics/track";
import { getUser } from "@/features/auth/server/get-user";
import { ChatShell } from "@/components/chat/chat-shell";
import { enforceUsagePolicy } from "@/features/chat/server/enforce-usage-policy";
import { getChatHistory } from "@/features/chat/server/get-chat-history";
import { getLatestChatSession } from "@/features/chat/server/get-latest-chat-session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shared");
  return {
    title: t("chat.meta_title"),
    description: t("chat.meta_description"),
  };
}

type ChatPageProps = {
  searchParams: Promise<{ topic?: string }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams;
  const hasTopic = Boolean(params.topic);
  const user = await getUser();
  const session = !hasTopic && user ? await getLatestChatSession({ userId: user.id }) : null;
  const messages = session ? await getChatHistory({ sessionId: session.id }) : [];
  const usage = user ? await enforceUsagePolicy({ userId: user.id, sessionId: session?.id }) : null;

  return (
    <>
      <TrackViewEvent
        event={ANALYTICS_EVENTS.chatOpened}
        properties={{
          hasExistingSession: Boolean(session),
          initialMessageCount: messages.length,
          topic: params.topic ?? null,
        }}
      />
      <ChatShell
        initialMessages={messages}
        initialSessionId={session?.id ?? null}
        initialUsage={usage}
        initialTopic={params.topic ?? null}
      />
    </>
  );
}
