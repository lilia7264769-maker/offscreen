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
