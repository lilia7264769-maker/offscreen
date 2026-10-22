import Image from "next/image";
// import Badge from "../ui/Badge";
import type { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="flex flex-col group cursor-pointer w-full max-w-[200px]">
      <div className="relative aspect-[2/3] w-full rounded-[var(--radius-12px)] overflow-hidden bg-bg-grey">
        <Image
          src={movie.posterPath}
          alt={movie.title}
          fill
          sizes="200px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />

        {/*рейтинг*/}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[6px] bg-[var(--color-white)] text-[var((--color-brand-blue)] text-xs font-bold">
          {movie.rating.toFixed(1)}
        </div>
      </div>

      {/* Текстовый блок под постером */}
      <div className="flex items-center text-xs font-medium text-black-low gap-1">
        <span>{movie.releaseYear}</span>
        {movie.genres && movie.genres.length > 0 && (
          <>
            <span className="mx-0.5">•</span>
            <span className="truncate">{movie.genres[0]}</span>
          </>
        )}
      </div>
    </div>
  );
}
