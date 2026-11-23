import { tmdbFetch, TMDBError } from "./client";
import type { TVSeries } from "@/types/movie";

const TMDB_IMAGE = "https://image.tmdb.org/t/p";

interface TMDBSeriesBase {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  vote_average: number;
  overview: string;
  popularity: number;
}

interface TMDBSeries extends TMDBSeriesBase {
  genre_ids: number[];
}

interface TMDBSeriesById extends TMDBSeriesBase {
  genres: TMDBGenre[];
}

interface TMDBSeriesDetails {
  number_of_seasons: number | null;
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBGenreResponse {
  genres: TMDBGenre[];
}

interface TMDBResponse<T> {
  results: T[];
}

function mapSeries(
  show: TMDBSeriesBase,
  genres: string[],
  numberOfSeasons?: string,
): TVSeries {
  return {
    id: show.id,
    title: show.name,
    type: "tv",
    posterPath: show.poster_path
      ? `${TMDB_IMAGE}/w500${show.poster_path}`
      : null,
    backdropPath: show.backdrop_path
      ? `${TMDB_IMAGE}/original${show.backdrop_path}`
      : null,
    releaseYear: show.first_air_date
      ? Number(show.first_air_date.slice(0, 4))
      : 0,
    genres,
    rating: show.vote_average,
    overview: show.overview,
    popularity: show.popularity,
    numberOfSeasons, // необязательное
  };
}

async function getSeries(path: string): Promise<TVSeries[]> {
  const [seriesData, genresData] = await Promise.all([
    tmdbFetch<TMDBResponse<TMDBSeries>>(path),
    tmdbFetch<TMDBGenreResponse>("/genre/tv/list"),
  ]);

  const genresById = new Map(
    genresData.genres.map((genre) => [genre.id, genre.name]),
  );

  const series = seriesData.results.map((show) => {
    const genres = show.genre_ids
      .map((id) => genresById.get(id))
      .filter((name): name is string => Boolean(name));

    return mapSeries(show, genres);
  });

  return series;
}

export async function getSeriesDetails(seriesId: number) {
  try {
    const details = await tmdbFetch<TMDBSeriesDetails>(`/tv/${seriesId}`);

    return {
      numberOfSeasons:
        details.number_of_seasons !== null
          ? `${details.number_of_seasons === 1 ? "Season" : "Seasons"} ${
              details.number_of_seasons
            }`
          : undefined,
    };
  } catch (error) {
    if (error instanceof TMDBError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getSeriesById(
  seriesId: number,
): Promise<TVSeries | null> {
  try {
    const show = await tmdbFetch<TMDBSeriesById>(`/tv/${seriesId}`);

    const genres = show.genres.map((genre) => genre.name);

    return mapSeries(show, genres);
  } catch (error) {
    if (error instanceof TMDBError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export function getPopularSeries(): Promise<TVSeries[]> {
  return getSeries("/tv/popular");
}

export function searchSeries(query: string): Promise<TVSeries[]> {
  return getSeries(`/search/tv?query=${encodeURIComponent(query)}`);
}

export function getSimilarSeries(seriesId: number): Promise<TVSeries[]> {
  return getSeries(`/tv/${seriesId}/similar`);
}

interface TMDBSeriesPage extends TMDBSeriesById {
  tagline: string | null;
  original_language: string;
  status: string;
  number_of_seasons: number | null;
  episode_run_time?: number[];
  created_by?: { name: string }[];
  networks?: { name: string }[];
  production_companies?: { name: string }[];
  origin_country?: string[];
}

export interface SeriesPageDetails extends TVSeries {
  tagline: string;
  originalLanguage: string;
  status: string;
  seasonsLabel: string;
  episodeRuntime?: string;
  creators: string[];
  networks: string[];
  productionCompanies: string[];
  countryOfOrigin: string[];
  genreLinks: { id: number; name: string }[];
}

function formatEpisodeRuntime(minutes: number | undefined): string | undefined {
  if (!minutes) return undefined;
  return `${minutes}min`;
}

function formatSeasons(count: number | null): string {
  if (!count) return "";
  return count === 1 ? "Season 1" : `${count} seasons`;
}

export async function getSeriesPageDetails(
  seriesId: number,
): Promise<SeriesPageDetails | null> {
  try {
    const show = await tmdbFetch<TMDBSeriesPage>(`/tv/${seriesId}`);
    const languageName = new Intl.DisplayNames(["en"], {
      type: "language",
    }).of(show.original_language);

    return {
      ...mapSeries(
        show,
        show.genres.map((genre) => genre.name),
        formatSeasons(show.number_of_seasons),
      ),
      tagline: show.tagline ?? "",
      originalLanguage: languageName ?? show.original_language,
      status: show.status,
      seasonsLabel: formatSeasons(show.number_of_seasons),
      episodeRuntime: formatEpisodeRuntime(show.episode_run_time?.[0]),
      creators: (show.created_by ?? []).map((person) => person.name),
      networks: (show.networks ?? []).map((network) => network.name),
      productionCompanies: (show.production_companies ?? []).map(
        (company) => company.name,
      ),
      countryOfOrigin: show.origin_country ?? [],
      genreLinks: show.genres.map((genre) => ({
        id: genre.id,
        name: genre.name,
      })),
    };
  } catch (error) {
    if (error instanceof TMDBError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
