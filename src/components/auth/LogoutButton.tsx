"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoutIcon from "@/components/icons/LogoutIcon";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logOut() {
    if (pending) return;
    setPending(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logOut()}
      disabled={pending}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--color-border-grey)] px-5 text-[14px] font-medium disabled:opacity-60"
    >
      <LogoutIcon />
      {pending ? "Please wait" : "Log Out"}
    </button>
  );
}
