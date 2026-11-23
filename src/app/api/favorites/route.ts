import { NextResponse } from "next/server";
import {
  addFavoriteTitles,
  hasFavoriteTitle,
  listFavoriteTitles,
  removeFavoriteTitle,
  type FavoriteRef,
} from "@/lib/favorites";
import { getRequestSession } from "@/lib/session";
import { FAVORITE_LIMIT } from "@/lib/storage";
import type { ContentType } from "@/types/movie";

function parseRef(value: unknown): FavoriteRef | null {
  if (!value || typeof value !== "object") return null;

  const record = value as { mediaId?: unknown; mediaType?: unknown };
  const mediaId =
    typeof record.mediaId === "number" ? record.mediaId : Number.NaN;

  if (!Number.isInteger(mediaId) || mediaId <= 0) return null;
  if (record.mediaType !== "movie" && record.mediaType !== "tv") return null;

  return {
    mediaId,
    mediaType: record.mediaType satisfies ContentType,
  };
}

function parseRefs(body: unknown): FavoriteRef[] | null {
  if (!body || typeof body !== "object") return null;

  const record = body as { items?: unknown; mediaId?: unknown; mediaType?: unknown };

  if (Array.isArray(record.items)) {
    if (record.items.length > FAVORITE_LIMIT) return null;

    const refs = record.items.map(parseRef);
    if (refs.some((ref) => ref === null)) return null;
    return refs.filter((ref): ref is FavoriteRef => ref !== null);
  }

  const ref = parseRef(record);
  return ref ? [ref] : null;
}

async function requireUserId() {
  // The account id always comes from the session, never from the request body.
  const session = await getRequestSession();
  return session?.user.id ?? null;
}

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const mediaIdParam = url.searchParams.get("mediaId");
  const mediaTypeParam = url.searchParams.get("mediaType");

  if (mediaIdParam !== null || mediaTypeParam !== null) {
    const ref = parseRef({
      mediaId: mediaIdParam === null ? Number.NaN : Number(mediaIdParam),
      mediaType: mediaTypeParam,
    });

    if (!ref) {
      return NextResponse.json({ error: "Invalid title." }, { status: 400 });
    }

    const saved = await hasFavoriteTitle(userId, ref);
    return NextResponse.json({ saved });
  }

  try {
    const favorites = await listFavoriteTitles(userId);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Failed to load favorites:", error);
    return NextResponse.json(
      { error: "Saved titles could not be loaded." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const refs = parseRefs(body);

  if (!refs) {
    return NextResponse.json({ error: "Invalid title." }, { status: 400 });
  }

  const result = await addFavoriteTitles(userId, refs);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const ref = parseRef(body);

  if (!ref) {
    return NextResponse.json({ error: "Invalid title." }, { status: 400 });
  }

  await removeFavoriteTitle(userId, ref);
  return NextResponse.json({ ok: true });
}
