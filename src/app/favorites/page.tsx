import Header from "@/components/layout/Header";
import FavoritesBrowse from "@/components/collection/FavoritesBrowse";

export const metadata = {
  title: "Favorites",
};

export default function FavoritesPage() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />
      <main className="container-grid">
        <FavoritesBrowse />
      </main>
    </div>
  );
}
