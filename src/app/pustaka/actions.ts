"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WATCH_LATER } from "@/lib/user-playlists";

const MAX_PLAYLISTS = 100;
const MAX_ITEMS = 1000;

export type ActionResult = { ok: boolean; message: string; id?: string };
export type SaveTarget = { id: string; title: string; isWatchLater: boolean; count: number; hasVideo: boolean };

/** Signed-in, not-blocked user id, or null. */
async function activeUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { blockedAt: true } });
  return user && !user.blockedAt ? userId : null;
}

async function ensureWatchLater(userId: string) {
  const existing = await prisma.userPlaylist.findFirst({ where: { userId, isWatchLater: true }, select: { id: true } });
  if (existing) return existing.id;
  const created = await prisma.userPlaylist.create({
    data: { userId, title: "Tonton nanti", isWatchLater: true },
    select: { id: true },
  });
  return created.id;
}

/** The playlist id if it belongs to this user (resolving the watch-later alias). */
async function ownedPlaylistId(userId: string, playlistId: string) {
  if (playlistId === WATCH_LATER) return ensureWatchLater(userId);
  const row = await prisma.userPlaylist.findFirst({ where: { id: playlistId, userId }, select: { id: true } });
  return row?.id ?? null;
}

function refresh(playlistId?: string) {
  revalidatePath("/pustaka");
  if (playlistId) revalidatePath(`/pustaka/${playlistId}`);
}

async function appendVideo(playlistId: string, videoId: string) {
  const count = await prisma.userPlaylistItem.count({ where: { playlistId } });
  if (count >= MAX_ITEMS) return false;
  const last = await prisma.userPlaylistItem.aggregate({ where: { playlistId }, _max: { position: true } });
  await prisma.userPlaylistItem.upsert({
    where: { playlistId_videoId: { playlistId, videoId } },
    update: {},
    create: { playlistId, videoId, position: (last._max.position ?? -1) + 1 },
  });
  await prisma.userPlaylist.update({ where: { id: playlistId }, data: { updatedAt: new Date() } });
  return true;
}

/** For the "Simpan" menu: the user's playlists and whether this video is in each. */
export async function getSaveTargets(videoId: string): Promise<SaveTarget[] | null> {
  const userId = await activeUserId();
  if (!userId) return null;
  const playlists = await prisma.userPlaylist.findMany({
    where: { userId },
    orderBy: [{ isWatchLater: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      isWatchLater: true,
      _count: { select: { items: true } },
      items: { where: { videoId }, select: { id: true } },
    },
  });
  const targets = playlists.map((p) => ({
    id: p.id,
    title: p.title,
    isWatchLater: p.isWatchLater,
    count: p._count.items,
    hasVideo: p.items.length > 0,
  }));
  // Offer "Tonton nanti" before it exists; it's created on first save
  if (!targets.some((t) => t.isWatchLater)) {
    targets.unshift({ id: WATCH_LATER, title: "Tonton nanti", isWatchLater: true, count: 0, hasVideo: false });
  }
  return targets;
}

export async function setVideoInPlaylist(playlistId: string, videoId: string, add: boolean): Promise<ActionResult> {
  const userId = await activeUserId();
  if (!userId) return { ok: false, message: "Masuk dulu untuk menyimpan." };
  const id = await ownedPlaylistId(userId, playlistId);
  if (!id) return { ok: false, message: "Playlist tidak ditemukan." };

  if (add) {
    const video = await prisma.video.findUnique({ where: { id: videoId }, select: { id: true } });
    if (!video) return { ok: false, message: "Pertemuan tidak ditemukan." };
    if (!(await appendVideo(id, videoId))) {
      return { ok: false, message: `Playlist ini sudah berisi ${MAX_ITEMS} pertemuan, batas maksimal.` };
    }
  } else {
    await prisma.userPlaylistItem.deleteMany({ where: { playlistId: id, videoId } });
  }
  refresh(id);
  return { ok: true, message: add ? "Tersimpan" : "Dihapus dari playlist", id };
}

export async function createUserPlaylist(title: string, videoId?: string): Promise<ActionResult> {
  const userId = await activeUserId();
  if (!userId) return { ok: false, message: "Masuk dulu untuk membuat playlist." };
  const name = title.trim();
  if (name.length < 2 || name.length > 80) return { ok: false, message: "Nama playlist 2 sampai 80 huruf." };
  if ((await prisma.userPlaylist.count({ where: { userId } })) >= MAX_PLAYLISTS) {
    return { ok: false, message: `Batas ${MAX_PLAYLISTS} playlist sudah tercapai. Hapus yang tidak dipakai dulu.` };
  }
  const playlist = await prisma.userPlaylist.create({ data: { userId, title: name }, select: { id: true } });
  if (videoId) await appendVideo(playlist.id, videoId);
  refresh(playlist.id);
  return { ok: true, message: videoId ? `Disimpan ke "${name}"` : `Playlist "${name}" dibuat`, id: playlist.id };
}

export async function updateUserPlaylist(id: string, title: string, description: string): Promise<ActionResult> {
  const userId = await activeUserId();
  if (!userId) return { ok: false, message: "Masuk dulu." };
  const playlist = await prisma.userPlaylist.findFirst({ where: { id, userId }, select: { isWatchLater: true } });
  if (!playlist) return { ok: false, message: "Playlist tidak ditemukan." };
  if (playlist.isWatchLater) return { ok: false, message: '"Tonton nanti" tidak bisa diganti namanya.' };
  const name = title.trim();
  if (name.length < 2 || name.length > 80) return { ok: false, message: "Nama playlist 2 sampai 80 huruf." };
  const about = description.trim().slice(0, 500) || null;
  await prisma.userPlaylist.update({ where: { id }, data: { title: name, description: about } });
  refresh(id);
  return { ok: true, message: "Tersimpan" };
}

export async function deleteUserPlaylist(id: string): Promise<ActionResult> {
  const userId = await activeUserId();
  if (!userId) return { ok: false, message: "Masuk dulu." };
  const playlist = await prisma.userPlaylist.findFirst({ where: { id, userId }, select: { isWatchLater: true } });
  if (!playlist) return { ok: false, message: "Playlist tidak ditemukan." };
  if (playlist.isWatchLater) return { ok: false, message: '"Tonton nanti" tidak bisa dihapus. Kosongkan saja isinya.' };
  await prisma.userPlaylist.delete({ where: { id } });
  refresh();
  return { ok: true, message: "Playlist dihapus" };
}

/** Swap an item with its neighbour above or below. */
export async function moveUserPlaylistItem(itemId: string, direction: "up" | "down"): Promise<ActionResult> {
  const userId = await activeUserId();
  if (!userId) return { ok: false, message: "Masuk dulu." };
  const item = await prisma.userPlaylistItem.findFirst({
    where: { id: itemId, playlist: { userId } },
    select: { id: true, position: true, playlistId: true },
  });
  if (!item) return { ok: false, message: "Pertemuan tidak ditemukan." };
  const neighbour = await prisma.userPlaylistItem.findFirst({
    where: {
      playlistId: item.playlistId,
      position: direction === "up" ? { lt: item.position } : { gt: item.position },
    },
    orderBy: { position: direction === "up" ? "desc" : "asc" },
    select: { id: true, position: true },
  });
  if (!neighbour) return { ok: true, message: "" };
  await prisma.$transaction([
    prisma.userPlaylistItem.update({ where: { id: item.id }, data: { position: neighbour.position } }),
    prisma.userPlaylistItem.update({ where: { id: neighbour.id }, data: { position: item.position } }),
  ]);
  refresh(item.playlistId);
  return { ok: true, message: "" };
}

export async function removeUserPlaylistItem(itemId: string): Promise<ActionResult> {
  const userId = await activeUserId();
  if (!userId) return { ok: false, message: "Masuk dulu." };
  const item = await prisma.userPlaylistItem.findFirst({
    where: { id: itemId, playlist: { userId } },
    select: { id: true, playlistId: true },
  });
  if (!item) return { ok: false, message: "Pertemuan tidak ditemukan." };
  await prisma.userPlaylistItem.delete({ where: { id: item.id } });
  refresh(item.playlistId);
  return { ok: true, message: "Dihapus dari playlist" };
}
