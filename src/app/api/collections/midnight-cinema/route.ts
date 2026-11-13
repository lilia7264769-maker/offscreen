// delete after
import { NextResponse } from "next/server";
import { midnightCinemaTitles } from "@/data/collections";
import { searchMovies } from "@/lib/movies";
import { searchSeries } from "@/lib/series";

export async function GET() {
  const results = await Promise.all(
    midnightCinemaTitles.map(async (item) => {
      const matches =
        item.type === "movie"
          ? await searchMovies(item.title)
          : await searchSeries(item.title);

      return {
        search: item.title,
        expectedYear: item.year,
        type: item.type,
        matches: matches.map((media) => ({
          id: media.id,
          title: media.title,
          year: media.releaseYear,
        })),
      };
    }),
  );

  return NextResponse.json(results);
}
