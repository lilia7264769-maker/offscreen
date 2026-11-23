"use client";

import { useEffect, useMemo, useState } from "react";
import CollectionBrowse from "@/components/collection/CollectionBrowse";
import { useSavedTitles } from "@/components/collection/useSavedTitles";
import { authClient } from "@/lib/auth-client";
import {
  ACCOUNT_FAVORITES_EVENT,
  loadAccountFavorites,
  syncGuestFavorites,
} from "@/lib/favorites-client";
import { savedToMedia, type SavedTitle } from "@/lib/storage";

export default function FavoritesBrowse() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id ?? null;
  const guest = useSavedTitles("favorites");
  const [account, setAccount] = useState<SavedTitle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending || !userId) return;

    let cancelled = false;

    async function load() {
      await syncGuestFavorites();
      if (cancelled) return;

      try {
        const items = await loadAccountFavorites();
        if (!cancelled) {
          setAccount(items);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Saved titles could not be loaded.");
      }
    }

    void load();

    function onAccountChange() {
      void load();
    }

    window.addEventListener(ACCOUNT_FAVORITES_EVENT, onAccountChange);
    return () => {
      cancelled = true;
      window.removeEventListener(ACCOUNT_FAVORITES_EVENT, onAccountChange);
    };
  }, [isPending, userId]);

  const saved = isPending || userId ? (account ?? []) : guest;
  const ready = !isPending && (!userId || account !== null || Boolean(error));
  const genres = useMemo(() => {
    const names = new Set<string>();

    for (const item of saved) {
      for (const genre of item.genres) {
        const label = genre.trim().toLowerCase();
        if (label) names.add(label);
      }
    }

    return [...names]
      .sort((a, b) => a.localeCompare(b))
      .map((label) => ({ value: label, label }));
  }, [saved]);

  return (
    <CollectionBrowse
      title="Favorites"
      subtitle="Titles you set aside."
      genres={genres}
      mode="local"
      initial={{
        results: saved.map(savedToMedia),
        page: 1,
        totalPages: 1,
      }}
      emptyLabel={
        error
          ? error
          : ready
            ? "Nothing saved yet."
            : ""
      }
    />
  );
}
