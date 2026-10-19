import { Brand, OG_SIZE, og, renderOg } from "@/lib/og";

export const alt = "Kajian Tracker: ikuti kajian YouTube para ustadz sampai tuntas";
export const size = OG_SIZE;
export const contentType = "image/png";

// Site-wide preview, also used by pages that don't have their own
export default function Image() {
  return renderOg((logo) => (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "64px 72px" }}>
      <Brand logo={logo} />

      <div
        style={{
          marginTop: 48,
          fontFamily: "Literata",
          fontSize: 60,
          lineHeight: 1.15,
          maxWidth: 1000,
        }}
      >
        Ikuti kajian sampai tuntas, pertemuan demi pertemuan.
      </div>
      <div style={{ marginTop: 20, fontSize: 30, lineHeight: 1.35, color: og.pencil, maxWidth: 900 }}>
        Kajian YouTube para ustadz tersusun per playlist. Progresmu tercatat, dan kamu bisa lanjut dari menit
        terakhir.
      </div>

      {/* The app's signature element: a playlist progress bar */}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: og.pencil }}>
            <span style={{ color: og.ink, fontWeight: 700 }}>48 dari 121 pertemuan selesai</span>
            <span>40%</span>
          </div>
          <div style={{ marginTop: 14, display: "flex", height: 16, borderRadius: 8, background: og.raised }}>
            <div style={{ width: "40%", height: 16, borderRadius: 8, background: og.pen }} />
          </div>
        </div>
        <span style={{ fontSize: 30, fontWeight: 700, color: og.pen }}>kajiantracker.com</span>
      </div>
    </div>
  ));
}
