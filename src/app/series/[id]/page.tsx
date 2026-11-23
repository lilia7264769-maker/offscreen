import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import MediaCard from "@/components/movie/MediaCard";
import MovieDetailActions from "@/components/movie/MovieDetailActions";
import HorizontalMediaRow from "@/components/movie/HorizontalMediaRow";
import MovieAbout from "@/components/movie/MovieAbout";
import MovieTrailers from "@/components/movie/trailers/MovieTrailers";
import { getSeriesCredits } from "@/lib/credits";
import { getSeriesPageDetails, getSimilarSeries } from "@/lib/series";
import { getSeriesTrailerCards } from "@/lib/videos";

interface SeriesPageProps {
  params: Promise<{ id: string }>;
}

function uniqueNames(names: string[]): string {
  return [...new Set(names)].join(", ");
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { id } = await params;
  const seriesId = Number(id);

  if (!/^\d+$/.test(id) || !Number.isSafeInteger(seriesId) || seriesId <= 0) {
    notFound();
  }

  const [series, credits, similarSeries, trailers] = await Promise.all([
    getSeriesPageDetails(seriesId),
    getSeriesCredits(seriesId),
    getSimilarSeries(seriesId),
    getSeriesTrailerCards(seriesId),
  ]);

  if (!series) notFound();

  const releaseLabel = series.releaseYear || "Release date unavailable";
  const countries = new Intl.DisplayNames(["en"], { type: "region" });
  const facts = [
    { label: "Status", value: series.status },
    {
      label: "Rating",
      value: series.rating > 0 ? `${series.rating.toFixed(1)} TMDB` : "",
    },
    { label: "Language", value: series.originalLanguage },
    { label: "Creator", value: uniqueNames(series.creators) },
    { label: "Writer", value: uniqueNames(credits.writers) },
    { label: "Seasons", value: series.seasonsLabel },
    { label: "Episode runtime", value: series.episodeRuntime ?? "" },
    { label: "Networks", value: series.networks.join(", ") },
    {
      label: "Production Companies",
      value: series.productionCompanies.join(", "),
    },
    {
      label: "Country of Origin",
      value: series.countryOfOrigin
        .map((country) => countries.of(country) || country)
        .join(", "),
    },
  ].filter((fact) => fact.value.trim().length > 0);

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />

      <main className="container-grid">
        <section className="relative z-10 grid gap-8 md:grid-cols-[minmax(140px,220px)_minmax(0,1fr)] md:gap-6 xl:grid-cols-[220px_minmax(0,1fr)_360px] xl:gap-8">
          <div className="mx-auto w-full max-w-[220px] md:mx-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-bg-grey)]">
              {series.posterPath && (
                <Image
                  src={series.posterPath}
                  alt={`${series.title} poster`}
                  fill
                  priority
                  sizes="(max-width: 767px) 220px, 220px"
                  className="object-cover"
                />
              )}
            </div>
            {series.tagline && (
              <p className="mt-3 text-[14px] text-[var(--color-black)]">
                &ldquo;{series.tagline}&rdquo;
              </p>
            )}
          </div>

          <div className="flex min-w-0 flex-col items-start">
            <p className="mb-2 text-sm text-[var(--color-black-mid)]">
              {releaseLabel}
              {series.seasonsLabel ? ` · ${series.seasonsLabel}` : ""}
              {series.status ? ` · ${series.status}` : ""}
            </p>
            <h1 className="mb-4 text-3xl leading-tight font-extrabold xl:text-4xl">
              {series.title}
            </h1>

            {series.genres.length > 0 && (
              <ul className="mb-5 flex flex-wrap gap-2">
                {series.genres.map((genre) => (
                  <li
                    key={genre}
                    className="rounded-full border border-[var(--color-brand-blue)] px-3 py-1 text-[15px] font-medium lowercase text-[var(--color-brand-blue)]"
                  >
                    {genre}
                  </li>
                ))}
              </ul>
            )}

            <p className="mb-6 max-w-3xl text-sm leading-relaxed">
              {series.overview || "No synopsis is available for this series yet."}
            </p>

            <MovieDetailActions
              movieId={series.id}
              movieTitle={series.title}
              watchPath={`/api/series/${series.id}/watch`}
              favorite={{
                id: series.id,
                type: series.type,
                title: series.title,
                posterPath: series.posterPath,
                releaseYear: series.releaseYear,
                genres: series.genres,
                rating: series.rating,
              }}
            />

            <div className="mt-8 w-full md:hidden">
              <MovieAbout idSuffix="mobile" facts={facts} alwaysExpanded />
            </div>
          </div>

          <aside className="hidden xl:block">
            <MovieDetailActions
              movieId={series.id}
              movieTitle={series.title}
              compact
            />
            <div className="mt-4">
              <MovieAbout idSuffix="desktop" facts={facts} />
            </div>
          </aside>
        </section>

        <section className="hidden flex-col gap-6 md:flex xl:hidden">
          <MovieDetailActions
            movieId={series.id}
            movieTitle={series.title}
            compact
          />
          <MovieAbout idSuffix="tablet" facts={facts} alwaysExpanded columns />
        </section>

        {trailers.length > 0 && (
          <MovieTrailers
            movieId={series.id}
            movieTitle={series.title}
            trailers={trailers}
          />
        )}

        {credits.cast.length > 0 && (
          <HorizontalMediaRow title="Cast">
            {credits.cast.map((person) => (
              <article
                key={`${person.id}-${person.character}`}
                className="w-[120px] shrink-0"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-bg-grey)]">
                  {person.profilePath ? (
                    <Image
                      src={person.profilePath}
                      alt={person.name}
                      fill
                      draggable={false}
                      sizes="196px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl font-bold text-[var(--color-black-low)]">
                      {person.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-[15px] font-semibold">
                  {person.name}
                </p>
                <p className="mt-1 truncate text-[13px] font-semibold text-[var(--color-black-mid)]">
                  {person.character}
                </p>
              </article>
            ))}
          </HorizontalMediaRow>
        )}

        {similarSeries.length > 0 && (
          <HorizontalMediaRow title="Similar Series">
            {similarSeries.slice(0, 8).map((similar) => (
              <MediaCard key={similar.id} media={similar} />
            ))}
          </HorizontalMediaRow>
        )}
      </main>
    </div>
  );
}
