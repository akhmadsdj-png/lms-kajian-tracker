"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

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

// Kajian often close with a doa and an outro people skip, so the last 5% counts as finished.
const COMPLETE_AT = 0.95;

export function YouTubePlayer({
  videoId,
  dbVideoId,
  startSeconds = 0,
}: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<string>(`yt-player-${videoId}`);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completedSentRef = useRef(false);
  const router = useRouter();
  // Read only when the player is (re)built: the refresh after finishing changes startSeconds,
  // and rebuilding then would restart playback.
  const startSecondsRef = useRef(startSeconds);

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

  // Saves the position, marking the pertemuan finished (once) when the video ended or the
  // viewer reached the last stretch; the page then refreshes so the button and list update.
  const savePosition = useCallback(
    async (ended = false) => {
      const player = playerRef.current;
      const time = player?.getCurrentTime() ?? 0;
      const duration = player?.getDuration() ?? 0;
      const finished = ended || (duration > 0 && time >= duration * COMPLETE_AT);
      if (finished && !completedSentRef.current) {
        completedSentRef.current = true;
        await saveProgress(time, true);
        router.refresh();
        return;
      }
      await saveProgress(time, false);
    },
    [saveProgress, router]
  );

  useEffect(() => {
    startSecondsRef.current = startSeconds;
  }, [startSeconds]);

  useEffect(() => {
    completedSentRef.current = false;

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
          start: Math.floor(startSecondsRef.current),
          rel: 0,
          modestbranding: 1,
          cc_load_policy: 0,
        },
        events: {
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.PAUSED) {
              savePosition();
            }

            if (event.data === window.YT.PlayerState.ENDED) {
              savePosition(true);
            }

            if (event.data === window.YT.PlayerState.PLAYING) {
              // Auto-save every 15 seconds while playing
              if (saveTimeoutRef.current) {
                clearInterval(saveTimeoutRef.current);
              }
              saveTimeoutRef.current = setInterval(() => savePosition(), 15000);
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
  }, [videoId, saveProgress, savePosition]);

  return (
    <div className="relative w-full overflow-hidden bg-black">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <div
          id={containerRef.current}
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}
