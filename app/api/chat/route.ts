import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import { ChatTurnProcessingError, processChatTurn } from "@/features/chat/server/process-chat-turn";
import { chatTurnRequestSchema } from "@/features/chat/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const result = await processChatTurn({
      userId: user.id,
      input: parsedInput.data,
    });

    return NextResponse.json(result, { status: 200 });
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