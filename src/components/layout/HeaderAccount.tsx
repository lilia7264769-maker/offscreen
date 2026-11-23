"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoutIcon from "@/components/icons/LogoutIcon";
import UserIcon from "@/components/icons/UserIcon";
import { authClient } from "@/lib/auth-client";

export default function HeaderAccount() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function logOut() {
    if (signingOut) return;
    setSigningOut(true);
    await authClient.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (isPending) {
    return <span className="inline-flex size-5" aria-hidden />;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="inline-flex size-[var(--icon-size-default)] items-center justify-center transition-transform hover:scale-[1.05]"
      >
        <UserIcon />
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Account"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex size-[var(--icon-size-default)] items-center justify-center transition-transform hover:scale-[1.05]"
      >
        <UserIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-[80] w-56 rounded-[var(--radius-card)] bg-[var(--color-white)] py-2 text-[var(--color-black)] shadow-[0_8px_22px_rgba(30,37,47,0.08)]"
        >
          <div className="px-4 py-2">
            <p className="truncate text-[14px] font-semibold">{session.user.name}</p>
            <p className="truncate text-[13px] text-[var(--color-black-mid)]">
              {session.user.email}
            </p>
          </div>
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-[14px] font-medium hover:bg-[var(--color-bg-grey)]"
          >
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void logOut()}
            disabled={signingOut}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-[14px] font-medium hover:bg-[var(--color-bg-grey)] disabled:opacity-60"
          >
            <LogoutIcon />
            {signingOut ? "Please wait" : "Log Out"}
          </button>
        </div>
      )}
    </div>
  );
}
