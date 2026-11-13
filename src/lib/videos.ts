import { tmdbFetch } from "./client";

interface TMDBVideo {
  // одно видео. описываем те свойства кот нам нужны
  key: string;
  site: string;
  type: string;
  official: boolean;
}

interface TMDBVideoResponse {
  // массив таких видео от тмдб по конкр фильму будет
  results: TMDBVideo[];
}

export async function getMovieTrailers(movieId: number): Promise<string[]> {
  const data = await tmdbFetch<TMDBVideoResponse>(`/movie/${movieId}/videos`);

  return data.results
    .filter(
      (video) =>
        video.site === "YouTube" && video.type === "Trailer" && video.official,
    )
    .map((video) => video.key);
}
