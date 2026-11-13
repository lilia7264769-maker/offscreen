import { NextResponse } from "next/server";
import { getPopularMovies, searchMovies } from "@/lib/movies";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length > 100) {
    return NextResponse.json(
      { error: "Search query must be 100 characters or fewer" },
      { status: 400 },
    );
  }

  try {
    const movies = query ? await searchMovies(query) : await getPopularMovies();
    return NextResponse.json({ movies: movies.slice(0, 8) });
  } catch (error) {
    console.error("Failed to search movies:", error);
    return NextResponse.json(
      { error: "Failed to load movies" },
      { status: 502 },
    );
  }
}
