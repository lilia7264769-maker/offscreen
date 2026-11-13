import {
  getTopRatedMovies,
  getPopularMoviesAroundToday,
  getCompanyMovies,
} from "@/lib/movies";
import { getPopularSeries } from "@/lib/series";
import { getMovieTrailers } from "@/lib/videos";
import { midnightCinema } from "@/data/collections";

import type { HeroMovie } from "@/types/movie";
import Header from "@/components/layout/Header";
import HeroBanner from "@/components/movie/HeroBanner";
import MediaRow from "@/components/movie/MediaRow";
import GenreRow from "@/components/genre/GenreRow";
import Footer from "@/components/layout/Footer";

import { getMovieById } from "@/lib/movies";
import { getSeriesById } from "@/lib/series";

export default async function Home() {
  const [movies, releaseWindowMovies, a24Movies, series] = await Promise.all([
    getTopRatedMovies(),
    getPopularMoviesAroundToday(),
    getCompanyMovies("A24"),
    getPopularSeries(),
  ]);
  const heroMovies = Array.from(
    new Map(
      releaseWindowMovies
        .filter((movie) => movie.backdropPath)
        .map((movie) => [movie.id, movie]),
    ).values(),
  ).slice(0, 5);

  const heroMoviesWithTrailers: HeroMovie[] = await Promise.all(
    heroMovies.map(async (movie) => ({
      ...movie,
      trailerKeys: await getMovieTrailers(movie.id),
    })),
  );

  const midnightCinemaItems = await Promise.all(
    midnightCinema.map((item) =>
      item.type === "movie" ? getMovieById(item.id) : getSeriesById(item.id),
    ),
  );

  const validMidnightCinemaItems = midnightCinemaItems.filter(
    (item) => item !== null,
  );

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-main)] text-[var(--color-black)] selection:bg-[var(--color-brand-blue)] selection:text-[var(--color-white)]">
      <div className="relative">
        <Header variant="dark" />
        <HeroBanner movies={heroMoviesWithTrailers} />
      </div>

      <main className="container-grid flex flex-1 flex-col gap-14 pt-14 pb-24">
        <MediaRow title="Top Rated" media={movies} href="/movies/top-rated" />

        <GenreRow />

        <MediaRow title="A24 Aesthetics" media={a24Movies} href="/movies/a24" />

        <MediaRow title="One More Episode" media={series} href="/series" />

        <MediaRow
          title="Midnight Cinema"
          media={validMidnightCinemaItems}
          href="/collections/midnight-cinema"
        />
      </main>

      <Footer />
    </div>
  );
}
