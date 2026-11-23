import { prisma } from "@/lib/prisma";
import { getMovieById } from "@/lib/movies";
import { getSeriesById } from "@/lib/series";
import { FAVORITE_LIMIT, type SavedTitle } from "@/lib/storage";
import type { ContentType, Media } from "@/types/movie";

export interface FavoriteRef {
  mediaId: number;
  mediaType: ContentType;
}

function toSavedTitle(media: Media): SavedTitle {
  return {
    id: media.id,
    type: media.type,
    title: media.title,
    posterPath: media.posterPath,
    releaseYear: media.releaseYear,
    genres: media.genres,
    rating: media.rating,
  };
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
    }
  }

  const workers = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workers }, () => run()));
  return results;
}

export async function listFavoriteTitles(userId: string): Promise<SavedTitle[]> {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const media = await mapPool(rows, 5, async (row) => {
    if (row.mediaType === "movie") return getMovieById(row.mediaId);
    if (row.mediaType === "tv") return getSeriesById(row.mediaId);
    return null;
  });

  return media.flatMap((item) => (item ? [toSavedTitle(item)] : []));
}

export async function hasFavoriteTitle(
  userId: string,
  ref: FavoriteRef,
): Promise<boolean> {
  const row = await prisma.favorite.findFirst({
    where: {
      userId,
      mediaId: ref.mediaId,
      mediaType: ref.mediaType,
    },
    select: { id: true },
  });

  return Boolean(row);
}

export async function addFavoriteTitles(userId: string, refs: FavoriteRef[]) {
  const unique: FavoriteRef[] = [];
  const seen = new Set<string>();

  for (const ref of refs) {
    const key = `${ref.mediaType}:${ref.mediaId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(ref);
  }

  const existing = await prisma.favorite.findMany({
    where: { userId },
    select: { mediaId: true, mediaType: true },
  });
  const owned = new Set(
    existing.map((row) => `${row.mediaType}:${row.mediaId}`),
  );
  const fresh = unique.filter(
    (ref) => !owned.has(`${ref.mediaType}:${ref.mediaId}`),
  );

  if (existing.length + fresh.length > FAVORITE_LIMIT) {
    return { ok: false as const, error: "Favorites list is full." };
  }

  if (fresh.length > 0) {
    const now = Date.now();
    await prisma.favorite.createMany({
      data: fresh.map((ref, index) => ({
        userId,
        mediaId: ref.mediaId,
        mediaType: ref.mediaType,
        createdAt: new Date(now - index),
      })),
      skipDuplicates: true,
    });
  }

  return { ok: true as const };
}

export async function removeFavoriteTitle(userId: string, ref: FavoriteRef) {
  await prisma.favorite.deleteMany({
    where: {
      userId,
      mediaId: ref.mediaId,
      mediaType: ref.mediaType,
    },
  });
}
