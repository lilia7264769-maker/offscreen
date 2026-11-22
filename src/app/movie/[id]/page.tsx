import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import MediaCard from "@/components/movie/MediaCard";
import MovieDetailActions from "@/components/movie/MovieDetailActions";
import HorizontalMediaRow from "@/components/movie/HorizontalMediaRow";
import MovieAbout from "@/components/movie/MovieAbout";
import MovieTrailerRow from "@/components/movie/MovieTrailerRow";
import { getMovieCredits } from "@/lib/credits";
import { getMoviePageDetails, getSimilarMovies } from "@/lib/movies";
import { getMovieTrailers } from "@/lib/videos";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

function formatMoney(amount: number): string {
  if (!amount) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = Number(id);

  if (!/^\d+$/.test(id) || !Number.isSafeInteger(movieId) || movieId <= 0) {
    notFound();
  }

  const [movie, credits, similarMovies, trailerKeys] = await Promise.all([
    getMoviePageDetails(movieId),
    getMovieCredits(movieId),
    getSimilarMovies(movieId),
    getMovieTrailers(movieId),
  ]);

  if (!movie) notFound();

  const releaseLabel = movie.releaseYear || "Release date unavailable";
  const countries = new Intl.DisplayNames(["en"], { type: "region" });
  const facts = [
    { label: "Status", value: movie.status },
    {
      label: "Rating",
      value: movie.rating > 0 ? `${movie.rating.toFixed(1)} TMDB` : "",
    },
    { label: "Language", value: movie.originalLanguage },
    {
      label: "Director",
      value: credits.directors.join(", "),
    },
    {
      label: "Writer",
      value: credits.writers.join(", "),
    },
    { label: "Budget", value: formatMoney(movie.budget) },
    { label: "Revenue", value: formatMoney(movie.revenue) },
    {
      label: "Production Companies",
      value: movie.productionCompanies.join(", "),
    },
    {
      label: "Country of Origin",
      value: movie.countryOfOrigin
        .map((country) => countries.of(country) || country)
        .join(", "),
    },
  ].filter((fact) => fact.value.trim().length > 0);

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />

      <main className="container-grid">
        <section className="grid gap-8 md:grid-cols-[minmax(140px,220px)_minmax(0,1fr)] md:gap-6 xl:grid-cols-[220px_minmax(0,1fr)_360px] xl:gap-8">
          <div className="mx-auto w-full max-w-[220px] md:mx-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-bg-grey)]">
              {movie.posterPath && (
                <Image
                  src={movie.posterPath}
                  alt={`${movie.title} poster`}
                  fill
                  priority
                  sizes="(max-width: 767px) 220px, 220px"
                  className="object-cover"
                />
              )}
            </div>
            {movie.tagline && (
              <p className="mt-3 text-sm text-[var(--color-black)]">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}
          </div>

          <div className="flex min-w-0 flex-col items-start">
            <p className="mb-2 text-sm text-[var(--color-black-mid)]">
              {releaseLabel}
              {movie.runtime ? ` · ${movie.runtime}` : ""}
              {movie.status ? ` · ${movie.status}` : ""}
            </p>
            <h1 className="mb-4 text-3xl leading-tight font-extrabold md:text-2xl xl:text-4xl">
              {movie.title}
            </h1>

            {movie.genres.length > 0 && (
              <ul className="mb-5 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <li
                    key={genre}
                    className="rounded-full border border-[var(--color-brand-blue)] px-3 py-1 text-xs text-[var(--color-brand-blue)]"
                  >
                    {genre}
                  </li>
                ))}
              </ul>
            )}

            <p className="mb-6 max-w-3xl text-sm leading-relaxed">
              {movie.overview || "No synopsis is available for this film yet."}
            </p>

            <MovieDetailActions movieId={movie.id} trailerKeys={trailerKeys} />

            <div className="mt-8 w-full md:hidden">
              <MovieAbout idSuffix="mobile" facts={facts} alwaysExpanded />
            </div>
          </div>

          <aside className="hidden xl:block">
            <MovieDetailActions movieId={movie.id} trailerKeys={[]} compact />
            <div className="mt-4">
              <MovieAbout idSuffix="desktop" facts={facts} />
            </div>
          </aside>
        </section>

        <section className="hidden flex-col gap-6 md:flex xl:hidden">
          <MovieDetailActions movieId={movie.id} trailerKeys={[]} compact />
          <MovieAbout idSuffix="tablet" facts={facts} alwaysExpanded />
        </section>

        {trailerKeys.length > 0 && (
          <MovieTrailerRow
            movieId={movie.id}
            movieTitle={movie.title}
            trailerKeys={trailerKeys}
          />
        )}

        {credits.cast.length > 0 && (
          <HorizontalMediaRow title="Cast">
            {credits.cast.slice(0, 12).map((person) => (
              <article
                key={person.id}
                className="w-[calc((100vw-64px)/3)] shrink-0 sm:w-[calc((100vw-112px)/5)] md:w-[calc((100vw-160px)/7)] xl:w-[calc((100vw-240px)/7)]"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-bg-grey)]">
                  {person.profilePath ? (
                    <Image
                      src={person.profilePath}
                      alt={person.name}
                      fill
                      sizes="(max-width: 767px) 33vw, (max-width: 1279px) 13vw, 12vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl font-bold text-[var(--color-black-low)]">
                      {person.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-xs font-semibold">
                  {person.name}
                </p>
                <p className="mt-1 truncate text-xs text-[var(--color-black-mid)]">
                  {person.character}
                </p>
              </article>
            ))}
          </HorizontalMediaRow>
        )}

        {similarMovies.length > 0 && (
          <HorizontalMediaRow title="Similar Movies">
            {similarMovies.slice(0, 8).map((similarMovie) => (
              <MediaCard key={similarMovie.id} media={similarMovie} />
            ))}
          </HorizontalMediaRow>
        )}
      </main>
    </div>
  );
}
