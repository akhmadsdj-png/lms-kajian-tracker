"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const DISMISS_KEY = "install-prompt-dismissed-at";
const SNOOZE_DAYS = 14;
const SHOW_AFTER_MS = 6000;

// Chromium's install event (not in the TS DOM lib)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function snoozed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    return Date.now() - at < SNOOZE_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

/**
 * "Pasang di layar utama" sheet. Chromium browsers get a real install button
 * (beforeinstallprompt); iPhone/iPad get Safari's Share → Add to Home Screen steps.
 */
export function InstallPrompt() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<"hidden" | "button" | "ios">("hidden");

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if (isStandalone() || snoozed()) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onPrompt = (e: Event) => {
      e.preventDefault(); // keep Chrome's mini-infobar from appearing; we show our own
      setInstallEvent(e as BeforeInstallPromptEvent);
      timer = setTimeout(() => setMode("button"), SHOW_AFTER_MS);
    };
    const onInstalled = () => setMode("hidden");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (isIOS()) timer = setTimeout(() => setMode("ios"), SHOW_AFTER_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setMode("hidden");
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "accepted") setMode("hidden");
    else dismiss();
  }

  if (mode === "hidden" || pathname.startsWith("/admin")) return null;

  return (
    <div
      role="dialog"
      aria-label="Pasang Kajian Tracker"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-rule bg-surface p-4 shadow-2xl shadow-black/60 sm:bottom-5"
    >
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- small static icon */}
        <img src="/icon-192.png" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl bg-paper p-1" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">Pasang Kajian Tracker</p>
          {mode === "button" ? (
            <p className="mt-0.5 text-sm text-pencil">
              Buka langsung dari layar utama, tampil penuh tanpa bilah browser. Tidak perlu unduh dari Play Store.
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-pencil">
              Tekan{" "}
              <span className="inline-flex translate-y-0.5 items-center" aria-label="ikon Bagikan">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path d="M12 3v12M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
                </svg>
              </span>{" "}
              <b className="text-ink">Bagikan</b> di bawah layar, lalu pilih <b className="text-ink">Tambah ke Layar Utama</b>.
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={dismiss} className="rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-raised">
          {mode === "button" ? "Nanti saja" : "Mengerti"}
        </button>
        {mode === "button" && (
          <button onClick={install} className="rounded-full bg-pen px-4 py-1.5 text-sm font-bold text-paper hover:opacity-90">
            Pasang
          </button>
        )}
      </div>
    </div>
  );
}
