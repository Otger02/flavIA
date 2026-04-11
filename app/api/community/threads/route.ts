import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/features/auth/server/get-user";
import { getThreads } from "@/features/community/server/get-threads";
import { createThread } from "@/features/community/server/create-thread";
import { enforceCommunityPolicy } from "@/features/community/server/enforce-community-policy";
import { isCommunityEnabled } from "@/lib/feature-flags";
import {
  THREAD_TITLE_MIN,
  THREAD_TITLE_MAX,
  THREAD_BODY_MIN,
  THREAD_BODY_MAX,
  COMMUNITY_TOPICS,
} from "@/features/community/constants";

export async function GET(request: NextRequest) {
  if (!isCommunityEnabled()) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") || undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const result = await getThreads({ topic, page });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!isCommunityEnabled()) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check Plus access for thread creation
  const policy = await enforceCommunityPolicy({ userId: user.id, action: "create_thread" });
  if (!policy.allowed) {
    return NextResponse.json({ error: policy.reason }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, body: threadBody, topic, isAnonymous } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length < THREAD_TITLE_MIN || title.trim().length > THREAD_TITLE_MAX) {
    return NextResponse.json({ error: `Title must be between ${THREAD_TITLE_MIN} and ${THREAD_TITLE_MAX} characters.` }, { status: 400 });
  }

  if (typeof threadBody !== "string" || threadBody.trim().length < THREAD_BODY_MIN || threadBody.trim().length > THREAD_BODY_MAX) {
    return NextResponse.json({ error: `Body must be between ${THREAD_BODY_MIN} and ${THREAD_BODY_MAX} characters.` }, { status: 400 });
  }

  const validTopic = typeof topic === "string" && COMMUNITY_TOPICS.includes(topic as (typeof COMMUNITY_TOPICS)[number])
    ? topic
    : null;

  const result = await createThread({
    userId: user.id,
    title: title.trim(),
    body: (threadBody as string).trim(),
    topic: validTopic,
    isAnonymous: isAnonymous === true,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    thread: result.thread,
    moderated: result.thread.status === "hidden",
  });
}
