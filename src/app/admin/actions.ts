"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidateTag, revalidatePath } from "next/cache";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * Accepts what people paste from YouTube: a channel ID (UC…), a /channel/UC… URL,
 * a /@handle URL or a bare @handle. Confirms the channel exists and returns its
 * real ID plus avatar, since the sync job only understands UC… IDs.
 */
async function resolveChannel(input: string): Promise<{ id: string; imageUrl: string | null }> {
  const value = input.trim();
  const channelId = value.match(/(?:^|\/channel\/)(UC[\w-]{22})(?:[/?#]|$)/)?.[1];
  const handle = channelId
    ? null
    : (value.match(/youtube\.com\/@([\w.-]+)/)?.[1] ?? value.match(/^@?([\w.-]{3,30})$/)?.[1]);

  if (!channelId && !handle) {
    throw new Error(`"${value}" bukan channel YouTube. Tempel URL channel, @handle, atau ID yang diawali UC.`);
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet");
  url.searchParams.set(channelId ? "id" : "forHandle", channelId ?? `@${handle}`);
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY ?? "");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`YouTube API menolak permintaan (${res.status}). Coba lagi nanti.`);
  const data = (await res.json()) as {
    items?: { id: string; snippet: { thumbnails: { medium?: { url: string } } } }[];
  };
  const channel = data.items?.[0];
  if (!channel) throw new Error(`Channel "${value}" tidak ditemukan di YouTube.`);

  return { id: channel.id, imageUrl: channel.snippet.thumbnails.medium?.url ?? null };
}

export async function addTutorAction(formData: FormData) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string | null)?.trim();
  const channelInput = (formData.get("youtubeChannelId") as string | null)?.trim();

  if (!name || !channelInput) {
    throw new Error("Nama dan channel YouTube wajib diisi.");
  }

  const channel = await resolveChannel(channelInput);

  const existing = await prisma.tutor.findUnique({ where: { youtubeChannelId: channel.id } });
  if (existing) {
    throw new Error(`Channel ini sudah terdaftar atas nama ${existing.name}.`);
  }

  await prisma.tutor.create({
    data: {
      name,
      slug: slugify(name),
      youtubeChannelId: channel.id,
      imageUrl: channel.imageUrl,
    },
  });

  revalidateTag("tutors", { expire: 0 });
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function setRequestStatusAction(formData: FormData) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string | null;
  const status = formData.get("status") as string | null;
  if (!id || (status !== "added" && status !== "rejected" && status !== "pending")) {
    throw new Error("Request tidak valid.");
  }

  await prisma.tutorRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/request-pengajar");
}
