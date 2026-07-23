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
      playlists: {
        select: {
          id: true,
          videos: { select: { id: true } },
        },
      },
    },
  });
}

export async function getDashboardUserProgress(userId: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  cacheTag("progress", `progress-${userId}`);

  return prisma.userProgress.findMany({
    where: { userId },
    select: { videoId: true, isCompleted: true, lastWatchedSeconds: true },
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
      playlists: {
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          videos: { select: { id: true } },
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
    select: { videoId: true, isCompleted: true, lastWatchedSeconds: true },
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
      tutor: { select: { name: true, slug: true } },
      videos: {
        select: { id: true, title: true, orderIndex: true },
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
          tutor: { select: { name: true, slug: true } },
        },
      },
    },
  });
}

export async function getVideoProgress(userId: string, videoId: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  cacheTag("progress", `progress-${userId}`);

  return prisma.userProgress.findUnique({
    where: { userId_videoId: { userId, videoId } },
    select: { lastWatchedSeconds: true, isCompleted: true },
  });
}

export async function getSidebarVideos(playlistId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("tutors");

  return prisma.video.findMany({
    where: { playlistId },
    select: { id: true, title: true, orderIndex: true },
    orderBy: { orderIndex: "asc" },
  });
}
