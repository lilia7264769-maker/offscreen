"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import SwitchIcon from "@/components/icons/SwitchIcon";

interface HorizontalMediaRowProps {
  title: string;
  children: ReactNode;
  trackClassName?: string;
}

export default function HorizontalMediaRow({
  title,
  children,
  trackClassName = "",
}: HorizontalMediaRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    scrollLeft: number;
    isDragging: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const overflows = track.scrollWidth > track.clientWidth + 1;
    setCanScroll(overflows);
    setCanScrollBack(overflows && track.scrollLeft > 1);
    setCanScrollForward(
      overflows && track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    Array.from(track.children).forEach((child) => observer.observe(child));
    updateScrollState();

    return () => observer.disconnect();
  }, [updateScrollState, children]);

  function scrollByPage(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

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
    <section className="w-full min-w-0">
      <div className="mb-4 flex min-h-8 items-center justify-between md:mb-5">
        <h2 className="text-2xl font-extrabold">{title}</h2>
        {canScroll && (canScrollBack || canScrollForward) && (
          <div className="hidden items-center gap-2 min-[768px]:flex">
            {canScrollBack && (
              <button
                type="button"
                aria-label={`Scroll ${title} backward`}
                onClick={() => scrollByPage(-1)}
                className="group rounded-full text-[var(--color-black-mid)] transition-colors hover:text-[var(--color-brand-blue)]"
              >
                <SwitchIcon className="-scale-x-100" />
              </button>
            )}
            {canScrollForward && (
              <button
                type="button"
                aria-label={`Scroll ${title} forward`}
                onClick={() => scrollByPage(1)}
                className="group rounded-full text-[var(--color-black-mid)] transition-colors hover:text-[var(--color-brand-blue)]"
              >
                <SwitchIcon />
              </button>
            )}
          </div>
        )}
      </div>
      <div
        ref={trackRef}
        onScroll={updateScrollState}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onClickCapture={suppressDraggedClick}
        className={`-ml-4 flex w-[calc(100%+2rem)] min-w-0 gap-3 overflow-x-auto overscroll-x-contain pb-2 pl-4 scrollbar-none select-none touch-pan-x [-webkit-overflow-scrolling:touch] md:ml-0 md:w-full md:pl-0 ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${trackClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
