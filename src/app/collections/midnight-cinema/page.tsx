import Header from "@/components/layout/Header";
import CollectionBrowse from "@/components/collection/CollectionBrowse";
import { midnightCinema } from "@/data/collections";
import { getMovieById } from "@/lib/movies";
import { getSeriesById } from "@/lib/series";
import type { Media } from "@/types/movie";

export const metadata = {
  title: "Midnight Cinema",
};

export default async function MidnightCinemaPage() {
  const loaded = await Promise.all(
    midnightCinema.map((item) =>
      item.type === "movie" ? getMovieById(item.id) : getSeriesById(item.id),
    ),
  );
  const items = loaded.filter((item): item is Media => item !== null);
  const genreNames = [...new Set(items.flatMap((item) => item.genres))].sort(
    (a, b) => a.localeCompare(b),
  );

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />
      <main className="container-grid">
        <CollectionBrowse
          title="Midnight Cinema"
          subtitle="After-dark films and series."
          genres={genreNames.map((name) => ({
            value: name,
            label: name.toLowerCase(),
          }))}
          mode="local"
          initial={{ results: items, page: 1, totalPages: 1 }}
        />
      </main>
    </div>
  );
}
