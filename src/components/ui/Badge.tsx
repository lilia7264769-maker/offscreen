interface BadgeProps {
  children: React.ReactNode;
  // Теперь у нас три варианта внешнего вида
  variant?: "dark" | "gradient" | "light";
}

export default function Badge({ children, variant = "light" }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold rounded-full transition-colors";

  const variants = {
    dark: "bg-black-low border border-white-low24 text-white backdrop-blur-sm [border-width:var(--stroke-width-thin)]",

    gradient:
      "bg-gradient-to-r from-pink-500 to-orange-500 text-white border-none",

    light:
      "bg-bg-grey border border-border-grey text-black [border-width:var(--stroke-width-thin)]",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]}`}>{children}</span>
  );
}
