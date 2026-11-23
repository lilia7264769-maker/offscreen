import Header from "@/components/layout/Header";
import CatalogBrowse, {
  type CatalogTab,
} from "@/components/catalog/CatalogBrowse";
import { discoverMedia, getCountries, getGenres } from "@/lib/discover";

export const metadata = {
  title: "Discover Films",
};

const TABS: CatalogTab[] = ["all", "movies", "series", "animation"];

interface CatalogPageProps {
  searchParams: Promise<{ tab?: string; genre?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { tab: tabParam, genre: genreParam } = await searchParams;
  const currentYear = new Date().getFullYear();
  const [movieGenres, tvGenres, countries] = await Promise.all([
    getGenres("movie"),
    getGenres("tv"),
    getCountries(),
  ]);
  const tab = TABS.includes(tabParam as CatalogTab)
    ? (tabParam as CatalogTab)
    : "all";
  const animation = movieGenres.find(
    (genre) => genre.name.toLowerCase() === "animation",
  );
  const genreList = tab === "series" ? tvGenres : movieGenres;
  const genreId = genreList.some((genre) => String(genre.id) === genreParam)
    ? Number(genreParam)
    : undefined;
  const page = await discoverMedia({
    kind: tab === "series" ? "tv" : tab === "all" ? "all" : "movie",
    sort: "popularity",
    page: 1,
    genreId: tab === "animation" ? animation?.id : genreId,
  });

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
          initialTab={tab}
          initialGenre={genreId ? String(genreId) : ""}
          initial={page}
        />
      </main>
    </div>
  );
}
