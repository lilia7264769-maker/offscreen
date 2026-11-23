import { tmdbFetch } from "./client";

const TMDB_IMAGE = "https://image.tmdb.org/t/p";
const REGIONS = ["AZ", "RU", "US"] as const;

export interface WatchProvider {
  id: number;
  name: string;
  logoPath: string | null;
}

export interface WatchOffer {
  region: string | null;
  link: string | null;
  stream: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
}

interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

interface TMDBWatchRegion {
  link?: string;
  flatrate?: TMDBWatchProvider[];
  rent?: TMDBWatchProvider[];
  buy?: TMDBWatchProvider[];
}

interface TMDBWatchProvidersResponse {
  results: Record<string, TMDBWatchRegion>;
}

const emptyOffer: WatchOffer = {
  region: null,
  link: null,
  stream: [],
  rent: [],
  buy: [],
};

function mapProviders(providers: TMDBWatchProvider[] | undefined): WatchProvider[] {
  const seen = new Set<number>();

  return [...(providers ?? [])]
    .sort((first, second) => first.display_priority - second.display_priority)
    .filter((provider) => {
      if (seen.has(provider.provider_id)) return false;
      seen.add(provider.provider_id);
      return true;
    })
    .map((provider) => ({
      id: provider.provider_id,
      name: provider.provider_name,
      logoPath: provider.logo_path
        ? `${TMDB_IMAGE}/w92${provider.logo_path}`
        : null,
    }));
}

async function getWatchOffer(path: string): Promise<WatchOffer> {
  const data = await tmdbFetch<TMDBWatchProvidersResponse>(path);

  for (const code of REGIONS) {
    const region = data.results[code];
    if (!region) continue;

    const stream = mapProviders(region.flatrate);
    const rent = mapProviders(region.rent);
    const buy = mapProviders(region.buy);

    if (stream.length === 0 && rent.length === 0 && buy.length === 0) {
      continue;
    }

    return {
      region: code,
      link: region.link ?? null,
      stream,
      rent,
      buy,
    };
  }

  return emptyOffer;
}

export function getMovieWatchOffer(movieId: number): Promise<WatchOffer> {
  return getWatchOffer(`/movie/${movieId}/watch/providers`);
}

export function getSeriesWatchOffer(seriesId: number): Promise<WatchOffer> {
  return getWatchOffer(`/tv/${seriesId}/watch/providers`);
}
