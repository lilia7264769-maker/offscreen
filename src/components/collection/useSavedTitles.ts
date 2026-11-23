"use client";

import { useEffect, useState } from "react";
import {
  FAVORITES_KEY,
  SEARCHES_KEY,
  STORAGE_EVENT,
  readFavorites,
  readRecentSearches,
  type SavedTitle,
} from "@/lib/storage";

type SavedList = "favorites" | "searches";

const READERS = {
  favorites: readFavorites,
  searches: readRecentSearches,
} as const;

const KEYS = {
  favorites: FAVORITES_KEY,
  searches: SEARCHES_KEY,
} as const;

export function useSavedTitles(list: SavedList): SavedTitle[] {
  const [items, setItems] = useState<SavedTitle[]>([]);

  useEffect(() => {
    const key = KEYS[list];

    function load() {
      setItems(READERS[list]());
    }

    function onStorage(event: StorageEvent) {
      if (event.key === key) load();
    }

    function onLocalChange(event: Event) {
      if ((event as CustomEvent<string>).detail === key) load();
    }

    load();
    window.addEventListener("storage", onStorage);
    window.addEventListener(STORAGE_EVENT, onLocalChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STORAGE_EVENT, onLocalChange);
    };
  }, [list]);

  return items;
}
