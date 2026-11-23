import type { ContentType, Media } from "@/types/movie";

export const FAVORITES_KEY = "offscreen.favorites";
export const SEARCHES_KEY = "offscreen.recent-searches";
export const STORAGE_EVENT = "offscreen-storage";

const SEARCH_LIMIT = 12;
const FAVORITE_LIMIT = 200;

export interface SavedTitle {
  id: number;
  type: ContentType;
  title: string;
  posterPath: string | null;
  releaseYear: number;
  genres: string[];
  rating: number;
}

function isSavedTitle(value: unknown): value is SavedTitle {
  if (!value || typeof value !== "object") return false;

  const item = value as SavedTitle;
  return (
    Number.isInteger(item.id) &&
    item.id > 0 &&
    (item.type === "movie" || item.type === "tv") &&
    typeof item.title === "string" &&
    (item.posterPath === null || typeof item.posterPath === "string") &&
    Number.isInteger(item.releaseYear) &&
    Array.isArray(item.genres) &&
    item.genres.every((genre) => typeof genre === "string") &&
    typeof item.rating === "number"
  );
}

function readList(key: string): SavedTitle[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isSavedTitle);
  } catch {
    return [];
  }
}

function writeList(key: string, items: SavedTitle[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: key }));
}

function sameTitle(item: SavedTitle, type: ContentType, id: number) {
  return item.type === type && item.id === id;
}

export function readFavorites(): SavedTitle[] {
  return readList(FAVORITES_KEY);
}

export function readRecentSearches(): SavedTitle[] {
  return readList(SEARCHES_KEY);
}

export function hasFavorite(type: ContentType, id: number): boolean {
  return readFavorites().some((item) => sameTitle(item, type, id));
}

export function toggleFavorite(item: SavedTitle): boolean {
  const current = readFavorites();
  const exists = current.some((saved) => sameTitle(saved, item.type, item.id));
  const next = exists
    ? current.filter((saved) => !sameTitle(saved, item.type, item.id))
    : [item, ...current].slice(0, FAVORITE_LIMIT);

  writeList(FAVORITES_KEY, next);
  return !exists;
}

export function rememberSearch(item: SavedTitle) {
  const next = [
    item,
    ...readRecentSearches().filter((saved) => !sameTitle(saved, item.type, item.id)),
  ].slice(0, SEARCH_LIMIT);

  writeList(SEARCHES_KEY, next);
}

export function savedToMedia(item: SavedTitle): Media {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    posterPath: item.posterPath,
    backdropPath: null,
    releaseYear: item.releaseYear,
    genres: item.genres,
    rating: item.rating,
    overview: "",
  };
}
