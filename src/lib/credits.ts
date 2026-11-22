import { tmdbFetch } from "./client";
import type { MovieCastMember } from "@/types/movie";

const TMDB_IMAGE = "https://image.tmdb.org/t/p";

interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

interface TMDBCreditsResponse {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface MovieCredits {
  cast: MovieCastMember[];
  directors: string[];
  writers: string[];
}

export async function getMovieCredits(movieId: number): Promise<MovieCredits> {
  const credits = await tmdbFetch<TMDBCreditsResponse>(
    `/movie/${movieId}/credits`,
  );

  return {
    cast: credits.cast
      .sort((first, second) => first.order - second.order)
      .slice(0, 12)
      .map((person) => ({
        id: person.id,
        name: person.name,
        character: person.character,
        profilePath: person.profile_path
          ? `${TMDB_IMAGE}/w185${person.profile_path}`
          : null,
      })),
    directors: credits.crew
      .filter((person) => person.job === "Director")
      .map((person) => person.name),
    writers: credits.crew
      .filter((person) =>
        ["Writer", "Screenplay", "Story"].includes(person.job),
      )
      .map((person) => person.name),
  };
}