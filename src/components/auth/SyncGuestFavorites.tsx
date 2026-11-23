"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { syncGuestFavorites } from "@/lib/favorites-client";

export default function SyncGuestFavorites() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void syncGuestFavorites().then((result) => {
      if (result === "synced") router.refresh();
    });
  }, [router]);

  return null;
}
