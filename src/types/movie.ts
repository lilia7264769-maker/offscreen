export interface Movie {
  id: number;
  title: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: number;
  genres: string[];
  rating: number;
  overview: string;
  country?: string;
  runtime?: string;
}
