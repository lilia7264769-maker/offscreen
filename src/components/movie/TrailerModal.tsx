"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import ChevronsRightIcon from "@/components/icons/ChevronsRightIcon";
import XmarkIcon from "@/components/icons/XmarkIcon";
import ClapperboardIcon from "@/components/icons/ClapperboardIcon";

// Methods available on the YouTube player instance
interface YouTubePlayer {
  destroy(): void;
  mute(): void;
  playVideo(): void;
}

interface YouTubePlayerEvent {
  target: YouTubePlayer;
}

// Extend the global Window object with types for the external YouTube IFrame API
declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars: {
            autoplay: 1; // Auto-start playback once loaded
            playsinline: 1; // Play inline on mobile instead of forcing fullscreen
            origin: string; // Current site address required by YouTube API for security
          };
          events: {
            // Когда плеер будет готов, выполни эту функцию
            onReady: (event: YouTubePlayerEvent) => void;
          };
        },
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | undefined; // Singleton promise to ensure the YouTube IFrame API script is loaded only once

// отвечает за умную однократную загрузку скрипта* YouTube на страницу, скачивает их библиотеку
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve(); // код в useEffect мгновенно переходит в .then(...)
  if (youtubeApiPromise) return youtubeApiPromise; // если в процессе то ждать а не создавать еще один скрипт

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady; // если в другом месте сайта был вызван. ато он сотрется та ф и тот блок сломается
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.(); // вызываете старую
      resolve(); // потом запускаете свою
    };

    const script = document.createElement("script");
    // подключение API
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      youtubeApiPromise = undefined;
      reject(new Error("Failed to load the YouTube IFrame API")); // в useEffect срабатывает блок .catch(...)
    };
    document.head.appendChild(script); //  браузер начинает реальное скачивание файла с серверов YouTube
  });

  return youtubeApiPromise;
}

interface TrailerModalProps {
  trailerKeys: string[]; // e.g., ["abc123", "xyz456"]
  isOpen: boolean;
  movieId?: number;
  onClose: () => void;
}

export default function TrailerModal({
  trailerKeys,
  isOpen,
  movieId,
  onClose,
}: TrailerModalProps) {
  const [activeTrailerIndex, setActiveTrailerIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Reset trailer index to the first video when closing the modal
  const handleClose = useCallback(() => {
    setActiveTrailerIndex(0);
    onClose();
  }, [onClose]);

  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const hasTrailers = trailerKeys.length > 0;
  const activeTrailer = trailerKeys[activeTrailerIndex];

  // Initialize and clean up the YouTube player when the modal opens or trailer changes
  useEffect(() => {
    if (!isOpen || !activeTrailer || !playerContainerRef.current) return; // Guard clause

    let isCancelled = false;
    let player: YouTubePlayer | undefined; // Сюда позже положим пульт от плеера
    const container = playerContainerRef.current; // Запоминаем наш пустой <div>

    loadYouTubeApi()
      // если загрузка успешна, выполни этот код
      .then(() => {
        if (isCancelled || !container.isConnected || !window.YT) return; // 4. Скрипт скачался! Но пока он качался, пользователь мог уже закрыть окно (isCancelled стал true)

        setHasError(false);

        // Создаем плеер: передаем (container) и настройки. YouTube сам превращает <div> в <iframe>
        player = new window.YT.Player(container, {
          videoId: activeTrailer,
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              target.playVideo();
            },
          },
        });
      })

      // если загрузка завершилась ошибкой, обработай её
      .catch((error: unknown) => {
        console.error("Failed to initialize the YouTube player:", error);
        setHasError(true);
      });

    // Destroy the previous player instance on trailer switch or modal close
    return () => {
      isCancelled = true;
      player?.destroy();
    };
  }, [activeTrailer, isOpen]); // dependencies array

  if (!isOpen) return null; // загрузка самого компонента происходит пр загрузке домстр еще до нажатия кнопки просто без отобр мод окна и загрузки апи ютуба

  return (
    // Backdrop overlay: closes the modal when clicked outside the dialog box
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3"
      onClick={handleClose}
    >
      {/* Modal dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Movie trailers"
        className="w-full max-w-5xl rounded-[var(--radius-card)] bg-[#181818] py-3"
        // Prevent clicks inside the modal from bubbling up to the backdrop and closing it
        onClick={(event) => event.stopPropagation()} // Иначе клик внутри модального окна тоже дошёл бы до внешнего div, который закрыл бы окно.
      >
        {/* Close button */}
        <div className="flex items-start justify-end">
          <button
            type="button"
            aria-label="Close trailers"
            onClick={handleClose}
            className="text-[var(--color-white)] opacity-70  px-3 transition-opacity hover:opacity-100"
          >
            <XmarkIcon className="h-6 w-6" />
          </button>
        </div>

        {hasTrailers && !hasError ? (
          <>
            {/* Trailer selection tabs */}
            <div className="flex flex-nowrap gap-6 overflow-x-auto px-4 pt-3 pb-4 mb-1 scrollbar-none">
              {trailerKeys.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={activeTrailerIndex === index}
                  onClick={() => setActiveTrailerIndex(index)}
                  className={`relative shrink-0 whitespace-nowrap text-[var(--color-white)] text-[14px] uppercase transition-transform hover:scale-105 md:text-[16px] ${
                    activeTrailerIndex === index ? "opacity-100" : "opacity-40"
                  }`}
                >
                  Trailer {index + 1}
                  {activeTrailerIndex === index && (
                    <span className="absolute top-6 left-0 h-[2px] w-full bg-white" />
                  )}
                </button>
              ))}
            </div>
            {/* 16:9 video wrapper: YouTube IFrame API */}
            <div className="md:px-2">
              <div className="aspect-video w-full overflow-hidden rounded-none md:rounded-[var(--radius-badge)]">
                <div
                  ref={playerContainerRef}
                  title={`Trailer ${activeTrailerIndex + 1}`}
                  className="h-full w-full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 px-4 pb-5 pt-3 md:flex-row md:items-center sm:justify-between">
              {movieId && (
                <Button
                  variant="modal"
                  href={`/movie/${movieId}`}
                  onClick={() => {
                    handleClose();
                  }}
                >
                  View Details
                  <ChevronsRightIcon size={16} />
                </Button>
              )}

              {/* External YouTube fallback link */}
              <div className="flex justify-end ">
                <a
                  href={`https://www.youtube.com/watch?v=${activeTrailer}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[var(--color-white)] underline opacity-[70%] font-normal"
                >
                  Can&apos;t play? Watch on YouTube
                </a>
              </div>
            </div>
          </>
        ) : (
          <div
            role="status"
            className="flex aspect-video w-full flex-col items-center justify-center gap-6 rounded-[var(--radius-card)] bg-[#242424]"
          >
            <ClapperboardIcon size={48} className="text-[#858B99]" />
            <p className="text-center text-[15px] text-[#B5BAC5]">
              {hasError
                ? "Unable to load the trailer. Please try again later."
                : "No trailers available for this movie."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
