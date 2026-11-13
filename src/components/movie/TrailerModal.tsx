"use client";

import { useEffect, useRef, useState } from "react";
import XmarkIcon from "@/components/icons/XmarkIcon";
import ClapperboardIcon from "@/components/icons/ClapperboardIcon";

interface YouTubePlayer {
  destroy(): void;
  mute(): void;
  playVideo(): void;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars: {
            autoplay: 1;
            playsinline: 1;
            origin: string;
          };
          events: {
            onReady: (event: YouTubePlayerEvent) => void;
          };
        },
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | undefined;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      youtubeApiPromise = undefined;
      reject(new Error("Failed to load the YouTube IFrame API"));
    };
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

interface TrailerModalProps {
  trailerKeys: string[]; // ["abc123", "xyz456", "qwe789"] типо так
  isOpen: boolean;
  onClose: () => void;
}

export default function TrailerModal({
  trailerKeys,
  isOpen,
  onClose,
}: TrailerModalProps) {
  const [activeTrailerIndex, setActiveTrailerIndex] = useState(0);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const hasTrailers = trailerKeys.length > 0;
  const activeTrailer = trailerKeys[activeTrailerIndex];

  useEffect(() => {
    if (!isOpen || !activeTrailer || !playerContainerRef.current) return;

    let isCancelled = false;
    let player: YouTubePlayer | undefined;
    const container = playerContainerRef.current;

    loadYouTubeApi()
      .then(() => {
        if (isCancelled || !container.isConnected || !window.YT) return;

        player = new window.YT.Player(container, {
          videoId: activeTrailer,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              target.mute();
              target.playVideo();
            },
          },
        });
      })
      .catch((error: unknown) => {
        console.error("Failed to initialize the YouTube player:", error);
      });

    return () => {
      isCancelled = true;
      player?.destroy();
    };
  }, [activeTrailer, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Movie trailers"
        className="w-full max-w-5xl rounded-[var(--radius-card)] bg-[#181818] px-4 pt-4 pb-8"
        onClick={(event) => event.stopPropagation()} // Иначе клик внутри модального окна тоже дошёл бы до внешнего div, который закрыл бы окно.
      >
        <div className="flex items-start justify-end">
          <button
            type="button"
            aria-label="Close trailers"
            onClick={onClose}
            className="text-[var(--color-white)] opacity-70 transition-opacity hover:opacity-100"
          >
            <XmarkIcon className="h-6 w-6" />
          </button>
        </div>
        {hasTrailers ? (
          <>
            <div className="mb-4 flex gap-6">
              {trailerKeys.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={activeTrailerIndex === index}
                  onClick={() => setActiveTrailerIndex(index)}
                  className={`text-[var(--color-white)] uppercase transition-transform hover:scale-105 ${
                    activeTrailerIndex === index ? "opacity-40" : "opacity-100"
                  }`}
                >
                  Trailer {index + 1}
                </button>
              ))}
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-[var(--radius-badge)]">
              <div
                ref={playerContainerRef}
                title={`Trailer ${activeTrailerIndex + 1}`}
                className="h-full w-full"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <a
                href={`https://www.youtube.com/watch?v=${activeTrailer}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[var(--color-white)] underline opacity-[70%] font-normal"
              >
                Can&apos;t play? Watch on YouTube
              </a>
            </div>
          </>
        ) : (
          <div
            role="status"
            className="flex aspect-video w-full flex-col items-center justify-center gap-6 rounded-[var(--radius-card)] bg-[#242424]"
          >
            <ClapperboardIcon size={48} className="text-[#858B99]" />
            <p className="text-center text-[15px] text-[#B5BAC5]">
              No trailers available for this movie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
