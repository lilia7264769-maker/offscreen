import Image from "next/image";

interface TrailerCardProps {
  trailerKey: string;
  movieTitle: string;
  index: number;
  label: string;
  onPlay: () => void;
}

export default function TrailerCard({
  trailerKey,
  movieTitle,
  index,
  label,
  onPlay,
}: TrailerCardProps) {
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Play trailer ${index + 1} for ${movieTitle}`}
      className="group relative aspect-video w-[min(82vw,360px)] shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-bg-grey)]"
    >
      <Image
        src={`https://img.youtube.com/vi/${trailerKey}/hqdefault.jpg`}
        alt=""
        fill
        draggable={false}
        unoptimized
        sizes="(max-width: 640px) 82vw, 360px"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
      <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-brand-blue)] text-[14px] font-semibold text-[var(--color-white)]">
        WATCH
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2 text-left text-sm font-semibold text-white">
        {label}
      </span>
    </button>
  );
}
