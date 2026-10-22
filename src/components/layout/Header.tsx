"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import SearchIcon from "@/components/icons/SearchIcon";
import XmarkCircleIcon from "@/components/icons/XmarkCircleIcon";

type HeaderProps = {
  variant?: "light" | "dark";
};

export default function Header({ variant = "light" }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`w-full py-4 ${
        variant === "light"
          ? "bg-[var(--color-bg-main)] text-[var(--color-black)] border-b-[length:var(--stroke-width-thin)] border-b-[color:rgba(30,37,47,0.2)]"
          : "text-[var(--color-white)] border-none"
      }`}
    >
      {" "}
      <div className="container mx-auto flex h-full max-w-[1400px] items-center justify-between gap-4 px-10">
        <div className="flex items-center gap-11">
          <Link
            href="/"
            aria-label="Offscreen home"
            className="flex items-center"
          >
            <Logo />
          </Link>

          {/* Search */}
          <div className="hidden min-[800px]:flex w-full max-w-[360px] flex-1 items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,currentColor_50%,transparent)] border-[length:var(--stroke-width-thin)] px-3 py-2 opacity-40 focus-within:opacity-70">
            <SearchIcon />

            <input
              type="text"
              placeholder="Discover..."
              className="w-full min-w-0 bg-transparent text-base font-1 text-current placeholder:text-current focus:outline-none focus:placeholder-transparent"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav ref={searchRef} className="min-w-0">
          {isSearchOpen ? (
            <div className="flex min-w-0 items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,currentColor_50%,transparent)] border-[length:var(--stroke-width-thin)] px-3 py-2">
              <SearchIcon />

              <input
                type="text"
                placeholder="Discover..."
                autoFocus
                className="w-full min-w-0 bg-transparent text-base text-current placeholder:text-current focus:outline-none focus:placeholder-transparent"
              />

              <button
                type="button"
                aria-label="Close search"
                onClick={() => setIsSearchOpen(false)}
                className="flex shrink-0 cursor-pointer items-center"
              >
                <XmarkCircleIcon className="opacity-40" />
              </button>
            </div>
          ) : (
            <ul className="flex items-center gap-6 text-base font-semibold">
              <li className="min-[800px]:hidden">
                <button
                  type="button"
                  aria-label="Open search"
                  //onClick={() => setIsSearchOpen(true)}
                  onClick={() => {
                    console.log("Search clicked");
                    setIsSearchOpen(true);
                  }}
                  className="flex cursor-pointer items-center"
                >
                  <SearchIcon />
                </button>
              </li>

              <li>
                <Link href="/catalog">Catalog</Link>
              </li>

              <li>
                <Link href="/favorites" className="relative inline-block">
                  Favorites
                </Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
}
