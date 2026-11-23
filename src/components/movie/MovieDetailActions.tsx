"use client";

import { useEffect, useState } from "react";
import ChevronsRightIcon from "@/components/icons/ChevronsRightIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import WhereToWatchModal from "@/components/movie/WhereToWatchModal";
import Button from "@/components/ui/Button";
import {
  STORAGE_EVENT,
  hasFavorite,
  toggleFavorite,
  type SavedTitle,
} from "@/lib/storage";

interface MovieDetailActionsProps {
  movieId: number;
  movieTitle: string;
  compact?: boolean;
  watchPath?: string;
  favorite?: SavedTitle;
}

export default function MovieDetailActions({
  movieId,
  movieTitle,
  compact = false,
  watchPath,
  favorite,
}: MovieDetailActionsProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWhereToWatchOpen, setIsWhereToWatchOpen] = useState(false);

  useEffect(() => {
    if (!favorite) return;

    const saved = favorite;

    function sync() {
      setIsFavorite(hasFavorite(saved.type, saved.id));
    }

    sync();
    window.addEventListener(STORAGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORAGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [favorite]);

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
        <Button onClick={() => setIsWhereToWatchOpen(true)}>
          Where to Watch
          <ChevronsRightIcon />
        </Button>
        <button
          type="button"
          aria-pressed={isFavorite}
          aria-label={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          onClick={() => {
            if (!favorite) {
              setIsFavorite((current) => !current);
              return;
            }

            setIsFavorite(toggleFavorite(favorite));
          }}
          className={`group flex size-11 items-center justify-center rounded-full border border-[var(--color-border-grey)] transition-colors hover:text-[var(--color-brand-blue)] ${
            isFavorite
              ? "bg-[var(--color-brand-blue-low)] text-[var(--color-brand-blue)]"
              : "text-[var(--color-black)]"
          }`}
        >
          <HeartIcon
            filled={isFavorite}
            className="[&_path]:transition-colors group-hover:[&_path]:fill-current"
          />
        </button>
      </div>

      <div className="mt-7 w-full md:hidden">
        <RatingControl rating={rating} onChange={setRating} />
      </div>

      <WhereToWatchModal
        movieId={movieId}
        movieTitle={movieTitle}
        watchPath={watchPath}
        isOpen={isWhereToWatchOpen}
        onClose={() => setIsWhereToWatchOpen(false)}
      />
    </>
  );
}

interface RatingControlProps {
  rating: number | null;
  onChange: (value: number | null) => void;
  compact?: boolean;
}

function RatingControl({ rating, onChange, compact = false }: RatingControlProps) {
  return (
    <div className={compact ? "w-full max-w-[360px]" : "w-full"}>
      <p className="mb-2 text-sm text-[var(--color-black-mid)]">Add Rating</p>
      <div className="flex items-center justify-between gap-1 rounded-[var(--radius-badge)] bg-[var(--color-brand-blue-low6)] p-1">
        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`Rate ${value} out of 10`}
            aria-pressed={rating === value}
            onClick={() => onChange(rating === value ? null : value)}
            className={`size-7 shrink-0 rounded-full text-xs transition-colors ${
              rating === value
                ? "bg-[var(--color-brand-blue)] text-[var(--color-white)]"
                : "text-[var(--color-black-mid)] hover:bg-[var(--color-white)]"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
