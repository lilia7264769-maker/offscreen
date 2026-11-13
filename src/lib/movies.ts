import { tmdbFetch, TMDBError } from "./client";
import type { Movie } from "@/types/movie";

const TMDB_IMAGE = "https://image.tmdb.org/t/p";

interface TMDBMovieBase {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

interface TMDBMovie extends TMDBMovieBase {
  genre_ids: number[];
}

interface TMDBMovieById extends TMDBMovieBase {
  genres: TMDBGenre[];
}

interface TMDBMovieDetails {
  runtime: number | null;
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBGenreResponse {
  genres: TMDBGenre[];
}

interface TMDBCompany {
  id: number;
  name: string;
}

interface TMDBCompanyMoviesResponse {
  total_results: number;
}

interface TMDBResponse<T> {
  results: T[]; //  массив объектов какого-то типа
}

// создание объекта Movie. не делает запрос к TMDB, просто преобразует уже полученные данные.
function mapMovie(
  movie: TMDBMovieBase,
  genres: string[],
  runtime?: string,
): Movie {
  return {
    id: movie.id,
    title: movie.title,
    type: "movie",
    posterPath: movie.poster_path
      ? `${TMDB_IMAGE}/w500${movie.poster_path}`
      : null,
    backdropPath: movie.backdrop_path
      ? `${TMDB_IMAGE}/original${movie.backdrop_path}`
      : null,
    releaseYear: movie.release_date
      ? Number(movie.release_date.slice(0, 4))
      : 0,
    genres,
    rating: movie.vote_average,
    overview: movie.overview,
    runtime,
  };
}

async function getMovies(path: string): Promise<Movie[]> {
  const [moviesData, genresData] = await Promise.all([
    tmdbFetch<TMDBResponse<TMDBMovie>>(path),
    tmdbFetch<TMDBGenreResponse>("/genre/movie/list"),
  ]);

  const genresById = new Map(
    genresData.genres.map((genre) => [genre.id, genre.name]), // преобразует ID жанров в названия
  );

  const movies = moviesData.results.map((movie) => {
    const genres = movie.genre_ids
      .map((id) => genresById.get(id))
      .filter((name): name is string => Boolean(name));

    return mapMovie(movie, genres);
  });

  return movies;
}

function formatRuntime(runtime: number | null): string | undefined {
  if (!runtime) return undefined;

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

// get runtime
export async function getMovieDetails(movieId: number) {
  try {
    const details = await tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}`);

    return {
      runtime: formatRuntime(details.runtime),
    };
  } catch (error) {
    if (error instanceof TMDBError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getMovieById(movieId: number): Promise<Movie | null> {
  try {
    const movie = await tmdbFetch<TMDBMovieById>(`/movie/${movieId}`);

    const genres = movie.genres.map((genre) => genre.name);

    return mapMovie(movie, genres);
  } catch (error) {
    if (error instanceof TMDBError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export function getTopRatedMovies(): Promise<Movie[]> {
  return getMovies("/movie/top_rated"); // endpoint
}

export function getPopularMovies(): Promise<Movie[]> {
  return getMovies("/movie/popular");
}

export function searchMovies(query: string): Promise<Movie[]> {
  return getMovies(
    `/search/movie?query=${encodeURIComponent(query)}&include_adult=false`,
  );
}

export function getUpcomingMovies(): Promise<Movie[]> {
  return getMovies("/movie/upcoming");
}

export function getSimilarMovies(movieId: number): Promise<Movie[]> {
  return getMovies(`/movie/${movieId}/similar`);
}

// for Hero
export function getPopularMoviesAroundToday(): Promise<Movie[]> {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 15);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 15);

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return getMovies(
    `/discover/movie?primary_release_date.gte=${formatDate(startDate)}&primary_release_date.lte=${formatDate(endDate)}&sort_by=popularity.desc`,
  );
}

async function getCompanyID(name: string): Promise<number | null> {
  const data = await tmdbFetch<TMDBResponse<TMDBCompany>>(
    `/search/company?query=${encodeURIComponent(name)}`,
  );
  const exactMatches = data.results.filter(
    (company) => company.name.toLowerCase() === name.toLowerCase(),
  );

  if (exactMatches.length === 0) return null;
  if (exactMatches.length === 1) return exactMatches[0].id;

  // оставляет компанию с наибольшим количеством фильмов
  const companiesWithMovieCounts = await Promise.all(
    exactMatches.map(async (company) => {
      const movies = await tmdbFetch<TMDBCompanyMoviesResponse>(
        `/company/${company.id}/movies?page=1`,
      );
      return { id: company.id, movieCount: movies.total_results };
    }),
  );

  return companiesWithMovieCounts.reduce((bestMatch, company) =>
    company.movieCount > bestMatch.movieCount ? company : bestMatch,
  ).id;
}

export async function getCompanyMovies(companyName: string): Promise<Movie[]> {
  const companyId = await getCompanyID(companyName);
  if (companyId === null) return [];

  return getMovies(
    `/discover/movie?with_companies=${companyId}&sort_by=popularity.desc`,
  );
}
