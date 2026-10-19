import { Brand, OG_SIZE, og, renderOg } from "@/lib/og";
import { getTutorPageData } from "@/lib/queries";

export const alt = "Kajian seorang ustadz di Kajian Tracker";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ tutorSlug: string }> }) {
  const { tutorSlug } = await params;
  const tutor = await getTutorPageData(tutorSlug);
  if (!tutor) return new Response("Not found", { status: 404 });

  const totalVideos = tutor.playlists.reduce((n, p) => n + p._count.videos, 0);

  return renderOg((logo) => (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "56px 64px" }}>
      <div style={{ display: "flex", gap: 56, alignItems: "center", flexGrow: 1 }}>
        {tutor.imageUrl && (
          <img
            src={tutor.imageUrl}
            width={260}
            height={260}
            alt=""
            style={{ borderRadius: 130, objectFit: "cover", border: `6px solid ${og.penSoft}` }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", width: 740 }}>
          <div style={{ fontFamily: "Literata", fontSize: tutor.name.length > 22 ? 56 : 66, lineHeight: 1.12 }}>{tutor.name}</div>
          <span style={{ marginTop: 20, fontSize: 32, color: og.pencil }}>
            {tutor.playlists.length} playlist, {totalVideos.toLocaleString("id-ID")} pertemuan
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
        <span style={{ fontSize: 26, color: og.pencil }}>Ikuti kajiannya sampai tuntas</span>
      </div>
    </div>
  ));
}
