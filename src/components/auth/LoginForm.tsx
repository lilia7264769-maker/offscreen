"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EyeIcon from "@/components/icons/EyeIcon";
import EyeOffIcon from "@/components/icons/EyeOffIcon";
import Logo from "@/components/layout/Logo";
import { authClient } from "@/lib/auth-client";
import { syncGuestFavorites } from "@/lib/favorites-client";

type Mode = "sign-in" | "sign-up";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(mode: Mode, name: string, email: string, password: string) {
  const errors: FieldErrors = {};

  if (mode === "sign-up" && name.trim().length === 0) {
    errors.name = "Enter your name.";
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Enter a valid email.";
  }

  if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  return errors;
}

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [syncFailed, setSyncFailed] = useState(false);
  const [pending, setPending] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setPassword("");
    setPasswordVisible(false);
    setFieldErrors({});
    setFormError(null);
    setSyncFailed(false);
  }

  async function finishSignIn() {
    const synced = await syncGuestFavorites();
    if (synced === "failed") {
      setSyncFailed(true);
      setFormError(
        "You are signed in, but saved titles could not be moved to your account. They are still on this device.",
      );
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const errors = validate(mode, name, email, password);
    setFieldErrors(errors);
    setFormError(null);
    setSyncFailed(false);

    if (Object.keys(errors).length > 0) return;

    setPending(true);

    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({
            email: email.trim(),
            password,
          })
        : await authClient.signUp.email({
            name: name.trim(),
            email: email.trim(),
            password,
          });

    if (result.error) {
      setFormError(result.error.message || "Something went wrong. Please try again.");
      setPending(false);
      return;
    }

    await finishSignIn();
    setPending(false);
  }

  async function retrySync() {
    if (pending) return;
    setPending(true);
    setFormError(null);
    await finishSignIn();
    setPending(false);
  }

  return (
    <div className="w-full max-w-[420px] rounded-[var(--radius-card)] border border-[var(--color-border-grey)] bg-[var(--color-white)] px-6 py-8 shadow-[var(--shadow-genre-card)]">
      <div className="flex flex-col items-center gap-6">
        <Link href="/" aria-label="Offscreen home" className="text-[var(--color-black)]">
          <Logo />
        </Link>
        <h1 className="sr-only">{mode === "sign-in" ? "Sign in" : "Sign up"}</h1>
        <div className="flex w-full items-center gap-1 rounded-full border border-[var(--color-border-grey)] bg-[color-mix(in_srgb,var(--color-black)_4%,var(--color-bg-main))] p-1">
          {([
            ["sign-in", "Sign In"],
            ["sign-up", "Sign Up"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => switchMode(id)}
              className={`flex-1 rounded-full px-4 py-1.5 text-[13px] font-medium uppercase ${
                mode === id
                  ? "bg-[var(--color-brand-blue)] text-[var(--color-white)]"
                  : "text-[var(--color-black-mid)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
        {mode === "sign-up" && (
          <label className="flex flex-col gap-2 text-[14px] font-medium">
            Name
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              className="rounded-[var(--radius-card)] border border-[var(--color-border-grey)] bg-[var(--color-white)] px-4 py-3 text-[15px] font-medium text-[var(--color-black)] outline-none focus:border-[var(--color-brand-blue)]"
            />
            {fieldErrors.name && (
              <span className="text-[13px] font-medium text-[var(--color-black)]">
                {fieldErrors.name}
              </span>
            )}
          </label>
        )}

        <label className="flex flex-col gap-2 text-[14px] font-medium">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            className="rounded-[var(--radius-card)] border border-[var(--color-border-grey)] bg-[var(--color-white)] px-4 py-3 text-[15px] font-medium text-[var(--color-black)] outline-none focus:border-[var(--color-brand-blue)]"
          />
          {fieldErrors.email && (
            <span className="text-[13px] font-medium text-[var(--color-black)]">
              {fieldErrors.email}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-[14px] font-medium">
          Password
          <span className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              className="w-full rounded-[var(--radius-card)] border border-[var(--color-border-grey)] bg-[var(--color-white)] px-4 py-3 pr-12 text-[15px] font-medium text-[var(--color-black)] outline-none focus:border-[var(--color-brand-blue)]"
            />
            <button
              type="button"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
              onClick={() => setPasswordVisible((current) => !current)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--color-black-mid)]"
            >
              {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </span>
          {fieldErrors.password && (
            <span className="text-[13px] font-medium text-[var(--color-black)]">
              {fieldErrors.password}
            </span>
          )}
        </label>

        {formError && (
          <p role="alert" className="text-[13px] font-medium text-[var(--color-black)]">
            {formError}
          </p>
        )}

        {syncFailed ? (
          <button
            type="button"
            onClick={() => void retrySync()}
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--color-brand-blue)] px-6 text-[var(--color-white)] uppercase disabled:opacity-60"
          >
            {pending ? "Please wait" : "Try again"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--color-brand-blue)] px-6 text-[var(--color-white)] uppercase disabled:opacity-60"
          >
            {pending ? "Please wait" : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        )}
      </form>
    </div>
  );
}
