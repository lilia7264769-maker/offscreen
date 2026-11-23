import { NextResponse } from "next/server";
import { getMovieWatchOffer } from "@/lib/watch";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const movieId = Number(id);

  if (!/^\d+$/.test(id) || !Number.isSafeInteger(movieId) || movieId <= 0) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  try {
    const offer = await getMovieWatchOffer(movieId);
    return NextResponse.json(offer);
  } catch (error) {
    console.error("Failed to fetch watch providers from TMDB:", error);
    return NextResponse.json(
      { error: "Failed to fetch watch providers" },
      { status: 502 },
    );
  }
}
