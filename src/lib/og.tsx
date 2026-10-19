import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

// Shared pieces for the link-preview images (WhatsApp, Telegram, Facebook, X).
// Colors mirror the app's theme tokens in globals.css.

export const OG_SIZE = { width: 1200, height: 630 };

export const og = {
  paper: "#0e1116",
  surface: "#171b22",
  raised: "#212732",
  ink: "#f2f4f7",
  pencil: "#9aa3b2",
  pen: "#8fa8ff",
  penSoft: "#26304d",
};

const asset = (name: string) => readFile(join(process.cwd(), "src/assets/og", name));

async function loadFonts() {
  const [sans, sansBold, serif] = await Promise.all([
    asset("source-sans-3-400.woff"),
    asset("source-sans-3-700.woff"),
    asset("literata-600.woff"),
  ]);
  return [
    { name: "Source Sans", data: sans, weight: 400 as const, style: "normal" as const },
    { name: "Source Sans", data: sansBold, weight: 700 as const, style: "normal" as const },
    { name: "Literata", data: serif, weight: 600 as const, style: "normal" as const },
  ];
}

let logoUri: Promise<string> | undefined;
function loadLogo() {
  logoUri ??= readFile(join(process.cwd(), "public/logo.svg")).then(
    (svg) => `data:image/svg+xml;base64,${svg.toString("base64")}`,
  );
  return logoUri;
}

/** Shortens text on a word boundary so long kajian titles stay inside the card */
export function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > max * 0.6 ? cut.lastIndexOf(" ") : max).trimEnd()}…`;
}

/** Logo and name, used as the signature on every card */
export function Brand({ logo, size = 44 }: { logo: string; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
      <img src={logo} width={size} height={size} alt="" />
      <span style={{ fontSize: size * 0.72, fontWeight: 700, color: og.ink }}>Kajian Tracker</span>
    </div>
  );
}

export async function renderOg(build: (logo: string) => ReactNode) {
  const [fonts, logo] = await Promise.all([loadFonts(), loadLogo()]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: og.paper,
          color: og.ink,
          fontFamily: "Source Sans",
        }}
      >
        {build(logo)}
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
