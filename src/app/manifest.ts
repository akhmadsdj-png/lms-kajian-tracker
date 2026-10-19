import type { MetadataRoute } from "next";

// Lets phones install Kajian Tracker to the home screen with the app icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kajian Tracker",
    short_name: "Kajian",
    description: "Ikuti kajian YouTube pertemuan demi pertemuan dan simpan progres belajarmu.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0e1116",
    theme_color: "#0e1116",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
