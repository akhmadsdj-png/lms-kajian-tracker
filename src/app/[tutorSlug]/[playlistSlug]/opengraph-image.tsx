import { Brand, OG_SIZE, clip, og, renderOg } from "@/lib/og";
import { formatTotalDuration } from "@/lib/format";
import { getPlaylistPageData } from "@/lib/queries";
import { upsizeThumb } from "@/lib/youtube";

export const alt = "Playlist kajian di Kajian Tracker";
export const size = OG_SIZE;
export const contentType = "image/png";

// Preview for a playlist link; video pages inside it share the same card
export default async function Image({ params }: { params: Promise<{ playlistSlug: string }> }) {
  const { playlistSlug } = await params;
  const playlist = await getPlaylistPageData(playlistSlug);
  if (!playlist) return new Response("Not found", { status: 404 });

  const totalSeconds = playlist.videos.reduce((n, v) => n + (v.durationSeconds ?? 0), 0);
  const cover = upsizeThumb(playlist.thumbnailUrl);
  const title = clip(playlist.title, 90);

  return renderOg((logo) => (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "56px 64px" }}>
      <div style={{ display: "flex", gap: 48, alignItems: "center", flexGrow: 1 }}>
        {cover && (
          // YouTube's hqdefault is 4:3 with black bars baked in; crop to the 16:9 picture
          <div style={{ display: "flex", width: 480, height: 270, borderRadius: 20, overflow: "hidden", flexShrink: 0 }}>
            <img src={cover} width={480} height={360} alt="" style={{ marginTop: -45 }} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", width: 540 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: og.pen }}>{playlist.tutor.name}</span>
          <div
            style={{
              marginTop: 14,
              fontFamily: "Literata",
              fontSize: title.length > 50 ? 46 : 56,
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          <span style={{ marginTop: 20, fontSize: 28, color: og.pencil }}>
            {playlist.videos.length} pertemuan
            {totalSeconds > 0 ? `, total ${formatTotalDuration(totalSeconds)}` : ""}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `2px solid ${og.raised}`,
          paddingTop: 28,
        }}
      >
        <Brand logo={logo} size={40} />
        <span style={{ fontSize: 26, color: og.pencil }}>Catat progresmu tiap pertemuan</span>
      </div>
    </div>
  ));
}
