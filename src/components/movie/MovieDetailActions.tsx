"use client";

import { useState } from "react";
import HeartIcon from "@/components/icons/HeartIcon";
import TrailerModal from "@/components/movie/TrailerModal";

interface MovieDetailActionsProps {
  movieId: number;
  trailerKeys: string[];
  compact?: boolean;
}

export default function MovieDetailActions({
  movieId,
  trailerKeys,
  compact = false,
}: MovieDetailActionsProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTrailer, setActiveTrailer] = useState<number | null>(null);

  if (compact) {
    return (
      <RatingControl
        rating={rating}
        onChange={setRating}
        compact
      />
    );
  }

  return (
    <>
      <div className="flex w-full flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTrailer(0)}
          disabled={trailerKeys.length === 0}
          className="inline-flex h-11 items-center gap-3 rounded-full bg-[var(--color-brand-blue)] px-6 text-sm font-bold uppercase text-white transition-colors hover:bg-[var(--color-brand-blue-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Watch trailer
          <span aria-hidden="true">»</span>
        </button>
        <button
          type="button"
          aria-pressed={isFavorite}
          aria-label={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          onClick={() => setIsFavorite((favorite) => !favorite)}
          className={`group flex size-11 items-center justify-center rounded-full border border-transparent transition-colors hover:text-[var(--color-brand-blue)] ${
            isFavorite
              ? "text-[var(--color-brand-blue)]"
              : "text-[var(--color-black)]"
          }`}
        >
          <HeartIcon filled={isFavorite} />
        </button>
      </div>

      <div className="mt-7 w-full md:hidden">
        <RatingControl rating={rating} onChange={setRating} />
      </div>

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

interface RatingControlProps {
  rating: number | null;
  onChange: (value: number) => void;
  compact?: boolean;
}

function RatingControl({ rating, onChange, compact = false }: RatingControlProps) {
  return (
    <div className={compact ? "w-full max-w-[360px]" : "w-full"}>
      <p className="mb-2 text-sm text-[var(--color-black-mid)]">Add Rating</p>
      <div className="flex items-center justify-between gap-1 rounded-[var(--radius-badge)] bg-[#edf2fa] p-1">
        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`Rate ${value} out of 10`}
            aria-pressed={rating === value}
            onClick={() => onChange(value)}
            className={`size-7 shrink-0 rounded-full text-xs transition-colors ${
              rating === value
                ? "bg-[var(--color-brand-blue)] text-white"
                : "text-[var(--color-black-mid)] hover:bg-white"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
