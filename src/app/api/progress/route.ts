import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/progress?videoId=xxx
export async function GET(request: NextRequest) {
  const session = await auth();
  // Return default (no progress) for guests — no error
  if (!session?.user?.id) {
    return NextResponse.json({ lastWatchedSeconds: 0, isCompleted: false });
  }

  const videoId = request.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_videoId: {
        userId: session.user.id,
        videoId,
      },
    },
  });

  return NextResponse.json(
    progress ?? { lastWatchedSeconds: 0, isCompleted: false }
  );
}

// POST /api/progress
export async function POST(request: NextRequest) {
  const session = await auth();
  // Silently skip saving for guests — no error
  if (!session?.user?.id) {
    return NextResponse.json({ saved: false, reason: "guest" });
  }

  const body = await request.json();
  const { videoId, lastWatchedSeconds, isCompleted } = body;

  if (!videoId || lastWatchedSeconds === undefined) {
    return NextResponse.json(
      { error: "videoId and lastWatchedSeconds required" },
      { status: 400 }
    );
  }

  // Single query: upsert with completion lock built into SQL
  // Once isCompleted=true, it can NEVER be set back to false
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    INSERT INTO "UserProgress" ("id", "userId", "videoId", "lastWatchedSeconds", "isCompleted", "updatedAt")
    VALUES (gen_random_uuid(), ${session.user.id}, ${videoId}, ${Number(lastWatchedSeconds)}, ${!!isCompleted}, NOW())
    ON CONFLICT ("userId", "videoId") DO UPDATE
    SET "lastWatchedSeconds" = ${Number(lastWatchedSeconds)},
        "isCompleted" = CASE
          WHEN "UserProgress"."isCompleted" = true THEN true
          ELSE ${!!isCompleted}
        END,
        "updatedAt" = NOW()
    RETURNING "id"
  `;

  return NextResponse.json({ saved: true, id: rows[0]?.id });
}
