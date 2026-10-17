/**
 * YouTube thumbnail URLs. "mq" is 320×180 (16:9, cards);
 * "hq" is 480×360 letterboxed, so crop it with object-cover for heroes.
 */
export function videoThumb(youtubeVideoId: string, size: "mq" | "hq" = "mq") {
  return `https://i.ytimg.com/vi/${youtubeVideoId}/${size}default.jpg`;
}

export function upsizeThumb(url: string | null | undefined) {
  return url?.replace("/mqdefault.jpg", "/hqdefault.jpg") ?? null;
}
