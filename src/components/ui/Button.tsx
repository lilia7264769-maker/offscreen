import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "text";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className = "",
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "h-11 px-6 gap-3 bg-[var(--color-brand-blue)] text-[var(--color-white)] uppercase hover:bg-[var(--color-brand-blue-hover)]",
    outline:
      "border border-[var(--color-black-mid)] text-[var(--color-black)] hover:scale-[1.05]",
    text: "text-[var(--color-black-mid)] normal-case",
  };

  const baseStyles =
    "group px-6 inline-flex items-center justify-center gap-2 transition-colors rounded-full";

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
}
