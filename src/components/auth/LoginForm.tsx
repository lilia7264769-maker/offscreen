"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EyeIcon from "@/components/icons/EyeIcon";
import EyeOffIcon from "@/components/icons/EyeOffIcon";
import GoogleIcon from "@/components/icons/GoogleIcon";
import Logo from "@/components/layout/Logo";
import { authClient } from "@/lib/auth-client";
import { syncGuestFavorites } from "@/lib/favorites-client";

type Mode = "sign-in" | "sign-up";
type Field = "name" | "email" | "password";

type FieldErrors = Partial<Record<Field, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROR_COLOR = "text-[#dc2626]";

function validate(mode: Mode, name: string, email: string, password: string) {
  const errors: FieldErrors = {};

  if (mode === "sign-up" && name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

function inputClassName(invalid: boolean, extra = "") {
  return [
    "rounded-[var(--radius-card)] border bg-[var(--color-white)] px-4 py-3 text-[15px] font-medium text-[var(--color-black)] outline-none",
    invalid
      ? "border-[#dc2626] focus:border-[#dc2626]"
      : "border-[var(--color-border-grey)] focus:border-[var(--color-brand-blue)]",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [syncFailed, setSyncFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const busy = pending || googlePending;
  const errors = validate(mode, name, email, password);
  const canSubmit = !busy && Object.keys(errors).length === 0;

  function visibleError(field: Field) {
    if (!showAllErrors && !touched[field]) return undefined;
    return errors[field];
  }

  function markTouched(field: Field) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  }

  function switchMode(next: Mode) {
    setMode(next);
    setPassword("");
    setPasswordVisible(false);
    setTouched({});
    setShowAllErrors(false);
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
    if (busy) return;

    setShowAllErrors(true);
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

  async function continueWithGoogle() {
    if (busy) return;

    setFormError(null);
    setSyncFailed(false);
    setGooglePending(true);

    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/profile",
    });

    if (result.error) {
      setFormError(result.error.message || "Google sign-in could not be started.");
      setGooglePending(false);
    }
  }

  async function retrySync() {
    if (busy) return;
    setPending(true);
    setFormError(null);
    await finishSignIn();
    setPending(false);
  }

  const nameError = visibleError("name");
  const emailError = visibleError("email");
  const passwordError = visibleError("password");
  const submitClassName = `inline-flex h-11 w-full items-center justify-center rounded-full px-6 uppercase ${
    canSubmit
      ? "bg-[var(--color-brand-blue)] text-[var(--color-white)]"
      : "cursor-not-allowed bg-[var(--color-bg-grey)] text-[var(--color-black-mid)]"
  }`;

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

      <form onSubmit={onSubmit} noValidate className="mt-8">
        <div className="flex flex-col gap-5">
          {mode === "sign-up" && (
            <label className="flex flex-col gap-2 text-[14px] font-medium">
              Name
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => markTouched("name")}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "name-error" : undefined}
                className={inputClassName(Boolean(nameError))}
              />
              {nameError && (
                <span id="name-error" className={`text-xs font-medium ${ERROR_COLOR}`}>
                  {nameError}
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
              onBlur={() => markTouched("email")}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "email-error" : undefined}
              className={inputClassName(Boolean(emailError))}
            />
            {emailError && (
              <span id="email-error" className={`text-xs font-medium ${ERROR_COLOR}`}>
                {emailError}
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
                onBlur={() => markTouched("password")}
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? "password-error" : undefined}
                className={inputClassName(Boolean(passwordError), "w-full pr-12")}
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
            {passwordError && (
              <span id="password-error" className={`text-xs font-medium ${ERROR_COLOR}`}>
                {passwordError}
              </span>
            )}
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {formError && (
            <p role="alert" className={`text-xs font-medium ${ERROR_COLOR}`}>
              {formError}
            </p>
          )}

          {syncFailed ? (
            <button
              type="button"
              onClick={() => void retrySync()}
              disabled={busy}
              className={`inline-flex h-11 w-full items-center justify-center rounded-full px-6 uppercase ${
                busy
                  ? "cursor-not-allowed bg-[var(--color-bg-grey)] text-[var(--color-black-mid)]"
                  : "bg-[var(--color-brand-blue)] text-[var(--color-white)]"
              }`}
            >
              {pending ? "Please wait" : "Try again"}
            </button>
          ) : (
            <button type="submit" disabled={!canSubmit} className={submitClassName}>
              {pending ? "Please wait" : mode === "sign-in" ? "Sign in" : "Sign up"}
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-[var(--color-border-grey)]" />
        <span className="text-xs font-medium tracking-[0.08em] text-[var(--color-black-mid)]">
          OR
        </span>
        <span className="h-px flex-1 bg-[var(--color-border-grey)]" />
      </div>

      <button
        type="button"
        onClick={() => void continueWithGoogle()}
        disabled={busy}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--color-border-grey)] bg-[var(--color-white)] px-6 text-[14px] font-medium text-[var(--color-black)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        {googlePending ? "Please wait" : "Continue with Google"}
      </button>
    </div>
  );
}
