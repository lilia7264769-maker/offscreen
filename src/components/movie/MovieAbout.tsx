"use client";

import { useEffect, useRef, useState } from "react";
import PlusIcon from "@/components/icons/PlusIcon";

interface AboutFact {
  label: string;
  value: string;
}

interface MovieAboutProps {
  idSuffix: string;
  alwaysExpanded?: boolean;
  columns?: boolean;
  facts: AboutFact[];
}

function AboutFactItem({ label, value }: AboutFact) {
  return (
    <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-2 text-xs">
      <dt className="text-[10px] font-semibold uppercase text-[var(--color-black-mid)]">
        {label}
      </dt>
      <dd
        className={
          label === "Rating"
            ? "break-words text-[var(--color-brand-blue)]"
            : "break-words"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function AboutFacts({
  facts,
  columns = false,
}: {
  facts: AboutFact[];
  columns?: boolean;
}) {
  if (!columns) {
    return (
      <dl className="grid grid-cols-1 gap-3">
        {facts.map((fact) => (
          <AboutFactItem key={fact.label} {...fact} />
        ))}
      </dl>
    );
  }

  const midpoint = Math.ceil(facts.length / 2);
  const columnFacts = [facts.slice(0, midpoint), facts.slice(midpoint)];

  return (
    <div className="grid grid-cols-2 gap-x-6">
      {columnFacts.map((column) => (
        <dl key={column[0]?.label} className="flex min-w-0 flex-col gap-3">
          {column.map((fact) => (
            <AboutFactItem key={fact.label} {...fact} />
          ))}
        </dl>
      ))}
    </div>
  );
}

export default function MovieAbout({
  idSuffix,
  alwaysExpanded = false,
  columns = false,
  facts,
}: MovieAboutProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [suppressHover, setSuppressHover] = useState(false);
  const titleId = `about-title-${idSuffix}`;
  const isExpanded =
    alwaysExpanded || isPinned || (isHovered && !suppressHover);

  useEffect(() => {
    if (alwaysExpanded || !isExpanded) return;

    function handlePointerDown(event: PointerEvent) {
      if (sectionRef.current?.contains(event.target as Node)) return;

      setIsPinned(false);
      setIsHovered(false);
      setSuppressHover(true);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [alwaysExpanded, isExpanded]);

  function toggleExpanded() {
    if (alwaysExpanded) return;

    setIsPinned((pinned) => {
      const next = !pinned;
      setSuppressHover(!next);
      return next;
    });
  }

  const heading = (labelled: boolean) => (
    <div className="mb-4 flex items-center justify-between">
      <h2 id={labelled ? titleId : undefined} className="text-xl font-extrabold">
        About
      </h2>
      {!alwaysExpanded && (
        <button
          type="button"
          aria-label={
            isExpanded ? "Collapse movie details" : "Expand movie details"
          }
          aria-expanded={isExpanded}
          className="pointer-events-none flex size-8 items-center justify-center rounded-full text-[var(--color-black-mid)]"
        >
          <PlusIcon
            className={`transition-[rotate] duration-300 ${
              isExpanded ? "rotate-45" : "rotate-0"
            }`}
          />
        </button>
      )}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby={titleId}
      onClick={toggleExpanded}
      onPointerEnter={(event) => {
        if (!alwaysExpanded && event.pointerType === "mouse") {
          setIsHovered(true);
          setSuppressHover(false);
        }
      }}
      onPointerLeave={(event) => {
        if (!alwaysExpanded && event.pointerType === "mouse") {
          setIsHovered(false);
          setSuppressHover(false);
        }
      }}
      className={`rounded-[var(--radius-card)] bg-[var(--color-bg-about)] p-5 ${
        alwaysExpanded ? "" : "relative z-20 cursor-pointer"
      }`}
    >
      {alwaysExpanded ? (
        <>
          {heading(true)}
          <AboutFacts facts={facts} columns={columns} />
        </>
      ) : (
        <>
          <div aria-hidden={isExpanded}>
            {heading(!isExpanded)}
            <div className="max-h-[148px] overflow-hidden">
              <AboutFacts facts={facts} />
            </div>
          </div>
          {isExpanded && (
            <div className="absolute inset-x-0 top-0 z-10 rounded-[var(--radius-card)] bg-[var(--color-bg-about)] p-5 shadow-[0_8px_22px_rgba(30,37,47,0.08)]">
              {heading(true)}
              <AboutFacts facts={facts} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
