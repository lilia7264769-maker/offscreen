interface BadgeProps {
  children: React.ReactNode;
  // Теперь у нас три варианта внешнего вида
  variant?: "dark" | "gradient" | "light";
  compactMobile?: boolean;
}

export default function Badge({
  children,
  variant = "light",
  compactMobile = false,
}: BadgeProps) {
  const baseStyles = compactMobile
    ? "inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-[14px] md:gap-1.5 md:px-4 md:py-1.5 md:text-[15px] "
    : "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-[15px] ";

  const variants = {
    //это обьект и мы там выбираем какой вариант
    gradient:
      "border-none text-[var(--color-white)] font-bold lowercase transition-transform hover:scale-105",

    dark: "border-none bg-[var(--color-white-low16)] font-normal lowercase text-[var(--color-white)] transition-transform hover:scale-105",

    light:
      "border border-[var(--color-brand-blue)] border-width-[var(--stroke-width-thin)] text-[15px] text-[var([var(--color-brand-blue)]]",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]}`}
      style={
        variant === "gradient"
          ? {
              backgroundImage:
                "linear-gradient(to right, var(--color-badge-gradient-start), var(--color-badge-gradient-end))",
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
