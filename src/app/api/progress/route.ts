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

  // Check existing progress for completion lock
  const existing = await prisma.userProgress.findUnique({
    where: {
      userId_videoId: {
        userId: session.user.id,
        videoId,
      },
    },
  });

  // CRITICAL: If already completed, NEVER set back to false
  const finalIsCompleted = existing?.isCompleted ? true : !!isCompleted;

  const progress = await prisma.userProgress.upsert({
    where: {
      userId_videoId: {
        userId: session.user.id,
        videoId,
      },
    },
    update: {
      lastWatchedSeconds: Number(lastWatchedSeconds),
      isCompleted: finalIsCompleted,
    },
    create: {
      userId: session.user.id,
      videoId,
      lastWatchedSeconds: Number(lastWatchedSeconds),
      isCompleted: finalIsCompleted,
    },
  });

  return NextResponse.json(progress);
}
