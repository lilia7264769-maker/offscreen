import Header from "@/components/layout/Header";
import CollectionBrowse from "@/components/collection/CollectionBrowse";
import { discoverMedia, getGenres } from "@/lib/discover";

export const metadata = {
  title: "One More Episode",
};

export default async function SeriesPage() {
  const [page, genres] = await Promise.all([
    discoverMedia({ kind: "tv", sort: "popularity", page: 1 }),
    getGenres("tv"),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />
      <main className="container-grid">
        <CollectionBrowse
          title="One More Episode"
          subtitle="Series worth staying up for."
          genres={genres.map((genre) => ({
            value: String(genre.id),
            label: genre.name.toLowerCase(),
          }))}
          mode="discover"
          defaultSort="popularity"
          discover={{ kind: "tv" }}
          initial={page}
        />
      </main>
    </div>
  );
}
