import Image from "next/image";
import Link from "next/link";
import { rememberSearch } from "@/lib/storage";
import type { Movie } from "@/types/movie";

interface SearchResultsProps {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  query: string;
}

export default function SearchResults({
  movies,
  isLoading,
  error,
  query,
}: SearchResultsProps) {
  const message = isLoading
    ? "Searching…"
    : error || (movies.length === 0 ? "No movies found." : null);

  return (
    <div className="min-w-0">
      <h2 className="px-4 pb-2 text-[13px] font-semibold text-[var(--color-black-mid)]">
        {query ? "Search results" : "Popular movies"}
      </h2>

      {message ? (
        <p
          role={error && !isLoading ? "alert" : undefined}
          className="px-4 py-5 text-left text-sm text-[var(--color-black-mid)]"
        >
          {message}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {movies.map((movie) => (
            <li key={movie.id}>
              <Link
                href={`/movie/${movie.id}`}
                onClick={() => {
                  if (!query.trim()) return;

                  rememberSearch({
                    id: movie.id,
                    type: movie.type,
                    title: movie.title,
                    posterPath: movie.posterPath,
                    releaseYear: movie.releaseYear,
                    genres: movie.genres,
                    rating: movie.rating,
                  });
                }}
                className="flex items-center gap-4 px-4 py-2 transition-colors hover:bg-[var(--color-bg-grey)]"
              >
                <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-[var(--radius-badge)] bg-[var(--color-bg-grey)]">
                  {movie.posterPath && (
                    <Image
                      src={movie.posterPath}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-semibold text-[var(--color-black)]">
                    {movie.title}
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-[var(--color-black-mid)]">
                    {movie.releaseYear || "Release date unavailable"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
