"use client";

import { useEffect, useRef, useState } from "react";
import LoadMore from "@/components/collection/LoadMore";
import MediaFlexList from "@/components/collection/MediaFlexList";
import type { Media } from "@/types/movie";

const CARD_WIDTH = 196;
const COLUMN_GAP = 20;
const ROWS_PER_BATCH = 7;

interface PagedPosterGridProps {
  items: Media[];
  hasMore: boolean;
  loading: boolean;
  error?: string | null;
  resetKey: string;
  onLoad?: () => void;
  emptyLabel?: string;
}

export default function PagedPosterGrid({
  items,
  hasMore,
  loading,
  error,
  resetKey,
  onLoad,
  emptyLabel,
}: PagedPosterGridProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<number | null>(null);
  const [batches, setBatches] = useState(1);
  const [seenKey, setSeenKey] = useState(resetKey);

  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setBatches(1);
  }

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const width = frame.clientWidth;
      if (width < CARD_WIDTH) return;

      const nextColumns = Math.max(
        1,
        Math.floor((width + COLUMN_GAP) / (CARD_WIDTH + COLUMN_GAP)),
      );
      setColumns(nextColumns);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const ready = columns !== null;
  const limit = (columns ?? 1) * ROWS_PER_BATCH * batches;
  const needsMoreData = ready && items.length < limit && hasMore && !error;

  useEffect(() => {
    if (!needsMoreData || loading || !onLoad) return;
    onLoad();
  }, [loading, needsMoreData, onLoad]);

  const visibleItems = ready ? items.slice(0, limit) : items;
  const canLoadAnotherBatch =
    ready && !needsMoreData && (items.length > limit || hasMore);

  return (
    <div ref={frameRef} className="flex flex-col gap-8">
      <MediaFlexList
        items={visibleItems}
        emptyLabel={visibleItems.length === 0 ? emptyLabel : undefined}
      />
      {canLoadAnotherBatch && (
        <LoadMore onLoad={() => setBatches((current) => current + 1)} />
      )}
    </div>
  );
}
