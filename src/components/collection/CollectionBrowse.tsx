"use client";

import { useMemo, useState } from "react";
import FilterIcon from "@/components/icons/FilterIcon";
import FilterSelect, { type Choice } from "@/components/collection/FilterSelect";
import PagedPosterGrid from "@/components/collection/PagedPosterGrid";
import { usePagedMedia } from "@/components/collection/usePagedMedia";
import type { SortKey } from "@/lib/discover";
import type { Media } from "@/types/movie";

const SORT_OPTIONS: Choice[] = [
  { value: "rating", label: "Rating" },
  { value: "newest", label: "Newest" },
  { value: "popularity", label: "Popularity" },
];

interface CollectionBrowseProps {
  title: string;
  subtitle: string;
  genres: Choice[];
  mode: "discover" | "local";
  defaultSort?: SortKey;
  discover?: {
    kind: "movie" | "tv";
    company?: string;
  };
  initial: {
    results: Media[];
    page: number;
    totalPages: number;
  };
  emptyLabel?: string;
}

export default function CollectionBrowse({
  title,
  subtitle,
  genres,
  mode,
  defaultSort = "popularity",
  discover,
  initial,
  emptyLabel = "No titles match these filters.",
}: CollectionBrowseProps) {
  const [openMenu, setOpenMenu] = useState<"genre" | "sort" | null>(null);
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<SortKey | "">(
    mode === "discover" ? defaultSort : "",
  );

  const query = useMemo(() => {
    const params = new URLSearchParams({
      kind: discover?.kind ?? "movie",
      sort: sort || defaultSort,
    });

    if (genre) params.set("genre", genre);
    if (discover?.company) params.set("company", discover.company);
    return `/api/discover?${params.toString()}`;
  }, [defaultSort, discover?.company, discover?.kind, genre, sort]);

  const paged = usePagedMedia({
    enabled: mode === "discover",
    query,
    initial,
  });

  const localItems = useMemo(() => {
    const genreLabel = genres.find((option) => option.value === genre)?.label;
    let next = initial.results;

    if (genreLabel) {
      next = next.filter((item) =>
        item.genres.some(
          (itemGenre) => itemGenre.toLowerCase() === genreLabel.toLowerCase(),
        ),
      );
    }

    if (sort === "rating") {
      next = [...next].sort((a, b) => b.rating - a.rating);
    } else if (sort === "newest") {
      next = [...next].sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sort === "popularity") {
      next = [...next].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }

    return next;
  }, [genre, genres, initial.results, sort]);

  const items = mode === "discover" ? paged.items : localItems;
  const resolvedEmptyLabel =
    initial.results.length === 0 && mode === "local" ? emptyLabel : emptyLabel;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-[32px] leading-tight font-extrabold">{title}</h1>
          <p className="text-[15px] text-[var(--color-black-mid)]">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--color-black-mid)]">
            <FilterIcon />
            Filters
          </span>
          <FilterSelect
            label="all genres"
            value={genre}
            options={[{ value: "", label: "All genres" }, ...genres]}
            open={openMenu === "genre"}
            onOpenChange={(open) => setOpenMenu(open ? "genre" : null)}
            onChange={setGenre}
          />
          <FilterSelect
            label="sort by"
            value={sort}
            options={SORT_OPTIONS}
            keepLabel
            open={openMenu === "sort"}
            onOpenChange={(open) => setOpenMenu(open ? "sort" : null)}
            onChange={(value) => setSort(value as SortKey)}
          />
        </div>
      </div>

      {paged.error && (
        <p className="text-[15px] text-[var(--color-black-mid)]">{paged.error}</p>
      )}

      <PagedPosterGrid
        items={items}
        hasMore={mode === "discover" && paged.hasMore}
        loading={mode === "discover" && paged.loading}
        error={paged.error}
        resetKey={mode === "discover" ? query : `${genre}:${sort}`}
        onLoad={paged.loadMore}
        emptyLabel={items.length === 0 ? resolvedEmptyLabel : undefined}
      />
    </div>
  );
}
