"use client";

import Image from "next/image";
import { useState } from "react";
import HorizontalMediaRow from "@/components/movie/HorizontalMediaRow";
import TrailerModal from "@/components/movie/TrailerModal";

interface MovieTrailerRowProps {
  movieId: number;
  movieTitle: string;
  trailerKeys: string[];
}

export default function MovieTrailerRow({
  movieId,
  movieTitle,
  trailerKeys,
}: MovieTrailerRowProps) {
  const [activeTrailer, setActiveTrailer] = useState<number | null>(null);

  return (
    <>
      <HorizontalMediaRow title="Trailers & Teasers">
        {trailerKeys.slice(0, 12).map((key, index) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTrailer(index)}
            aria-label={`Play trailer ${index + 1} for ${movieTitle}`}
            className="group relative aspect-video w-[min(82vw,360px)] shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-bg-grey)]"
          >
            <Image
              src={`https://img.youtube.com/vi/${key}/hqdefault.jpg`}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 640px) 82vw, 360px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
            <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-brand-blue)] text-xs font-bold text-white">
              WATCH
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2 text-left text-sm font-semibold text-white">
              {index === 0 ? "FIRST LOOK" : "OFFICIAL TRAILER"}
            </span>
          </button>
        ))}
      </HorizontalMediaRow>
      <TrailerModal
        key={`${movieId}-${activeTrailer ?? 0}`}
        trailerKeys={
          activeTrailer === null ? [] : trailerKeys.slice(activeTrailer)
        }
        isOpen={activeTrailer !== null}
        onClose={() => setActiveTrailer(null)}
      />
    </>
  );
}
