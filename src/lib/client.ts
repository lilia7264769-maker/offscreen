const TMDB_API = "https://api.themoviedb.org/3";

export class TMDBError extends Error {
  constructor(readonly status: number) {
    // что нужно передать при создании ошибки
    super(`TMDB error: ${status}`);
    this.name = "TMDBError";
  }
}

// универсальная функция для обращения к апи по конкр пути
// подключение к тмдб авторизация, обработка ошибок
export async function tmdbFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${TMDB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    },
    next: { revalidate: 3600 }, // Кэширование. Next.js может повторно использовать результат запроса в течение 3600сек — 1 часа.
  });

  if (!response.ok) {
    throw new TMDBError(response.status); // TMDB error: 404
  }

  return response.json();
}
