"use server";

import { getAdmin } from "@/lib/admin";
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

export type AddTutorState = { ok: boolean; message: string } | null;

type ResolvedChannel = { ok: true; id: string; imageUrl: string | null } | { ok: false; message: string };

/**
 * Accepts what people paste from YouTube: a channel ID (UC…), a /channel/UC… URL,
 * a /@handle URL or a bare @handle. Confirms the channel exists and returns its
 * real ID plus avatar, since the sync job only understands UC… IDs.
 */
async function resolveChannel(input: string): Promise<ResolvedChannel> {
  const value = input.trim();
  const channelId = value.match(/(?:^|\/channel\/)(UC[\w-]{22})(?:[/?#]|$)/)?.[1];
  const handle = channelId
    ? null
    : (value.match(/youtube\.com\/@([\w.-]+)/)?.[1] ?? value.match(/^@?([\w.-]{3,30})$/)?.[1]);

  if (!channelId && !handle) {
    return { ok: false, message: `"${value}" bukan channel YouTube. Tempel URL channel, @handle, atau ID yang diawali UC.` };
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      message: "YOUTUBE_API_KEY belum diatur di Vercel (Settings → Environment Variables), jadi channel tidak bisa dicek.",
    };
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet");
  url.searchParams.set(channelId ? "id" : "forHandle", channelId ?? `@${handle}`);
  url.searchParams.set("key", apiKey);

  let data: { items?: { id: string; snippet: { thumbnails: { medium?: { url: string } } } }[] };
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      return { ok: false, message: `YouTube API menolak permintaan (kode ${res.status}). Cek YOUTUBE_API_KEY di Vercel.` };
    }
    data = await res.json();
  } catch {
    return { ok: false, message: "YouTube tidak bisa dihubungi. Coba lagi sebentar lagi." };
  }

  const channel = data.items?.[0];
  if (!channel) return { ok: false, message: `Channel "${value}" tidak ditemukan di YouTube.` };

  return { ok: true, id: channel.id, imageUrl: channel.snippet.thumbnails.medium?.url ?? null };
}

export async function addTutorAction(_prev: AddTutorState, formData: FormData): Promise<AddTutorState> {
  if (!(await getAdmin())) {
    return { ok: false, message: "Hanya admin yang bisa menambah pengajar." };
  }

  const name = (formData.get("name") as string | null)?.trim();
  const channelInput = (formData.get("youtubeChannelId") as string | null)?.trim();

  if (!name || !channelInput) {
    return { ok: false, message: "Nama dan channel YouTube wajib diisi." };
  }

  const channel = await resolveChannel(channelInput);
  if (!channel.ok) return channel;

  const slug = slugify(name);
  const clash = await prisma.tutor.findFirst({
    where: { OR: [{ youtubeChannelId: channel.id }, { slug }] },
    select: { name: true, youtubeChannelId: true },
  });
  if (clash) {
    return {
      ok: false,
      message:
        clash.youtubeChannelId === channel.id
          ? `Channel ini sudah terdaftar atas nama ${clash.name}.`
          : `Nama "${name}" sudah dipakai pengajar lain. Bedakan sedikit, misalnya tambahkan gelar.`,
    };
  }

  await prisma.tutor.create({
    data: { name, slug, youtubeChannelId: channel.id, imageUrl: channel.imageUrl },
  });

  revalidateTag("tutors", { expire: 0 });
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: `${name} ditambahkan. Playlist-nya akan masuk saat sinkronisasi harian berikutnya (07:00 WIB).`,
  };
}

export async function setRequestStatusAction(formData: FormData) {
  if (!(await getAdmin())) {
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
