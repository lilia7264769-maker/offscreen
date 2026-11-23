"use client";

import { useMemo } from "react";
import CollectionBrowse from "@/components/collection/CollectionBrowse";
import { useSavedTitles } from "@/components/collection/useSavedTitles";
import { savedToMedia } from "@/lib/storage";

export default function FavoritesBrowse() {
  const saved = useSavedTitles("favorites");
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
      emptyLabel="Nothing saved yet."
    />
  );
}
