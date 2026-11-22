"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import MediaCard from "@/components/movie/MediaCard";
import type { Media } from "@/types/movie";
import Button from "@/components/ui/Button";
import ChevronsRightIcon from "@/components/icons/ChevronsRightIcon";

interface MediaRowProps {
  title: string;
  media: Media[];
  href: string;
}

export default function MediaRow({ title, media, href }: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    isDragging: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const container = event.currentTarget;
    suppressClickRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: container.scrollLeft,
      isDragging: false,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    if (!drag.isDragging) {
      if (Math.abs(deltaX) < 6) return;

      drag.isDragging = true;
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }

    event.preventDefault();
    event.currentTarget.scrollLeft = drag.scrollLeft - deltaX;
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;

    dragRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const suppressDraggedClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;

    suppressClickRef.current = false;
    if (event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between pl-4 pr-0 md:mb-5 md:px-14">
        <Link href={href} className="inline-block header2 hover:scale-[1.05]">
          {title}
        </Link>

        <Button variant="text" href={href} className="gap-1 !px-0 md:!px-6">
          <span className="sr-only md:not-sr-only">view all</span>
          <ChevronsRightIcon
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Button>
      </div>

      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onClickCapture={suppressDraggedClick}
        className={`-ml-4 flex w-[calc(100%+2rem)] min-w-0 gap-3 overflow-x-auto overscroll-x-contain scrollbar-none py-1 pl-4 touch-auto select-none [-webkit-overflow-scrolling:touch] md:ml-0 md:w-full md:pl-0 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {media.map((item) => (
          <MediaCard key={`${item.type}-${item.id}`} media={item} />
        ))}
      </div>
    </section>
  );
}
