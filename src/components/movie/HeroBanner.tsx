"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TrailerModal from "@/components/movie/trailers/TrailerModal";
import Image from "next/image";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ChevronsRightIcon from "@/components/icons/ChevronsRightIcon";
import StarIcon from "@/components/icons/StarIcon";
import SwitchIcon from "../icons/SwitchIcon";
import type { HeroMovie } from "@/types/movie";

interface HeroBannerProps {
  movies: HeroMovie[];
}

export default function HeroBanner({ movies }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const slides = movies.filter(
    (movie): movie is HeroMovie & { backdropPath: string } =>
      Boolean(movie.backdropPath),
  );
  const movie = slides[activeIndex];

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  };
  const showNext = () => {
    setActiveIndex((index) => (index + 1) % slides.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    if (
      event.target instanceof Element &&
      event.target.closest("button, a, input, textarea, select")
    ) {
      touchStart.current = null;
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return;
    }

    if (deltaX < 0) showNext();
    else showPrevious();
  };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % slides.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  if (!movie) return null;

  return (
    <>
      <section
        id="hero-banner"
        className="mb-4 relative isolate h-[500px] touch-pan-y overflow-hidden md:h-[600px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
      >
        {/* Background image */}
        <Image
          src={movie.backdropPath}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />

        {/* Radial vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.05) 66%, rgba(0,0,0,0.4) 100%)",
          }}
        />

        {/* Text gradients */}
        <div
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.65) 16%, rgba(0,0,0,0.60) 22%, rgba(0,0,0,0.3) 38%, rgba(0,0,0,0.1) 44%, rgba(0,0,0,0.01) 50%, rgba(0,0,0,0) 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.58) 34%, rgba(0,0,0,0.18) 68%, rgba(0,0,0,0) 100%)",
          }}
        />

        {/* Hero content */}
        {/* pointer-events-none -- этот слой не перехватывает клики  а то что внутри да pointer-events-auto ... */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end">
          <div className="container-grid flex w-full flex-col items-center gap-6 pb-6 md:gap-14 md:pb-8">
            <div className="flex w-full flex-col items-start gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
              {/* Left side */}
              <div className="flex w-full flex-col items-start gap-4 text-[var(--color-white)] md:max-w-[500px] md:gap-6">
                <Badge variant="gradient" compactMobile>
                  new this month
                </Badge>

                <h1 className="pointer-events-auto break-words text-[36px] font-black leading-tight drop-shadow-sm md:text-5xl">
                  <Link
                    href={`/movie/${movie.id}`}
                    draggable={false}
                    className="transition-opacity hover:opacity-80"
                  >
                    {movie.title}
                  </Link>
                </h1>

                {movie.overview && (
                  <p className="hidden text-[14px] font-light text-[var(--color-white)]/80 line-clamp-3 leading-relaxed drop-shadow-sm md:block">
                    {movie.overview}
                  </p>
                )}

                {/* характеристики */}
                <div className="flex w-full min-w-0 flex-nowrap items-center gap-1 overflow-hidden whitespace-nowrap md:flex-wrap md:gap-2 md:overflow-visible md:whitespace-normal">
                  {movie.releaseYear && (
                    <Badge variant="dark" compactMobile>
                      {movie.releaseYear}
                    </Badge>
                  )}

                  {movie.rating > 0 && (
                    <Badge variant="dark" compactMobile>
                      <StarIcon />
                      {movie.rating.toFixed(1)}
                    </Badge>
                  )}

                  {movie.genres?.length > 0 && (
                    <Badge variant="dark" compactMobile>
                      {movie.genres.slice(0, 3).join(", ")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right side */}
              <div className="pointer-events-auto flex w-full shrink-0 flex-row items-center justify-end md:w-auto md:flex-col md:items-end md:gap-[260px]">
                <div className="hidden items-center gap-4 md:flex">
                  <button
                    type="button"
                    aria-label="Previous banner"
                    onClick={showPrevious}
                    className="group flex items-center justify-center rounded-full text-[var(--color-white)]"
                  >
                    <SwitchIcon className="-scale-x-100" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next banner"
                    onClick={showNext}
                    className="group flex items-center justify-center rounded-full text-[var(--color-white)]"
                  >
                    <SwitchIcon />
                  </button>
                </div>

                <div className="hidden md:block">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsTrailerOpen(true);
                    }}
                  >
                    Watch Trailer
                    <ChevronsRightIcon />
                  </Button>
                </div>
              </div>
            </div>

            {/* Индикаторы по центру под основным содержимым */}
            <div className="pointer-events-auto flex items-center justify-center gap-3 md:gap-4">
              {slides.map((slide, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Show banner ${index + 1}: ${slide.title}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setActiveIndex(index)}
                    className={`hero-indicator rounded-full bg-[var(--color-white)] transition-all duration-300 ${
                      isActive
                        ? "w-10 opacity-100 md:w-24 "
                        : "w-5 opacity-50 md:w-12"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <TrailerModal
        key={movie.id}
        trailerKeys={movie.trailerKeys}
        isOpen={isTrailerOpen}
        movieId={movie.id}
        onClose={() => setIsTrailerOpen(false)}
      />
    </>
  );
}
