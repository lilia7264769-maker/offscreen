"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SearchResults from "./SearchResults";
import type { Movie } from "@/types/movie";

interface SearchResultsPanelProps {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  query: string;
}

interface ScrollbarState {
  height: number;
  top: number;
  visible: boolean;
}

export default function SearchResultsPanel({
  movies,
  isLoading,
  error,
  query,
}: SearchResultsPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startTop: number } | null>(null);
  const [scrollbar, setScrollbar] = useState<ScrollbarState>({
    height: 0,
    top: 0,
    visible: false,
  });

  const updateScrollbar = useCallback(() => {
    const scrollElement = scrollRef.current;
    const trackElement = trackRef.current;
    if (!scrollElement || !trackElement) return;

    const trackHeight = trackElement.clientHeight;
    const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
    if (trackHeight <= 0 || maxScroll <= 0) {
      setScrollbar({ height: 0, top: 0, visible: false });
      return;
    }

    const height = Math.min(
      trackHeight,
      Math.max(
        24,
        (scrollElement.clientHeight / scrollElement.scrollHeight) * trackHeight,
      ),
    );
    const top =
      (scrollElement.scrollTop / maxScroll) * (trackHeight - height);

    setScrollbar({ height, top, visible: true });
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    updateScrollbar();
    const observer = new ResizeObserver(updateScrollbar);
    observer.observe(scrollElement);
    if (scrollElement.firstElementChild) {
      observer.observe(scrollElement.firstElementChild);
    }

    return () => observer.disconnect();
  }, [updateScrollbar, movies, isLoading, error]);

  const handleThumbPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    dragRef.current = {
      startY: event.clientY,
      startTop: scrollbar.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleThumbPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const drag = dragRef.current;
    const scrollElement = scrollRef.current;
    const trackElement = trackRef.current;
    if (!drag || !scrollElement || !trackElement) return;

    const trackRange = trackElement.clientHeight - scrollbar.height;
    if (trackRange <= 0) return;

    const scrollRange = scrollElement.scrollHeight - scrollElement.clientHeight;
    const nextTop = Math.max(
      0,
      Math.min(trackRange, drag.startTop + event.clientY - drag.startY),
    );
    scrollElement.scrollTop = (nextTop / trackRange) * scrollRange;
  };

  const stopDragging = () => {
    dragRef.current = null;
  };

  return (
    <div className="relative max-h-[min(70vh,480px)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-grey)] border-[length:var(--stroke-width-thin)] bg-[var(--color-bg-main)] text-[var(--color-black)] shadow-genre-card">
      <div
        ref={scrollRef}
        onScroll={updateScrollbar}
        tabIndex={0}
        aria-label="Search results"
        className="max-h-[min(70vh,480px)] overflow-y-auto py-3 pr-2 scrollbar-none focus:outline-none"
      >
        <SearchResults
          movies={movies}
          isLoading={isLoading}
          error={error}
          query={query}
        />
      </div>
      <div
        ref={trackRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-2 right-1 w-1 rounded-full"
      >
        {scrollbar.visible && (
          <div
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            className="pointer-events-auto absolute left-0 w-full touch-none rounded-full bg-[var(--color-black-low)]"
            style={{ height: scrollbar.height, top: scrollbar.top }}
          />
        )}
      </div>
    </div>
  );
}
