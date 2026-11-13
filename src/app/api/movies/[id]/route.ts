import { NextResponse } from "next/server";
import { getMovieDetails } from "@/lib/movies";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const movieId = Number(id);

  // Проверяем входные данные: число, целое, неотриц
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(movieId) || movieId <= 0) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  try {
    const movie = await getMovieDetails(movieId);

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ runtime: movie.runtime });
  } catch (error) {
    console.error("Failed to fetch movie details from TMDB:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie details" },
      { status: 502 },
    );
  }
}
