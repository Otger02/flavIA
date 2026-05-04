import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import { ChatTurnProcessingError, processChatTurnStream } from "@/features/chat/server/process-chat-turn";
import { chatTurnRequestSchema } from "@/features/chat/types";
import { checkChatRateLimit } from "@/lib/rate-limit/chat";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkChatRateLimit(user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Demasiadas solicitudes. Espera un momento antes de continuar.",
        code: "rate_limited",
        retryable: true,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter),
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const json = await request.json();
  const parsedInput = chatTurnRequestSchema.safeParse(json);

  if (!parsedInput.success) {
    return NextResponse.json(
      {
        error: "Invalid chat payload",
        issues: parsedInput.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const stream = await processChatTurnStream({
      userId: user.id,
      input: parsedInput.data,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    if (error instanceof ChatTurnProcessingError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          retryable: error.retryable,
          sessionId: error.sessionId,
        },
        { status: error.statusCode },
      );
    }

    const message = error instanceof Error ? error.message : "Unexpected chat error";

    return NextResponse.json({ error: message, retryable: true }, { status: 500 });
  }
}
