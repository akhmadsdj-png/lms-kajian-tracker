import { prisma } from "./prisma";
import { cacheLife, cacheTag } from "next/cache";

export async function getDashboardTutors() {
  "use cache";
  cacheLife("minutes");
  cacheTag("tutors");

  return prisma.tutor.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      playlists: {
        select: {
          id: true,
          slug: true,
          title: true,
          thumbnailUrl: true,
          _count: { select: { videos: true } },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDashboardUserProgress(userId: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  cacheTag("progress", `progress-${userId}`);

  return prisma.userProgress.findMany({
    where: { userId },
    select: {
      isCompleted: true,
      lastWatchedSeconds: true,
      updatedAt: true,
      video: { select: { playlistId: true, durationSeconds: true } },
    },
  });
}

export async function getTutorPageData(tutorSlug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("tutors");

  return prisma.tutor.findUnique({
    where: { slug: tutorSlug },
    select: {
      id: true,
      name: true,
      bio: true,
      slug: true,
      imageUrl: true,
      playlists: {
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          _count: { select: { videos: true } },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });
}

export async function getTutorProgress(userId: string, tutorId: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  cacheTag("progress", `progress-${userId}`);

  return prisma.userProgress.findMany({
    where: { userId, video: { playlist: { tutorId } } },
    select: {
      isCompleted: true,
      lastWatchedSeconds: true,
      video: { select: { playlistId: true } },
    },
  });
}

export async function getPlaylistPageData(playlistSlug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("tutors");

  return prisma.playlist.findUnique({
    where: { slug: playlistSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      tutor: { select: { name: true, slug: true, imageUrl: true } },
      videos: {
        select: {
          id: true,
          title: true,
          orderIndex: true,
          youtubeVideoId: true,
          durationSeconds: true,
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });
}

export async function getPlaylistProgress(userId: string, playlistId: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  cacheTag("progress", `progress-${userId}`);

  return prisma.userProgress.findMany({
    where: { userId, video: { playlistId } },
    select: { videoId: true, isCompleted: true, lastWatchedSeconds: true },
  });
}

export async function getVideoPageData(videoId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("tutors");

  return prisma.video.findUnique({
    where: { id: videoId },
    select: {
      id: true,
      youtubeVideoId: true,
      title: true,
      orderIndex: true,
      playlistId: true,
      playlist: {
        select: {
          id: true,
          slug: true,
          title: true,
          tutor: { select: { name: true, slug: true, imageUrl: true } },
        },
      },
    },
  });
}

export async function getSidebarVideos(playlistId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("tutors");

  return prisma.video.findMany({
    where: { playlistId },
    select: {
      id: true,
      title: true,
      orderIndex: true,
      youtubeVideoId: true,
      durationSeconds: true,
    },
    orderBy: { orderIndex: "asc" },
  });
}

export async function getContinueWatching(userId: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  cacheTag("progress", `progress-${userId}`);

  return prisma.userProgress.findMany({
    where: { userId, isCompleted: false, lastWatchedSeconds: { gt: 0 } },
    orderBy: { updatedAt: "desc" },
    take: 12,
    select: {
      lastWatchedSeconds: true,
      video: {
        select: {
          id: true,
          title: true,
          orderIndex: true,
          youtubeVideoId: true,
          durationSeconds: true,
          playlist: {
            select: {
              slug: true,
              title: true,
              _count: { select: { videos: true } },
              tutor: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  });
}

export async function searchCatalog(q: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("tutors");

  const match = { contains: q, mode: "insensitive" as const };
  const [playlists, videos] = await Promise.all([
    prisma.playlist.findMany({
      where: { title: match },
      take: 12,
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnailUrl: true,
        _count: { select: { videos: true } },
        tutor: { select: { name: true, slug: true } },
      },
    }),
    prisma.video.findMany({
      where: { title: match },
      take: 40,
      orderBy: [{ playlist: { orderIndex: "asc" } }, { orderIndex: "asc" }],
      select: {
        id: true,
        title: true,
        orderIndex: true,
        youtubeVideoId: true,
        durationSeconds: true,
        playlist: {
          select: {
            slug: true,
            title: true,
            tutor: { select: { name: true, slug: true, imageUrl: true } },
          },
        },
      },
    }),
  ]);
  return { playlists, videos };
}
