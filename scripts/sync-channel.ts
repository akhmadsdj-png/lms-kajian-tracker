/**
 * Script: sync-channel.ts
 * Mengambil playlist dan video dari channel YouTube setiap pengajar
 * lalu menyimpannya ke database Supabase via Prisma. Playlist yang jumlah
 * videonya tidak berubah sejak sync terakhir dilewati.
 *
 * Cara menjalankan:
 *   npx tsx scripts/sync-channel.ts
 *   npx tsx scripts/sync-channel.ts --force   # ambil ulang semua playlist
 */

import { Prisma, PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const BASE_URL = "https://www.googleapis.com/youtube/v3";
const FORCE = process.argv.includes("--force");

// Slugify a string
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// Fetch all playlists from channel
async function fetchPlaylists(channelId: string) {
  const playlists: { id: string; title: string; description: string; thumbnail: string; itemCount: number }[] = [];
  let pageToken = "";

  do {
    const url = `${BASE_URL}/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=50&pageToken=${pageToken}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json() as any;

    if (data.error) {
      console.error("YouTube API Error:", data.error.message);
      process.exit(1);
    }

    for (const item of data.items ?? []) {
      playlists.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description ?? "",
        thumbnail: item.snippet.thumbnails?.medium?.url ?? "",
        itemCount: item.contentDetails?.itemCount ?? 0,
      });
    }

    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return playlists;
}

// Fetch all videos from a playlist, oldest first. Many channels keep a playlist sorted
// newest-first, which would put pertemuan 1 at the bottom; when the YouTube order mostly
// runs backwards in publish date, it is reversed. Ascending and hand-curated orders are kept.
async function fetchVideos(playlistId: string) {
  const videos: { youtubeVideoId: string; title: string; publishedAt: number }[] = [];
  let pageToken = "";

  do {
    const url = `${BASE_URL}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json() as any;

    if (data.error) {
      console.warn(`  ⚠️  Skipping playlist (might be private): ${data.error.message}`);
      return [];
    }

    for (const item of data.items ?? []) {
      const videoId = item.snippet.resourceId?.videoId;
      if (videoId && item.snippet.title !== "Private video" && item.snippet.title !== "Deleted video") {
        videos.push({
          youtubeVideoId: videoId,
          title: item.snippet.title,
          publishedAt: Date.parse(item.contentDetails?.videoPublishedAt ?? ""),
        });
      }
    }

    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  let newer = 0;
  let older = 0;
  for (let i = 1; i < videos.length; i++) {
    if (videos[i].publishedAt > videos[i - 1].publishedAt) newer++;
    else if (videos[i].publishedAt < videos[i - 1].publishedAt) older++;
  }
  if (older > newer) videos.reverse();

  // A video can sit in a playlist twice; keep its first appearance.
  const seen = new Set<string>();
  return videos.filter((v) => !seen.has(v.youtubeVideoId) && seen.add(v.youtubeVideoId)).map((v, i) => ({ youtubeVideoId: v.youtubeVideoId, title: v.title, orderIndex: i + 1 }));
}

function isConnectionError(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  return err?.code === "P1001" || err?.code === "P1017" || /can't reach database|connection|ECONNRESET|terminat|timeout|aborted/i.test(err?.message ?? "");
}

async function main() {
  console.log("🔄 Memulai sinkronisasi otomatis untuk semua Ustadz...\n");

  // 1. Ambil semua tutor yang memiliki youtubeChannelId
  const tutors = await prisma.tutor.findMany({
    where: { youtubeChannelId: { not: null } },
  });

  if (tutors.length === 0) {
    console.log("⚠️ Tidak ada Ustadz dengan Channel ID di database.");
    return;
  }

  let totalPlaylistsProcessed = 0;
  let totalVideosAdded = 0;

  // 2. Loop setiap tutor
  for (const tutor of tutors) {
    console.log(`\n======================================`);
    console.log(`✅ Tutor: ${tutor.name} (${tutor.youtubeChannelId})`);
    console.log(`======================================\n`);

    console.log("📋 Mengambil daftar playlist dari YouTube...");
    const playlists = await fetchPlaylists(tutor.youtubeChannelId!);
    console.log(`   Ditemukan ${playlists.length} playlist.\n`);

    // Playlists are identified by their YouTube ID. Rows saved before that column
    // existed have no ID yet; they are matched once by slug (same tutor only) and adopted.
    const baseSlugs = playlists.map((pl) => slugify(pl.title) || `playlist-${pl.id}`);
    const known = await prisma.playlist.findMany({
      where: {
        OR: [
          { youtubePlaylistId: { in: playlists.map((pl) => pl.id) } },
          { slug: { in: baseSlugs } },
        ],
      },
      select: { id: true, slug: true, tutorId: true, youtubePlaylistId: true, youtubeVideoCount: true },
    });
    const byYoutubeId = new Map(known.filter((r) => r.youtubePlaylistId).map((r) => [r.youtubePlaylistId!, r]));
    const bySlug = new Map(known.map((r) => [r.slug, r]));
    const claimedSlugs = new Set<string>();

    // Proses setiap playlist
    let attempt = 0;
    for (let i = 0; i < playlists.length; i++) {
      try {
        const pl = playlists[i];
        process.stdout.write(`[${i + 1}/${playlists.length}] "${pl.title}" — `);

        const baseSlug = baseSlugs[i];
        let existing = byYoutubeId.get(pl.id);

        if (!existing) {
          const legacy = bySlug.get(baseSlug);
          if (legacy && legacy.tutorId === tutor.id && !legacy.youtubePlaylistId && !claimedSlugs.has(baseSlug)) {
            existing = await prisma.playlist.update({
              where: { id: legacy.id },
              data: { youtubePlaylistId: pl.id },
              select: { id: true, slug: true, tutorId: true, youtubePlaylistId: true, youtubeVideoCount: true },
            });
          }
        }
        if (existing) claimedSlugs.add(existing.slug);

        // Skip playlists whose YouTube video count matches what we stored after the last
        // full fetch. youtubeVideoCount is only written after fetching every video, so a
        // playlist that was never fully synced (count 0) is always fetched.
        if (!FORCE && existing && existing.youtubeVideoCount === pl.itemCount) {
          process.stdout.write(`⏭️  Sudah sinkron (${pl.itemCount} video), dilewati.\n`);
          totalPlaylistsProcessed++;
          continue;
        }

        process.stdout.write(`mengambil video...`);
        const videos = await fetchVideos(pl.id);

        if (videos.length === 0) {
          process.stdout.write(` ⚠️  Kosong atau privat, dilewati.\n`);
          continue;
        }

        let dbPlaylist;
        if (existing) {
          dbPlaylist = await prisma.playlist.update({
            where: { id: existing.id },
            data: { title: pl.title, description: pl.description, thumbnailUrl: pl.thumbnail },
          });
        } else {
          // Same title as another tutor's playlist, or a twin inside this channel:
          // keep URLs unique with a short, stable suffix from the YouTube ID.
          const slug =
            bySlug.has(baseSlug) || claimedSlugs.has(baseSlug)
              ? `${baseSlug}-${pl.id.slice(-6).toLowerCase()}`
              : baseSlug;
          dbPlaylist = await prisma.playlist.create({
            data: {
              tutorId: tutor.id,
              youtubePlaylistId: pl.id,
              slug,
              title: pl.title,
              description: pl.description,
              thumbnailUrl: pl.thumbnail,
              orderIndex: i + 1,
            },
          });
          claimedSlugs.add(slug);
        byYoutubeId.set(pl.id, { ...dbPlaylist, youtubeVideoCount: 0 });
        }

        // One statement per chunk instead of one round trip per video: the database is far
        // away, and per-row upserts made a full sync take hours.
        for (let c = 0; c < videos.length; c += 500) {
          const rows = videos
            .slice(c, c + 500)
            .map((v) => Prisma.sql`(gen_random_uuid()::text, ${dbPlaylist.id}, ${v.youtubeVideoId}, ${v.title}, ${v.orderIndex})`);
          await prisma.$executeRaw`
            INSERT INTO "Video" ("id", "playlistId", "youtubeVideoId", "title", "orderIndex")
            VALUES ${Prisma.join(rows)}
            ON CONFLICT ("playlistId", "youtubeVideoId")
            DO UPDATE SET "title" = EXCLUDED."title", "orderIndex" = EXCLUDED."orderIndex"`;
        }

        // Record the count only now that every video is stored, so a run that dies
        // mid-playlist leaves it unmarked and the next run fetches it again.
        await prisma.playlist.update({
          where: { id: dbPlaylist.id },
          data: { youtubeVideoCount: pl.itemCount },
        });

        totalVideosAdded += videos.length;
        totalPlaylistsProcessed++;
        process.stdout.write(` ✅ ${videos.length} video.\n`);

        // Jeda untuk hindari rate limit
        await new Promise((r) => setTimeout(r, 200));
      } catch (e) {
        // The pooler drops the connection (and YouTube times out) now and then during a long run; redo this
        // playlist instead of losing the whole sync. Every write here is an upsert.
        if (attempt < 3 && isConnectionError(e)) {
          attempt++;
          console.warn(`\n   🔌 Koneksi database putus, mengulang playlist ini (${attempt}/3)...`);
          await new Promise((r) => setTimeout(r, 15000 * attempt));
          i--;
          continue;
        }
        throw e;
      }
      attempt = 0;
    }
  }

  console.log(`\n🎉 Sinkronisasi selesai!`);
  console.log(`   📂 ${totalPlaylistsProcessed} playlist berhasil disimpan.`);
  console.log(`   🎬 ${totalVideosAdded} video berhasil disimpan.`);
}

main()
  .catch((e) => {
    console.error("\n❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
