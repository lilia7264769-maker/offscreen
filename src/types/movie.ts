export type ContentType = "movie" | "tv"; // ID фильма и ID сериала могут совпадать

export interface Media {
  id: number;
  title: string;
  type: ContentType;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: number;
  genres: string[];
  rating: number;
  overview: string;
}

export interface Movie extends Media {
  type: "movie";
  country?: string;
  runtime?: string;
}

export interface MoviePageDetails extends Movie {
  tagline: string;
  originalLanguage: string;
  status: string;
  budget: number;
  revenue: number;
  productionCompanies: string[];
  countryOfOrigin: string[];
}

export interface MovieCastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface TVSeries extends Media {
  type: "tv";
  country?: string;
  numberOfSeasons?: string;
  numberOfEpisodes?: number;
  status?: string;
}

export interface HeroMovie extends Movie {
  trailerKeys: string[];
}
