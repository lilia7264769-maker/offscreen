import { NextResponse } from "next/server";
import { getSeriesWatchOffer } from "@/lib/watch";

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
    const offer = await getSeriesWatchOffer(seriesId);
    return NextResponse.json(offer);
  } catch (error) {
    console.error("Failed to fetch series watch providers from TMDB:", error);
    return NextResponse.json(
      { error: "Failed to fetch watch providers" },
      { status: 502 },
    );
  }
}
