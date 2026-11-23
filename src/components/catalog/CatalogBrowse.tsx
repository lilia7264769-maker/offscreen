"use client";

import { useMemo, useState } from "react";
import FilterSelect, { type Choice } from "@/components/collection/FilterSelect";
import MediaFlexList from "@/components/collection/MediaFlexList";
import PagedPosterGrid from "@/components/collection/PagedPosterGrid";
import { usePagedMedia } from "@/components/collection/usePagedMedia";
import { useSavedTitles } from "@/components/collection/useSavedTitles";
import { savedToMedia } from "@/lib/storage";
import type { SortKey } from "@/lib/discover";
import type { Media } from "@/types/movie";

const TABS = [
  { id: "all", label: "All" },
  { id: "movies", label: "Movies" },
  { id: "series", label: "Series" },
  { id: "animation", label: "Animation" },
] as const;

type CatalogTab = (typeof TABS)[number]["id"];

const SORT_OPTIONS: Choice[] = [
  { value: "rating", label: "Rating" },
  { value: "newest", label: "Newest" },
  { value: "popularity", label: "Popularity" },
];

interface CatalogBrowseProps {
  movieGenres: Choice[];
  tvGenres: Choice[];
  years: Choice[];
  countries: Choice[];
  animationGenreId: string;
  initial: {
    results: Media[];
    page: number;
    totalPages: number;
  };
}

export default function CatalogBrowse({
  movieGenres,
  tvGenres,
  years,
  countries,
  animationGenreId,
  initial,
}: CatalogBrowseProps) {
  const [openMenu, setOpenMenu] = useState<
    "genre" | "year" | "country" | "sort" | null
  >(null);
  const [tab, setTab] = useState<CatalogTab>("all");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [country, setCountry] = useState("");
  const [sort, setSort] = useState<SortKey>("popularity");

  const genreOptions = tab === "series" ? tvGenres : movieGenres;
  const selectedGenre = tab === "animation" ? animationGenreId : genre;
  const kind = tab === "series" ? "tv" : tab === "all" ? "all" : "movie";

  const query = useMemo(() => {
    const params = new URLSearchParams({ kind, sort });
    if (selectedGenre) params.set("genre", selectedGenre);
    if (year) params.set("year", year);
    if (country) params.set("country", country);
    return `/api/discover?${params.toString()}`;
  }, [country, kind, selectedGenre, sort, year]);

  const recentSearches = useSavedTitles("searches");
  const paged = usePagedMedia({
    enabled: true,
    query,
    initial,
  });

  function selectTab(next: CatalogTab) {
    setTab(next);
    if (next === "series" || tab === "series" || next === "animation") {
      setGenre("");
    }
  }

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-9">
        <div className="flex flex-col gap-3">
          <h1 className="text-[32px] leading-tight font-extrabold">
            Discover Films
          </h1>
          <p className="text-[15px] text-[var(--color-black-mid)]">
            Explore movies, series and animation.
          </p>
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
          <div className="flex w-fit items-center gap-1 rounded-full border border-[var(--color-border-grey)] bg-[color-mix(in_srgb,var(--color-black)_4%,var(--color-bg-main))] p-1">
            {TABS.map((item) => {
              const isSelected = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => selectTab(item.id)}
                  className={`rounded-full px-6 py-1.5 text-[13px] font-medium uppercase ${
                    isSelected
                      ? "bg-[var(--color-brand-blue)] text-[var(--color-white)]"
                      : "text-[var(--color-black-mid)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-wrap gap-3 xl:min-w-0 xl:flex-1 xl:flex-nowrap xl:items-center xl:justify-center">
            <FilterSelect
              className="w-[170px] max-w-[calc(50%-0.375rem)] xl:max-w-none xl:shrink-0"
              label="all genres"
              value={selectedGenre}
              options={[{ value: "", label: "All genres" }, ...genreOptions]}
              open={openMenu === "genre"}
              onOpenChange={(open) => setOpenMenu(open ? "genre" : null)}
              onChange={(value) => {
                setGenre(value);
                if (tab === "animation") setTab("movies");
              }}
            />
            <FilterSelect
              className="w-[170px] max-w-[calc(50%-0.375rem)] xl:max-w-none xl:shrink-0"
              label="year"
              value={year}
              options={[{ value: "", label: "Any year" }, ...years]}
              open={openMenu === "year"}
              onOpenChange={(open) => setOpenMenu(open ? "year" : null)}
              onChange={setYear}
            />
            <FilterSelect
              className="w-[170px] max-w-[calc(50%-0.375rem)] xl:max-w-none xl:shrink-0"
              label="country"
              value={country}
              options={[{ value: "", label: "Any country" }, ...countries]}
              open={openMenu === "country"}
              onOpenChange={(open) => setOpenMenu(open ? "country" : null)}
              onChange={setCountry}
            />
            <FilterSelect
              className="w-[170px] max-w-[calc(50%-0.375rem)] xl:max-w-none xl:shrink-0"
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
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="header2">You Searched For</h2>
        {recentSearches.length === 0 ? (
          <p className="text-[15px] text-[var(--color-black-mid)]">
            Recent searches will show up here.
          </p>
        ) : (
          <MediaFlexList items={recentSearches.map(savedToMedia)} />
        )}
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="header2">Top Searches</h2>
        {paged.error && (
          <p className="text-[15px] text-[var(--color-black-mid)]">{paged.error}</p>
        )}
        <PagedPosterGrid
          items={paged.items}
          hasMore={paged.hasMore}
          loading={paged.loading}
          error={paged.error}
          resetKey={query}
          onLoad={paged.loadMore}
          emptyLabel={
            paged.items.length === 0 ? "No titles match these filters." : undefined
          }
        />
      </section>
    </div>
  );
}
