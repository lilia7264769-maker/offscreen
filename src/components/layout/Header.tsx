"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import SearchIcon from "@/components/icons/SearchIcon";
import XmarkIcon from "@/components/icons/XmarkIcon";
import MenuIcon from "@/components/icons/MenuIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import SearchResultsPanel from "./SearchResultsPanel";
import SearchResults from "./SearchResults";
import type { Movie } from "@/types/movie";

type HeaderProps = {
  variant?: "light" | "dark";
};

export default function Header({ variant = "light" }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isOverHero, setIsOverHero] = useState(variant === "dark");
  const headerRef = useRef<HTMLElement>(null);

  function closeSearchAndClear() {
    setSearchQuery("");
    setIsSearchOpen(false);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsSearchOpen(false);
    }

    const mediaQuery = window.matchMedia("(max-width: 799px)");
    const updateScrollLock = () => {
      document.body.style.overflow = mediaQuery.matches ? "hidden" : "";
    };
    updateScrollLock();
    mediaQuery.addEventListener("change", updateScrollLock);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      mediaQuery.removeEventListener("change", updateScrollLock);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(
      async () => {
        setIsSearchLoading(true);
        setSearchError(null);

        try {
          const params = new URLSearchParams();
          if (searchQuery.trim()) params.set("q", searchQuery.trim());
          const response = await fetch(`/api/search?${params}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error("Unable to load movies. Please try again.");
          }

          const data: { movies: Movie[] } = await response.json();
          setSearchResults(data.movies);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          setSearchError(
            error instanceof Error
              ? error.message
              : "Unable to load movies. Please try again.",
          );
        } finally {
          if (!controller.signal.aborted) setIsSearchLoading(false);
        }
      },
      searchQuery.trim() ? 250 : 0,
    );

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSearchOpen, searchQuery]);

  useEffect(() => {
    if (variant !== "dark") return;

    const hero = document.getElementById("hero-banner");
    const header = headerRef.current;

    if (!hero || !header) return;

    const heroElement = hero;
    const headerElement = header;

    function updateHeaderTheme() {
      const nextIsOverHero =
        heroElement.getBoundingClientRect().bottom > headerElement.offsetHeight;

      setIsOverHero((current) =>
        current === nextIsOverHero ? current : nextIsOverHero,
      );
    }

    const frame = requestAnimationFrame(updateHeaderTheme);
    window.addEventListener("scroll", updateHeaderTheme, { passive: true });
    window.addEventListener("resize", updateHeaderTheme);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateHeaderTheme);
      window.removeEventListener("resize", updateHeaderTheme);
    };
  }, [variant]);

  return (
    <header
      ref={headerRef}
      className={`z-50 w-full py-4 transition-colors ${
        variant === "dark"
          ? isOverHero
            ? "absolute top-0"
            : "fixed top-0"
          : "sticky top-0"
      }`}
      style={
        variant === "dark" && isOverHero
          ? {
              backgroundColor: "transparent",
              color: "var(--color-white)",
              borderBottom: "none",
            }
          : {
              backgroundColor: "var(--color-bg-main)",
              color: "var(--color-black)",
              borderBottom: "0.4px solid rgba(30, 37, 47, 0.1)",
            }
      }
    >
      {/* ИСПОЛЬЗУЕМ НАШ КЛАСС СЕТКИ ТУТ */}
      <div className="container-grid flex min-w-0 items-center justify-between gap-4">
        <div
          className={`flex min-w-0 items-center gap-11 ${
            isSearchOpen ? "hidden min-[800px]:flex" : ""
          }`}
        >
          <Link
            href="/"
            aria-label="Offscreen home"
            className="flex items-center hover:scale-[1.05]"
          >
            <Logo />
          </Link>

          <div className="relative hidden w-full max-w-[360px] flex-1 min-[800px]:block">
            <div
              className={`flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,currentColor_50%,transparent)] border-[length:var(--stroke-width-thin)] px-3 py-2 ${
                searchQuery
                  ? "opacity-100"
                  : "opacity-40 focus-within:opacity-70"
              }`}
            >
              <SearchIcon />
              <input
                type="text"
                placeholder="Discover..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search movies"
                className="w-full min-w-0 bg-transparent text-base text-current placeholder:text-current focus:outline-none"
              />
              {isSearchOpen && (
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={closeSearchAndClear}
                  className="flex shrink-0 items-center transition-transform hover:scale-[1.05]"
                >
                  <XmarkIcon />
                </button>
              )}
            </div>
            {isSearchOpen && (
              <div className="absolute left-0 top-full z-[70] mt-2 w-full">
                <SearchResultsPanel
                  movies={searchResults}
                  isLoading={isSearchLoading}
                  error={searchError}
                  query={searchQuery}
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`min-w-0 ${isSearchOpen ? "max-[799px]:hidden" : ""}`}>
          <ul className="flex items-center gap-5 text-base font-semibold min-[800px]:gap-6">
            <li className="flex items-center min-[800px]:hidden">
              <button
                type="button"
                aria-label="Open search"
                onClick={() => setIsSearchOpen(true)}
                className="flex size-[var(--icon-size-default)] shrink-0 cursor-pointer items-center justify-center transition-transform hover:scale-[1.05]"
              >
                <SearchIcon />
              </button>
            </li>

            <li className="flex items-center">
              <Link
                href="/catalog"
                aria-label="Catalog"
                className="inline-flex items-center transition-transform hover:scale-[1.05]"
              >
                <span className="hidden min-[800px]:inline">Catalog</span>
                <span className="flex size-[var(--icon-size-default)] items-center justify-center min-[800px]:hidden">
                  <MenuIcon />
                </span>
              </Link>
            </li>

            <li className="flex items-center">
              <Link
                href="/favorites"
                aria-label="Favorites"
                className="inline-flex items-center transition-transform hover:scale-[1.05]"
              >
                <span className="hidden min-[800px]:inline">Favorites</span>
                <span className="flex size-[var(--icon-size-default)] items-center justify-center min-[800px]:hidden">
                  <HeartIcon />
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col gap-2 bg-[var(--color-bg-main)] text-[var(--color-black)] min-[800px]:hidden">
          <div className="flex items-center gap-3 border-b border-[var(--color-border-grey)] px-4 py-4">
            <SearchIcon className="shrink-0" />
            <input
              type="text"
              placeholder="Discover..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoFocus
              aria-label="Search movies"
              className="min-w-0 flex-1 bg-transparent text-base text-[var(--color-black)] placeholder:text-[var(--color-black-mid)] focus:outline-none"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={closeSearchAndClear}
              className="flex shrink-0 items-center"
            >
              <XmarkIcon />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto py-4">
            <div className="scrollbar-none h-full overflow-y-auto">
              <SearchResults
                movies={searchResults}
                isLoading={isSearchLoading}
                error={searchError}
                query={searchQuery}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
