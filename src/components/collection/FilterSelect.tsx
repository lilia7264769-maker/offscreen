"use client";

import { useEffect, useRef } from "react";
import ArrowIcon01 from "@/components/icons/ArrowIcon01";

export interface Choice {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: Choice[];
  open: boolean;
  keepLabel?: boolean;
  className?: string;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
}

export default function FilterSelect({
  label,
  value,
  options,
  open,
  keepLabel = false,
  className = "",
  onOpenChange,
  onChange,
}: FilterSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const buttonLabel = keepLabel || !selected?.value ? label : selected.label;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      onOpenChange(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => onOpenChange(!open)}
        className="flex w-full min-w-0 items-center justify-center gap-2 rounded-full border border-[var(--color-brand-blue)] bg-[var(--color-bg-main)] px-4 py-2 text-[14px] font-medium text-[var(--color-brand-blue)]"
      >
        <span className="min-w-0 truncate">{buttonLabel}</span>
        <span
          className={`inline-flex shrink-0 transition-[rotate] duration-200 ${
            open ? "rotate-90" : "-rotate-90"
          }`}
        >
          <ArrowIcon01 size={20} />
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-[calc(100%+8px)] z-30 flex max-h-72 min-w-full flex-col overflow-y-auto rounded-[var(--radius-card)] bg-[var(--color-white)] py-2 shadow-[0_8px_22px_rgba(30,37,47,0.08)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value || option.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    onOpenChange(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-[14px] font-medium hover:bg-[var(--color-bg-grey)] ${
                    isSelected
                      ? "text-[var(--color-brand-blue)]"
                      : "text-[var(--color-black)]"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
