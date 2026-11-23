import Header from "@/components/layout/Header";
import CollectionBrowse from "@/components/collection/CollectionBrowse";
import { discoverMedia, getGenres } from "@/lib/discover";

export const metadata = {
  title: "Top Rated",
};

export default async function TopRatedPage() {
  const [page, genres] = await Promise.all([
    discoverMedia({ kind: "movie", sort: "rating", page: 1 }),
    getGenres("movie"),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />
      <main className="container-grid">
        <CollectionBrowse
          title="Top Rated"
          subtitle="Exceptional films worth your time."
          genres={genres.map((genre) => ({
            value: String(genre.id),
            label: genre.name.toLowerCase(),
          }))}
          mode="discover"
          defaultSort="rating"
          discover={{ kind: "movie" }}
          initial={page}
        />
      </main>
    </div>
  );
}
