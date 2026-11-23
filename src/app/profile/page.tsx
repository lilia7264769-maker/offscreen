import Header from "@/components/layout/Header";
import LogoutButton from "@/components/auth/LogoutButton";
import SyncGuestFavorites from "@/components/auth/SyncGuestFavorites";
import PagedPosterGrid from "@/components/collection/PagedPosterGrid";
import { listFavoriteTitles } from "@/lib/favorites";
import { getRequestSession } from "@/lib/session";
import { savedToMedia } from "@/lib/storage";
import type { Media } from "@/types/movie";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await getRequestSession();
  if (!session) redirect("/login");

  let favorites: Media[] = [];
  let loadError: string | null = null;

  try {
    favorites = (await listFavoriteTitles(session.user.id)).map(savedToMedia);
  } catch {
    loadError = "Saved titles could not be loaded.";
  }

  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />
      <main className="container-grid">
        <SyncGuestFavorites />
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3">
              <h1 className="text-[32px] leading-tight font-extrabold">Profile</h1>
              <p className="text-[15px]">{session.user.name}</p>
              <p className="text-[15px] text-[var(--color-black-mid)]">
                {session.user.email}
              </p>
            </div>
            <LogoutButton />
          </div>

          {loadError && (
            <p className="text-[15px] text-[var(--color-black-mid)]">{loadError}</p>
          )}

          <PagedPosterGrid
            items={favorites}
            hasMore={false}
            loading={false}
            resetKey="profile"
            emptyLabel={favorites.length === 0 ? "Nothing saved yet." : undefined}
          />
        </div>
      </main>
    </div>
  );
}
