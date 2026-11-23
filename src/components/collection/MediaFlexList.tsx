import MediaCard from "@/components/movie/MediaCard";
import type { Media } from "@/types/movie";

interface MediaFlexListProps {
  items: Media[];
  emptyLabel?: string;
}

export default function MediaFlexList({ items, emptyLabel }: MediaFlexListProps) {
  if (items.length === 0 && emptyLabel) {
    return <p className="text-[15px] text-[var(--color-black-mid)]">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-6">
      {items.map((item) => (
        <li key={`${item.type}-${item.id}`} className="flex">
          <MediaCard media={item} />
        </li>
      ))}
    </ul>
  );
}
