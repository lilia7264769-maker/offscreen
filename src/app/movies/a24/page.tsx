import Header from "@/components/layout/Header";
import CollectionBrowse from "@/components/collection/CollectionBrowse";
import { discoverMedia, getGenres } from "@/lib/discover";
import { getCompanyID } from "@/lib/movies";

export const metadata = {
  title: "A24 Aesthetics",
};

export default async function A24Page() {
  const [companyId, genres] = await Promise.all([
    getCompanyID("A24"),
    getGenres("movie"),
  ]);
  const page = companyId
    ? await discoverMedia({
        kind: "movie",
        sort: "popularity",
        page: 1,
        companyId,
      })
    : { results: [], page: 1, totalPages: 1 };

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />
      <main className="container-grid">
        <CollectionBrowse
          title="A24 Aesthetics"
          subtitle="Distinct films from the A24 library."
          genres={genres.map((genre) => ({
            value: String(genre.id),
            label: genre.name.toLowerCase(),
          }))}
          mode={companyId ? "discover" : "local"}
          defaultSort="popularity"
          discover={
            companyId ? { kind: "movie", company: String(companyId) } : undefined
          }
          initial={page}
          emptyLabel="These titles could not be loaded."
        />
      </main>
    </div>
  );
}
