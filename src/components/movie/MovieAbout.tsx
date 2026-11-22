"use client";

import { useState } from "react";

interface MovieAboutProps {
  idSuffix: string;
  alwaysExpanded?: boolean;
  facts: {
    label: string;
    value: string;
  }[];
}

export default function MovieAbout({
  idSuffix,
  alwaysExpanded = false,
  facts,
}: MovieAboutProps) {
  const [isHovered, setIsHovered] = useState(false);
  const titleId = `about-title-${idSuffix}`;
  const isExpanded = alwaysExpanded || isHovered;

  return (
    <section
      aria-labelledby={titleId}
      onPointerEnter={(event) => {
        if (!alwaysExpanded && event.pointerType === "mouse")
          setIsHovered(true);
      }}
      onPointerLeave={(event) => {
        if (!alwaysExpanded && event.pointerType === "mouse")
          setIsHovered(false);
      }}
      className="rounded-[var(--radius-card)] bg-[var(--color-bg-grey)] p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 id={titleId} className="text-xl font-extrabold">
          About
        </h2>
        {!alwaysExpanded && (
          <button
            type="button"
            aria-label={
              isHovered ? "Movie details expanded" : "Movie details collapsed"
            }
            aria-expanded={isExpanded}
            tabIndex={-1}
            className="flex size-8 items-center justify-center rounded-full text-[var(--color-black-mid)] transition-colors"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              className={`transition-transform duration-300 ${
                isHovered ? "rotate-180" : ""
              }`}
            >
              <path
                d="M5 12.5L10 7.5L15 12.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out max-[767px]:!max-h-none"
        style={{ maxHeight: isExpanded ? "none" : "148px" }}
      >
        <dl className="grid grid-cols-1 gap-3">
          {facts.map(({ label, value }) => (
            <div
              key={label}
              className="grid grid-cols-[100px_minmax(0,1fr)] gap-2 text-xs"
            >
              <dt className="text-[10px] font-semibold uppercase text-[var(--color-black-mid)]">
                {label}
              </dt>
              <dd
                className={
                  label === "Rating"
                    ? "text-[var(--color-brand-blue)]"
                    : "break-words"
                }
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
