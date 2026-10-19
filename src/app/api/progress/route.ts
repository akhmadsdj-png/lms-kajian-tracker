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

  const position = Number(lastWatchedSeconds);

  // Single query: upsert with completion lock built into SQL
  // Once isCompleted=true, it can NEVER be set back to false.
  // The CTE reads the previous position from the same snapshot, before the update.
  const rows = await prisma.$queryRaw<{ id: string; previous: number | null }[]>`
    WITH prev AS (
      SELECT "lastWatchedSeconds" FROM "UserProgress"
      WHERE "userId" = ${session.user.id} AND "videoId" = ${videoId}
    ), saved AS (
    INSERT INTO "UserProgress" ("id", "userId", "videoId", "lastWatchedSeconds", "isCompleted", "updatedAt")
    SELECT gen_random_uuid(), ${session.user.id}, ${videoId}, ${position}, ${!!isCompleted}, NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM "User" WHERE "id" = ${session.user.id} AND "blockedAt" IS NOT NULL
    )
    ON CONFLICT ("userId", "videoId") DO UPDATE
    SET "lastWatchedSeconds" = ${position},
        "isCompleted" = CASE
          WHEN "UserProgress"."isCompleted" = true THEN true
          ELSE ${!!isCompleted}
        END,
        "updatedAt" = NOW()
    RETURNING "id"
    )
    SELECT saved."id", (SELECT "lastWatchedSeconds" FROM prev) AS previous FROM saved
  `;

  // Blocked accounts: the INSERT above wrote nothing
  if (rows.length === 0) {
    return NextResponse.json({ saved: false, reason: "blocked" }, { status: 403 });
  }

  // Count playback time for the activity graph: only small forward steps (the player
  // saves every 15 s), so seeking ahead, rewinding or "mark complete" don't count.
  const previous = rows[0]?.previous ?? 0;
  const watched = Math.round(position - previous);
  if (watched > 0 && watched <= 60) {
    await prisma.$executeRaw`
      INSERT INTO "UserDailyActivity" ("userId", "day", "seconds")
      VALUES (${session.user.id}, (NOW() AT TIME ZONE 'Asia/Jakarta')::date, ${watched})
      ON CONFLICT ("userId", "day") DO UPDATE
      SET "seconds" = "UserDailyActivity"."seconds" + EXCLUDED."seconds"
    `;
  }

  return NextResponse.json({ saved: true, id: rows[0]?.id });
}
