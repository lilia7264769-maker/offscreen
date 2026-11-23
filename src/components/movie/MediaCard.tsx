"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Media } from "@/types/movie";
import ClapperboardIcon from "@/components/icons/ClapperboardIcon";

interface MediaCardProps {
  media: Pick<
    Media,
    "id" | "type" | "posterPath" | "rating" | "releaseYear" | "genres" | "title"
  > & {
    runtime?: string;
    numberOfSeasons?: string;
  };
}

const detailsCache = new Map<string, Promise<string | undefined>>();

export default function MediaCard({ media }: MediaCardProps) {
  const [extraInfo, setExtraInfo] = useState(
    media.type === "movie" ? media.runtime : media.numberOfSeasons,
  );

  async function loadExtraInfo() {
    const cacheKey = `${media.type}-${media.id}`; // "movie-123" "tv-123"
    const endpoint =
      media.type === "movie"
        ? `/api/movies/${media.id}`
        : `/api/series/${media.id}`;

    if (extraInfo !== undefined) return;

    if (detailsCache.has(cacheKey)) {
      const cached = detailsCache.get(cacheKey);

      if (cached) {
        setExtraInfo(await cached);
      }

      return;
    }
    const request = fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch media details");
        }

        return response.json();
      })
      .then(
        (data: { runtime?: string; numberOfSeasons?: string }) =>
          data.runtime ?? data.numberOfSeasons,
      );

    detailsCache.set(cacheKey, request);

    /* Если запрос успешен — обновляем состояние. Если произошла ошибка — удаляем 
    Promise из кэша, чтобы следующая попытка могла отправить новый запрос. */
    try {
      setExtraInfo(await request);
    } catch {
      detailsCache.delete(cacheKey);
    }
  }

  const card = (
    <div
      onMouseEnter={loadExtraInfo}
      className="group flex w-[196px] shrink-0 cursor-pointer flex-col gap-2"
    >
      <div className="relative aspect-[2/3] w-full rounded-[var(--radius-card)] overflow-hidden bg-bg-grey">
        {media.posterPath ? (
          <Image
            src={media.posterPath}
            alt={media.title}
            draggable={false}
            fill
            sizes="200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[var(--color-dark-card)] px-3">
            <ClapperboardIcon size={32} className="text-[var(--color-dark-muted)]" />
            <p className="line-clamp-3 text-center text-sm font-medium text-[var(--color-dark-text)]">
              {media.title}
            </p>
          </div>
        )}
        <div className="absolute inset-0 bg-[var(--color-brand-blue)]/70 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 px-3 py-4 text-[var(--color-white)]">
            {extraInfo && (
              <p className="text-[13px] font-normal opacity-70">{extraInfo}</p>
            )}
            <p className="line-clamp-2 break-words font-semibold text-[18px] leading-tight">
              {media.title}
            </p>
          </div>
        </div>

        {/*рейтинг*/}
        <div className="absolute right-3 top-3 z-10 rounded-[6px] bg-[var(--color-white)] px-2 py-0.5 text-[13px] font-bold text-[var(--color-brand-blue)]">
          {media.rating.toFixed(1)}
          {/* оставляем одну цифру после десятичной точки */}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[13px] font-semibold text-[var(--color-black-mid)]">
        <span>{media.releaseYear}</span>

        {media.genres?.length > 0 && (
          <>
            <span>•</span>
            <span className="truncate">{media.genres[0]}</span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Link
      href={media.type === "movie" ? `/movie/${media.id}` : `/series/${media.id}`}
      aria-label={`View details for ${media.title}`}
      draggable={false}
      className="w-[196px] shrink-0"
    >
      {card}
    </Link>
  );
}
