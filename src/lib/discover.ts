import { tmdbFetch } from "./client";
import type { ContentType, Media } from "@/types/movie";

const TMDB_IMAGE = "https://image.tmdb.org/t/p";

export type SortKey = "rating" | "newest" | "popularity";
export type DiscoverKind = "movie" | "tv" | "all";

export interface GenreOption {
  id: number;
  name: string;
}

export interface CountryOption {
  code: string;
  name: string;
}

export interface DiscoverParams {
  kind: DiscoverKind;
  sort: SortKey;
  page: number;
  genreId?: number;
  year?: number;
  country?: string;
  companyId?: number;
}

export interface DiscoverPage {
  results: Media[];
  page: number;
  totalPages: number;
}

const SORT: Record<ContentType, Record<SortKey, string>> = {
  movie: {
    rating: "vote_average.desc",
    newest: "primary_release_date.desc",
    popularity: "popularity.desc",
  },
  tv: {
    rating: "vote_average.desc",
    newest: "first_air_date.desc",
    popularity: "popularity.desc",
  },
};

interface TMDBListItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids?: number[];
  popularity: number;
}

interface TMDBListResponse {
  results: TMDBListItem[];
  page: number;
  total_pages: number;
}

interface TMDBGenreList {
  genres: GenreOption[];
}

interface TMDBCountry {
  iso_3166_1: string;
  english_name: string;
}

function mapItem(
  item: TMDBListItem,
  kind: ContentType,
  genresById: Map<number, string>,
): Media {
  const date = kind === "movie" ? item.release_date : item.first_air_date;

  return {
    id: item.id,
    title: (kind === "movie" ? item.title : item.name) ?? "",
    type: kind,
    posterPath: item.poster_path
      ? `${TMDB_IMAGE}/w500${item.poster_path}`
      : null,
    backdropPath: item.backdrop_path
      ? `${TMDB_IMAGE}/original${item.backdrop_path}`
      : null,
    releaseYear: date ? Number(date.slice(0, 4)) : 0,
    genres: (item.genre_ids ?? [])
      .map((id) => genresById.get(id))
      .filter((name): name is string => Boolean(name)),
    rating: item.vote_average,
    overview: item.overview,
    popularity: item.popularity,
  };
}

export async function getGenres(kind: ContentType): Promise<GenreOption[]> {
  const data = await tmdbFetch<TMDBGenreList>(`/genre/${kind}/list`);
  return data.genres;
}

export async function getCountries(): Promise<CountryOption[]> {
  const data = await tmdbFetch<TMDBCountry[]>("/configuration/countries");

  return data
    .map((country) => ({
      code: country.iso_3166_1,
      name: country.english_name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchKind(
  kind: ContentType,
  params: DiscoverParams,
  genresById: Map<number, string>,
): Promise<DiscoverPage> {
  const search = new URLSearchParams({
    include_adult: "false",
    page: String(params.page),
    sort_by: SORT[kind][params.sort],
  });

  // A vote floor keeps a handful of perfect scores from outranking known films.
  if (params.sort === "rating") search.set("vote_count.gte", "200");
  if (params.sort === "newest") {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    search.set(
      kind === "movie" ? "primary_release_date.lte" : "first_air_date.lte",
      today,
    );
  }
  if (params.genreId) search.set("with_genres", String(params.genreId));
  if (params.year) {
    search.set(
      kind === "movie" ? "primary_release_year" : "first_air_date_year",
      String(params.year),
    );
  }
  if (params.country) search.set("with_origin_country", params.country);
  if (kind === "movie" && params.companyId) {
    search.set("with_companies", String(params.companyId));
  }

  const data = await tmdbFetch<TMDBListResponse>(
    `/discover/${kind}?${search.toString()}`,
  );

  return {
    results: data.results.map((item) => mapItem(item, kind, genresById)),
    page: data.page,
    totalPages: data.total_pages,
  };
}

function sortResults(results: Media[], sort: SortKey): Media[] {
  return [...results].sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "newest") return b.releaseYear - a.releaseYear;
    return (b.popularity ?? 0) - (a.popularity ?? 0);
  });
}

export async function discoverMedia(
  params: DiscoverParams,
): Promise<DiscoverPage> {
  if (params.kind === "all") {
    const [movieGenres, tvGenres] = await Promise.all([
      getGenres("movie"),
      getGenres("tv"),
    ]);
    const [movies, series] = await Promise.all([
      fetchKind("movie", params, new Map(movieGenres.map((genre) => [genre.id, genre.name]))),
      fetchKind("tv", params, new Map(tvGenres.map((genre) => [genre.id, genre.name]))),
    ]);

    return {
      results: sortResults([...movies.results, ...series.results], params.sort),
      page: params.page,
      totalPages: Math.max(movies.totalPages, series.totalPages),
    };
  }

  const genres = await getGenres(params.kind);
  return fetchKind(
    params.kind,
    params,
    new Map(genres.map((genre) => [genre.id, genre.name])),
  );
}
