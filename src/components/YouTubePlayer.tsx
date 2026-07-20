"use client";

import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  dbVideoId: string;
  startSeconds?: number;
}

export function YouTubePlayer({
  videoId,
  dbVideoId,
  startSeconds = 0,
}: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<string>(`yt-player-${videoId}`);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveProgress = useCallback(
    async (currentTime: number, isCompleted: boolean) => {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: dbVideoId,
            lastWatchedSeconds: Math.floor(currentTime),
            isCompleted,
          }),
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    },
    [dbVideoId]
  );

  useEffect(() => {
    // Load the IFrame Player API script
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        width: "100%",
        height: "100%",
        videoId: videoId,
        playerVars: {
          start: Math.floor(startSeconds),
          rel: 0,
          modestbranding: 1,
          cc_load_policy: 0,
        },
        events: {
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.PAUSED) {
              const time = playerRef.current?.getCurrentTime() ?? 0;
              saveProgress(time, false);
            }

            if (event.data === window.YT.PlayerState.PLAYING) {
              // Auto-save every 15 seconds while playing
              if (saveTimeoutRef.current) {
                clearInterval(saveTimeoutRef.current);
              }
              saveTimeoutRef.current = setInterval(() => {
                const time = playerRef.current?.getCurrentTime() ?? 0;
                saveProgress(time, false);
              }, 15000);
            } else {
              if (saveTimeoutRef.current) {
                clearInterval(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
              }
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current);
      }
      if (playerRef.current) {
        // Save progress on unmount
        try {
          const time = playerRef.current.getCurrentTime();
          if (time > 0) {
            saveProgress(time, false);
          }
        } catch {
          // Player might already be destroyed
        }
        playerRef.current.destroy();
      }
    };
  }, [videoId, startSeconds, saveProgress]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/50 ring-1 ring-white/[0.06]">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <div
          id={containerRef.current}
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}
