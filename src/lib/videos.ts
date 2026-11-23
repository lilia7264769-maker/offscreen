import { tmdbFetch } from "./client";

interface TMDBVideo {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

interface TMDBVideoResponse {
  results: TMDBVideo[];
}

export interface MovieTrailer {
  key: string;
  name: string;
}

function isOfficialYouTubeTrailer(video: TMDBVideo) {
  return video.site === "YouTube" && video.type === "Trailer" && video.official;
}

async function fetchVideos(path: string) {
  return tmdbFetch<TMDBVideoResponse>(path);
}

async function fetchMovieVideos(movieId: number) {
  return fetchVideos(`/movie/${movieId}/videos`);
}

export async function getMovieTrailers(movieId: number): Promise<string[]> {
  const data = await fetchMovieVideos(movieId);

  return data.results.filter(isOfficialYouTubeTrailer).map((video) => video.key);
}

export async function getMovieTrailerCards(
  movieId: number,
): Promise<MovieTrailer[]> {
  const data = await fetchMovieVideos(movieId);

  return data.results.filter(isOfficialYouTubeTrailer).map((video) => ({
    key: video.key,
    name: video.name,
  }));
}

export async function getSeriesTrailerCards(
  seriesId: number,
): Promise<MovieTrailer[]> {
  const data = await fetchVideos(`/tv/${seriesId}/videos`);

  return data.results.filter(isOfficialYouTubeTrailer).map((video) => ({
    key: video.key,
    name: video.name,
  }));
}
