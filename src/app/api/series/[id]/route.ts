import { NextResponse } from "next/server";
import { getSeriesDetails } from "@/lib/series";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const seriesId = Number(id);

  if (!/^\d+$/.test(id) || !Number.isSafeInteger(seriesId) || seriesId <= 0) {
    return NextResponse.json({ error: "Invalid series ID" }, { status: 400 });
  }

  try {
    const series = await getSeriesDetails(seriesId);

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    return NextResponse.json({ numberOfSeasons: series.numberOfSeasons });
  } catch (error) {
    console.error("Failed to fetch series details from TMDB:", error);
    return NextResponse.json(
      { error: "Failed to fetch series details" },
      { status: 502 },
    );
  }
}
