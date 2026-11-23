import {
  clearFavorites,
  isSavedTitle,
  readFavorites,
  type SavedTitle,
} from "@/lib/storage";
import type { ContentType } from "@/types/movie";

export const ACCOUNT_FAVORITES_EVENT = "offscreen-account-favorites";

export type SyncResult = "empty" | "synced" | "failed";

function notifyAccountFavorites() {
  window.dispatchEvent(new Event(ACCOUNT_FAVORITES_EVENT));
}

export async function syncGuestFavorites(): Promise<SyncResult> {
  const items = readFavorites();
  if (items.length === 0) return "empty";

  try {
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          mediaId: item.id,
          mediaType: item.type,
        })),
      }),
    });

    if (!response.ok) return "failed";

    clearFavorites();
    notifyAccountFavorites();
    return "synced";
  } catch {
    return "failed";
  }
}

export async function loadAccountFavorites(): Promise<SavedTitle[]> {
  const response = await fetch("/api/favorites");
  if (!response.ok) {
    throw new Error("Saved titles could not be loaded.");
  }

  const data: { favorites?: unknown } = await response.json();
  if (!Array.isArray(data.favorites)) return [];
  return data.favorites.filter(isSavedTitle);
}

export async function fetchFavoriteSaved(
  type: ContentType,
  id: number,
): Promise<boolean> {
  const params = new URLSearchParams({
    mediaId: String(id),
    mediaType: type,
  });
  const response = await fetch(`/api/favorites?${params}`);
  if (!response.ok) return false;

  const data: { saved?: boolean } = await response.json();
  return Boolean(data.saved);
}

export async function setAccountFavorite(
  item: SavedTitle,
  saved: boolean,
): Promise<boolean> {
  const response = await fetch("/api/favorites", {
    method: saved ? "POST" : "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mediaId: item.id,
      mediaType: item.type,
    }),
  });

  if (!response.ok) return false;

  notifyAccountFavorites();
  return true;
}
