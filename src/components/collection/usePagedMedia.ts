"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Media } from "@/types/movie";

interface PagePayload {
  results: Media[];
  page: number;
  totalPages: number;
}

interface UsePagedMediaOptions {
  enabled: boolean;
  query: string;
  initial: PagePayload;
}

function dedupe(items: Media[]): Media[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.type}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function usePagedMedia({
  enabled,
  query,
  initial,
}: UsePagedMediaOptions) {
  const [items, setItems] = useState(initial.results);
  const [page, setPage] = useState(initial.page);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipFirstFetch = useRef(true);
  const generation = useRef(0);
  const refreshing = useRef(false);
  const loadingRef = useRef(false);
  const pageRef = useRef(initial.page);
  const totalPagesRef = useRef(initial.totalPages);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    totalPagesRef.current = totalPages;
  }, [totalPages]);

  useEffect(() => {
    if (!enabled) return;
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    const current = ++generation.current;
    const controller = new AbortController();
    refreshing.current = true;
    setLoading(true);
    setError(null);

    fetch(`${query}&page=1`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load titles");
        return response.json() as Promise<PagePayload>;
      })
      .then((data) => {
        if (generation.current !== current) return;
        setItems(data.results);
        setPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        if (generation.current !== current) return;
        setError("These titles could not be loaded.");
      })
      .finally(() => {
        if (generation.current !== current) return;
        refreshing.current = false;
        setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, query]);

  const loadMore = useCallback(() => {
    if (
      !enabled ||
      refreshing.current ||
      loadingRef.current ||
      pageRef.current >= totalPagesRef.current
    ) {
      return;
    }

    const current = generation.current;
    const nextPage = pageRef.current + 1;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    fetch(`${query}&page=${nextPage}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load titles");
        return response.json() as Promise<PagePayload>;
      })
      .then((data) => {
        if (generation.current !== current) return;
        setItems((currentItems) => dedupe([...currentItems, ...data.results]));
        setPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch(() => {
        if (generation.current !== current) return;
        setError("These titles could not be loaded.");
      })
      .finally(() => {
        loadingRef.current = false;
        if (generation.current === current) setLoading(false);
      });
  }, [enabled, query]);

  return {
    items,
    page,
    totalPages,
    loading,
    error,
    hasMore: enabled && page < totalPages,
    loadMore,
  };
}
