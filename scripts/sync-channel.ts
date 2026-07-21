/**
 * Script: sync-channel.ts
 * Mengambil semua playlist dan video dari channel YouTube Ustadz Firanda Andirja
 * lalu menyimpannya ke database Supabase via Prisma.
 *
 * Cara menjalankan:
 *   npx tsx scripts/sync-channel.ts
 */

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID = "UCm44PmruoSbuNbZn7jFeXUw"; // Firanda Andirja Official
const TUTOR_SLUG = "ustadz-firanda-andirja";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

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
  const playlists: { id: string; title: string; description: string; thumbnail: string }[] = [];
  let pageToken = "";

  do {
    const url = `${BASE_URL}/playlists?part=snippet&channelId=${channelId}&maxResults=50&pageToken=${pageToken}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
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
      });
    }

    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return playlists;
}

// Fetch all videos from a playlist
async function fetchVideos(playlistId: string) {
  const videos: { youtubeVideoId: string; title: string; orderIndex: number }[] = [];
  let pageToken = "";
  let order = 1;

  do {
    const url = `${BASE_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${pageToken}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
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
          orderIndex: order++,
        });
      }
    }

    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return videos;
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

    // Proses setiap playlist
    for (let i = 0; i < playlists.length; i++) {
      const pl = playlists[i];
      process.stdout.write(`[${i + 1}/${playlists.length}] "${pl.title}" — mengambil video...`);

      let slug = slugify(pl.title);
      if (!slug) slug = `playlist-${pl.id}`;

      const videos = await fetchVideos(pl.id);

      if (videos.length === 0) {
        process.stdout.write(` ⚠️  Kosong atau privat, dilewati.\n`);
        continue;
      }

      const dbPlaylist = await prisma.playlist.upsert({
        where: { slug },
        update: {
          title: pl.title,
          description: pl.description,
          thumbnailUrl: pl.thumbnail,
        },
        create: {
          tutorId: tutor.id,
          slug,
          title: pl.title,
          description: pl.description,
          thumbnailUrl: pl.thumbnail,
          orderIndex: i + 1,
        },
      });

      for (const video of videos) {
        await prisma.video.upsert({
          where: {
            playlistId_youtubeVideoId: {
              playlistId: dbPlaylist.id,
              youtubeVideoId: video.youtubeVideoId,
            },
          },
          update: {
            title: video.title,
            orderIndex: video.orderIndex,
          },
          create: {
            playlistId: dbPlaylist.id,
            youtubeVideoId: video.youtubeVideoId,
            title: video.title,
            orderIndex: video.orderIndex,
          },
        });
        
        // Jeda sangat kecil per video agar Supabase Connection Pool bisa bernapas
        await new Promise((r) => setTimeout(r, 20));
      }

      totalVideosAdded += videos.length;
      totalPlaylistsProcessed++;
      process.stdout.write(` ✅ ${videos.length} video.\n`);

      // Jeda untuk hindari rate limit
      await new Promise((r) => setTimeout(r, 200));
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
