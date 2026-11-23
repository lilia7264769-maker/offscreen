import Header from "@/components/layout/Header";
import CatalogBrowse from "@/components/catalog/CatalogBrowse";
import { discoverMedia, getCountries, getGenres } from "@/lib/discover";

export const metadata = {
  title: "Discover Films",
};

export default async function CatalogPage() {
  const currentYear = new Date().getFullYear();
  const [page, movieGenres, tvGenres, countries] = await Promise.all([
    discoverMedia({ kind: "all", sort: "popularity", page: 1 }),
    getGenres("movie"),
    getGenres("tv"),
    getCountries(),
  ]);
  const animation = movieGenres.find(
    (genre) => genre.name.toLowerCase() === "animation",
  );

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />
      <main className="container-grid">
        <CatalogBrowse
          movieGenres={movieGenres.map((genre) => ({
            value: String(genre.id),
            label: genre.name.toLowerCase(),
          }))}
          tvGenres={tvGenres.map((genre) => ({
            value: String(genre.id),
            label: genre.name.toLowerCase(),
          }))}
          years={Array.from({ length: currentYear - 1959 }, (_, index) => {
            const year = String(currentYear - index);
            return { value: year, label: year };
          })}
          countries={countries.map((country) => ({
            value: country.code,
            label: country.name,
          }))}
          animationGenreId={animation ? String(animation.id) : "16"}
          initial={page}
        />
      </main>
    </div>
  );
}
