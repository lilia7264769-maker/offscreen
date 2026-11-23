"use client";

import { useState } from "react";
import HorizontalMediaRow from "@/components/movie/HorizontalMediaRow";
import TrailerCard from "@/components/movie/trailers/TrailerCard";
import TrailerModal from "@/components/movie/trailers/TrailerModal";
import type { MovieTrailer } from "@/lib/videos";

interface MovieTrailersProps {
  movieId: number;
  movieTitle: string;
  trailers: MovieTrailer[];
}

export default function MovieTrailers({
  movieId,
  movieTitle,
  trailers,
}: MovieTrailersProps) {
  const [activeTrailer, setActiveTrailer] = useState<number | null>(null);
  const visibleTrailers = trailers.slice(0, 12);

  return (
    <>
      <HorizontalMediaRow title="Trailers & Teasers">
        {visibleTrailers.map((trailer, index) => (
          <TrailerCard
            key={trailer.key}
            trailerKey={trailer.key}
            movieTitle={movieTitle}
            index={index}
            label={index === 0 ? "FIRST LOOK" : "OFFICIAL TRAILER"}
            onPlay={() => setActiveTrailer(index)}
          />
        ))}
      </HorizontalMediaRow>
      <TrailerModal
        key={`${movieId}-${activeTrailer ?? 0}`}
        trailerKeys={
          activeTrailer === null
            ? []
            : trailers.slice(activeTrailer).map((trailer) => trailer.key)
        }
        isOpen={activeTrailer !== null}
        onClose={() => setActiveTrailer(null)}
      />
    </>
  );
}
