/**
 * Script: backfill-youtube-meta.ts
 * Mengisi data YouTube yang masih kosong: durasi video dan foto channel pengajar.
 * Hanya menyentuh kolom yang NULL, jadi aman dijalankan berulang kali.
 *
 * Cara menjalankan:
 *   npx tsx scripts/backfill-youtube-meta.ts
 */

import { Prisma, PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// "PT1H23M5S" → 4985. Upcoming lives/premieres have no duration yet → null, retried next run.
function parseIsoDuration(iso: string | undefined): number | null {
  if (!iso) return null;
  const m = iso.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const [, d, h, min, s] = m.map((x) => Number(x ?? 0));
  return d * 86400 + h * 3600 + min * 60 + s;
}

async function youtube<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", YOUTUBE_API_KEY);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube ${endpoint} ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function backfillDurations() {
  const rows = await prisma.video.findMany({
    where: { durationSeconds: null },
    select: { youtubeVideoId: true },
    distinct: ["youtubeVideoId"],
  });
  const ids = rows.map((r) => r.youtubeVideoId);
  console.log(`⏱  ${ids.length} video tanpa durasi`);

  let updated = 0;
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const data = await youtube<{
      items: { id: string; contentDetails?: { duration?: string } }[];
    }>("videos", { part: "contentDetails", id: batch.join(","), maxResults: "50" });

    const values = data.items
      .map((item) => [item.id, parseIsoDuration(item.contentDetails?.duration)] as const)
      .filter((v): v is readonly [string, number] => v[1] !== null);
    if (values.length === 0) continue;

    updated += await prisma.$executeRaw`
      UPDATE "Video" AS v SET "durationSeconds" = x.d
      FROM (VALUES ${Prisma.join(values.map(([id, d]) => Prisma.sql`(${id}, ${d}::int)`))}) AS x(id, d)
      WHERE v."youtubeVideoId" = x.id AND v."durationSeconds" IS NULL
    `;
    console.log(`   ${Math.min(i + 50, ids.length)}/${ids.length}`);
  }
  console.log(`✅ Durasi terisi untuk ${updated} baris video`);
}

async function backfillTutorImages() {
  const tutors = await prisma.tutor.findMany({
    where: { imageUrl: null, youtubeChannelId: { not: null } },
    select: { id: true, name: true, youtubeChannelId: true },
  });

  type ChannelList = { items?: { snippet: { thumbnails: { medium?: { url: string } } } }[] };

  for (const tutor of tutors) {
    const channel = tutor.youtubeChannelId!;
    // Channel IDs start with UC; anything else is treated as a @handle
    const data = await youtube<ChannelList>("channels", {
      part: "snippet",
      ...(channel.startsWith("UC") ? { id: channel } : { forHandle: `@${channel.replace(/^@/, "")}` }),
    });
    const url = data.items?.[0]?.snippet.thumbnails.medium?.url;
    if (!url) {
      console.log(`⚠️  Foto channel tidak ditemukan: ${tutor.name} (${channel})`);
      continue;
    }
    await prisma.tutor.update({ where: { id: tutor.id }, data: { imageUrl: url } });
    console.log(`✅ Foto channel: ${tutor.name}`);
  }
}

async function main() {
  await backfillDurations();
  await backfillTutorImages();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
