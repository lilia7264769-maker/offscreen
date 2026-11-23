"use client";

import { useRef, useState } from "react";
import GenreCard from "@/components/genre/GenreCard";
import { genres } from "@/data/genres";

export default function GenreRow() {
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const container = event.currentTarget;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: container.scrollLeft,
    };
    container.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.currentTarget.scrollLeft =
      drag.scrollLeft - (event.clientX - drag.startX);
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;

    dragRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section>
      <div className="mb-3 px-14 md:mb-4">
        <h2 className="--header2 font-bold">Genres</h2>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        className={`-my-4 -ml-4 w-[calc(100%+2rem)] min-w-0 overflow-x-auto overscroll-x-contain scrollbar-none py-4 touch-auto select-none [-webkit-overflow-scrolling:touch] md:ml-0 md:w-full ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div className="grid w-max grid-flow-col grid-rows-[repeat(2,112px)] auto-cols-[128px] gap-3 pl-4 sm:flex sm:min-w-full sm:justify-between md:pl-0">
          {genres.map((genre) => (
            <GenreCard key={genre.title} {...genre} />
          ))}
        </div>
      </div>
    </section>
  );
}
