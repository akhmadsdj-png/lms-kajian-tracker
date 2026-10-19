"use server";

import { updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Explicitly mark a pertemuan finished or not finished. Unlike the player's
 * periodic saves (which can never clear a finished mark), this goes both ways,
 * and it leaves the resume position untouched.
 */
export async function setCompleted(videoId: string, completed: boolean): Promise<{ ok: boolean; message?: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Masuk dulu untuk menandai pertemuan." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { blockedAt: true } });
  if (!user || user.blockedAt) return { ok: false, message: "Akun ini tidak bisa menyimpan progres." };

  const video = await prisma.video.findUnique({ where: { id: videoId }, select: { id: true } });
  if (!video) return { ok: false, message: "Pertemuan tidak ditemukan." };

  await prisma.userProgress.upsert({
    where: { userId_videoId: { userId, videoId } },
    update: { isCompleted: completed },
    create: { userId, videoId, isCompleted: completed, lastWatchedSeconds: 0 },
  });

  // Progress pages, the mutaba'ah grid and the dashboard read this tag
  updateTag(`progress-${userId}`);
  return { ok: true };
}
