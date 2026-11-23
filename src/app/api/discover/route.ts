import { NextResponse } from "next/server";
import {
  discoverMedia,
  type DiscoverKind,
  type SortKey,
} from "@/lib/discover";

const KINDS = ["movie", "tv", "all"] as const;
const SORTS = ["rating", "newest", "popularity"] as const;

function readEnum<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | null {
  if (!value) return null;
  return allowed.includes(value as T) ? (value as T) : null;
}

function readPositiveInt(value: string | null, max: number): number | undefined {
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return undefined;

  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0 || number > max) {
    return undefined;
  }

  return number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = readEnum<DiscoverKind>(searchParams.get("kind"), KINDS);
  const sort = readEnum<SortKey>(searchParams.get("sort"), SORTS);
  const page = readPositiveInt(searchParams.get("page"), 500) ?? 1;
  const genreId = readPositiveInt(searchParams.get("genre"), 100000);
  const year = readPositiveInt(searchParams.get("year"), 2100);
  const companyId = readPositiveInt(searchParams.get("company"), 1000000);
  const countryParam = searchParams.get("country");
  const country = countryParam && /^[a-z]{2}$/i.test(countryParam)
    ? countryParam.toUpperCase()
    : undefined;

  if (!kind || !sort) {
    return NextResponse.json({ error: "Invalid discover query" }, { status: 400 });
  }

  if (searchParams.get("genre") && !genreId) {
    return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
  }

  if (searchParams.get("year") && (!year || year < 1900)) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  if (searchParams.get("country") && !country) {
    return NextResponse.json({ error: "Invalid country" }, { status: 400 });
  }

  if (searchParams.get("company") && !companyId) {
    return NextResponse.json({ error: "Invalid company" }, { status: 400 });
  }

  if (searchParams.get("page") && !readPositiveInt(searchParams.get("page"), 500)) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  try {
    const result = await discoverMedia({
      kind,
      sort,
      page,
      genreId,
      year,
      country,
      companyId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to discover titles from TMDB:", error);
    return NextResponse.json(
      { error: "Failed to discover titles" },
      { status: 502 },
    );
  }
}
