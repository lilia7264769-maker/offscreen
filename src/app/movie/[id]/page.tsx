import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import MediaCard from "@/components/movie/MediaCard";
import MovieDetailActions from "@/components/movie/MovieDetailActions";
import HorizontalMediaRow from "@/components/movie/HorizontalMediaRow";
import MovieAbout from "@/components/movie/MovieAbout";
import MovieTrailers from "@/components/movie/trailers/MovieTrailers";
import { getMovieCredits } from "@/lib/credits";
import { getMoviePageDetails, getSimilarMovies } from "@/lib/movies";
import { getMovieTrailerCards } from "@/lib/videos";

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

  const [movie, credits, similarMovies, trailers] = await Promise.all([
    getMoviePageDetails(movieId),
    getMovieCredits(movieId),
    getSimilarMovies(movieId),
    getMovieTrailerCards(movieId),
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
        <section className="relative z-10 grid gap-8 md:grid-cols-[minmax(140px,220px)_minmax(0,1fr)] md:gap-6 xl:grid-cols-[220px_minmax(0,1fr)_360px] xl:gap-8">
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
            <h1 className="mb-4 text-3xl leading-tight font-extrabold xl:text-4xl">
              {movie.title}
            </h1>

            {movie.genreLinks.length > 0 && (
              <ul className="mb-5 flex flex-wrap gap-2">
                {movie.genreLinks.map((genre) => (
                  <li key={genre.id}>
                    <Link
                      href={`/catalog?tab=movies&genre=${genre.id}`}
                      className="inline-flex rounded-full border border-[var(--color-brand-blue)] px-3 py-1 text-[15px] font-medium lowercase text-[var(--color-brand-blue)]"
                    >
                      {genre.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <p className="mb-6 max-w-3xl text-sm leading-relaxed">
              {movie.overview || "No synopsis is available for this film yet."}
            </p>

            <MovieDetailActions
              movieId={movie.id}
              movieTitle={movie.title}
              favorite={{
                id: movie.id,
                type: movie.type,
                title: movie.title,
                posterPath: movie.posterPath,
                releaseYear: movie.releaseYear,
                genres: movie.genres,
                rating: movie.rating,
              }}
            />

            <div className="mt-8 w-full md:hidden">
              <MovieAbout idSuffix="mobile" facts={facts} alwaysExpanded />
            </div>
          </div>

          <aside className="hidden xl:block">
            <MovieDetailActions
              movieId={movie.id}
              movieTitle={movie.title}
              compact
            />
            <div className="mt-4">
              <MovieAbout idSuffix="desktop" facts={facts} />
            </div>
          </aside>
        </section>

        <section className="hidden flex-col gap-6 md:flex xl:hidden">
          <MovieDetailActions
            movieId={movie.id}
            movieTitle={movie.title}
            compact
          />
          <MovieAbout idSuffix="tablet" facts={facts} alwaysExpanded columns />
        </section>

        {trailers.length > 0 && (
          <MovieTrailers
            movieId={movie.id}
            movieTitle={movie.title}
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
