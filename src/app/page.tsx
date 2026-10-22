import { getPopularMovies } from "@/lib/tmdb";
import Header from "@/components/layout/Header";
// import HeroBanner from "@/components/movie/HeroBanner";
// import MovieCard from "@/components/movie/MovieCard";
// import Footer from "@/components/layout/Footer";
import type { Movie } from "@/types/movie";

export default async function Home() {
  // Получаем живые данные из TMDB API.
  // Это важно: Home здесь — серверный компонент, п
  // оэтому для получения фильмов не нужно превращать всю страницу в клиентский компонент с useEffect.
  /* const data = await getPopularMovies();
  // Заменяем строчку с маппингом на эту чистую версию:
  const rawMovies: any[] = data?.results || [];

  const movies: Movie[] = rawMovies.map((item) => ({
    id: item.id,
    title: item.title,
    posterPath: item.poster_path
      ? `https://tmdb.org{item.poster_path}`
      : "https://unsplash.com",
    backdropPath: item.backdrop_path || "",
    releaseYear: item.release_date
      ? new Date(item.release_date).getFullYear()
      : 2026,
    genres: ["Cinema"],
    rating: item.vote_average || 0.0,
    overview: item.overview || "",
  })); */

  return (
    <div className="min-h-screen flex flex-col bg-bg-main text-black selection:bg-brand-blue selection:text-white">
      <Header />
    </div>
  );
}
