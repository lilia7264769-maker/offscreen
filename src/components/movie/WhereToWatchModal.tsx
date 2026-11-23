"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import XmarkIcon from "@/components/icons/XmarkIcon";
import type { WatchOffer, WatchProvider } from "@/lib/watch";

interface WhereToWatchModalProps {
  movieId: number;
  movieTitle: string;
  isOpen: boolean;
  onClose: () => void;
  watchPath?: string;
}

// Categories returned by TMDB /watch/providers endpoint
const groups = [
  { key: "stream", label: "Stream" },
  { key: "rent", label: "Rent" },
  { key: "buy", label: "Buy" },
] as const;

export default function WhereToWatchModal({
  movieId,
  movieTitle,
  isOpen,
  onClose,
  watchPath = `/api/movies/${movieId}/watch`,
}: WhereToWatchModalProps) {
  const requestKey = `${movieId}:${isOpen}`;
  const [loadState, setLoadState] = useState<{
    key: string;
    offer: WatchOffer | null;
    hasError: boolean;
  }>({ key: "", offer: null, hasError: false });

  // Lock body scroll and close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Fetch streaming providers when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();

    fetch(watchPath, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to fetch watch providers");
        return (await response.json()) as WatchOffer;
      })
      .then((nextOffer) => {
        if (!controller.signal.aborted) {
          setLoadState({ key: requestKey, offer: nextOffer, hasError: false });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load watch providers:", error);
        setLoadState({ key: requestKey, offer: null, hasError: true });
      });

    return () => controller.abort();
  }, [isOpen, requestKey, watchPath]);

  if (!isOpen) return null;

  const offer =
    loadState.key === requestKey ? loadState.offer : null;
  const hasError =
    loadState.key === requestKey ? loadState.hasError : false;

  // Convert ISO country code (e.g., "US") to readable country name ("United States")
  const regionName = offer?.region
    ? new Intl.DisplayNames(["en"], { type: "region" }).of(offer.region)
    : null;
  const hasProviders = groups.some(
    (group) => (offer?.[group.key].length ?? 0) > 0,
  );

  return (
    /* Backdrop overlay */
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[var(--color-black-low)] sm:items-center sm:p-4"
      onClick={onClose}
    >
      {/* Modal dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="where-to-watch-title"
        aria-busy={!offer && !hasError}
        className="flex max-h-[min(88vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-t-[var(--radius-card)] bg-[var(--color-white)] shadow-[0_16px_48px_var(--color-black-low16)] sm:rounded-[var(--radius-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal header: Title + Region + Close button */}
        <div className="flex items-start justify-between gap-30 px-5 pt-5">
          <div className="flex flex-col gap-0.5">
            <h2
              id="where-to-watch-title"
              className="text-[26px] font-extrabold"
            >
              Where to Watch
            </h2>
            {regionName && (
              <p className="mt-1 text-[13px] text-[var(--color-black-mid)]">
                {regionName}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close where to watch"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-black-mid)] transition-colors hover:text-[var(--color-brand-blue)]"
          >
            <XmarkIcon className="size-5" />
          </button>
        </div>

        {/* Scrollable providers list */}
        <div className="overflow-y-auto px-5 py-4 text-left">
          {(hasError || (offer && !hasProviders)) && (
            <p className="text-sm leading-relaxed text-[var(--color-black)]">
              Streaming information is currently unavailable for this title
            </p>
          )}

          {offer &&
            hasProviders &&
            groups.map((group) => {
              const providers = offer[group.key];
              if (providers.length === 0) return null;

              return (
                <section key={group.key} className="mb-5 last:mb-0">
                  <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-black-mid)]">
                    {group.label}
                  </h3>
                  <ul className="flex flex-col">
                    {providers.map((provider) => (
                      <li key={`${group.key}-${provider.id}`}>
                        <ProviderLink
                          provider={provider}
                          href={providerHref(
                            offer.link,
                            movieTitle,
                            provider.name,
                          )}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
        </div>

        <p className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-[11px] text-[var(--color-black-low)]">
          Streaming data provided by JustWatch
        </p>
      </div>
    </div>
  );
}

// Fallback to Google search if TMDB does not provide a direct JustWatch link
function providerHref(
  link: string | null,
  movieTitle: string,
  providerName: string,
): string {
  if (link) return link;

  return `https://www.google.com/search?q=${encodeURIComponent(
    `where to watch ${movieTitle} ${providerName}`,
  )}`;
}

// Single streaming platform item
function ProviderLink({
  provider,
  href,
}: {
  provider: WatchProvider;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-[var(--radius-badge)] px-1 py-2 transition-colors hover:bg-[var(--color-bg-grey)]"
    >
      {provider.logoPath ? (
        <Image
          src={provider.logoPath}
          alt=""
          width={40}
          height={40}
          className="size-10 rounded-[var(--radius-badge)] object-cover"
        />
      ) : (
        <span className="flex size-10 items-center justify-center rounded-[var(--radius-badge)] bg-[var(--color-bg-grey)] text-sm font-bold text-[var(--color-black-low)]">
          {provider.name.slice(0, 1)}
        </span>
      )}
      <span className="text-sm font-semibold">{provider.name}</span>
    </a>
  );
}
