import Link from "next/link";
import Button from "@/components/ui/Button";
import Logo from "./Logo";

// ЗАМЕНИТЬ НА ЭТО:
const linkClassName =
  "inline-flex whitespace-nowrap text-base font-semibold uppercase min-[1121px]:text-sm";
const linkTextClassName =
  "inline-block origin-left cursor-pointer transition-transform hover:scale-[1.05]";

export default function Footer() {
  return (
    <footer className="relative flex flex-col overflow-hidden bg-[var(--color-brand-blue)] mt-14 text-[var(--color-white)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-80px] left-1/2 -translate-x-1/2 opacity-[0.05] [&_svg]:h-auto [&_svg]:w-[300px] md:bottom-[-170px] md:opacity-[0.08] md:[&_svg]:w-[800px]"
      >
        <Logo />
      </div>

      {/* ЗАМЕНИТЬ ЭТУ СТРОКУ: */}
      <div className="container-grid relative z-10 flex flex-col items-start gap-7 pt-8 md:flex-row md:justify-between md:pb-7 min-[1121px]:gap-x-16 min-[1121px]:pt-10">
        <div className="hidden shrink-0 flex-col items-start gap-3 min-[1121px]:flex">
          <Link
            href="/"
            aria-label="Offscreen home"
            className="inline-flex transition-transform hover:scale-[1.05]"
          >
            <Logo />
          </Link>
          <p className="text-[13px] font-normal opacity-70">
            Discover cinema beyond the screen.
          </p>
        </div>

        {/* ЗАМЕНИТЬ ТОЛЬКО ОТКРЫВАЮЩИЙ ТЕГ NAV НА ЭТОТ: */}
        <nav
          aria-label="Footer"
          className="grid w-full grid-cols-1 justify-items-start gap-y-5 border-b border-[var(--color-white-low20)] pb-7 md:grid-cols-2 md:justify-between md:justify-items-start md:w-[360px] md:max-w-[360px] md:gap-x-0 md:border-0 md:pb-0 min-[1121px]:ml-auto min-[1121px]:flex min-[1121px]:w-auto min-[1121px]:max-w-none min-[1121px]:flex-nowrap min-[1121px]:items-center min-[1121px]:gap-x-8 min-[1280px]:gap-x-12"
        >
          <Link href="/genres" className={linkClassName}>
            <span className={linkTextClassName}>Explore</span>
          </Link>
          <Link href="/favorites" className={linkClassName}>
            <span className={linkTextClassName}>Favorites</span>
          </Link>
          <Link href="/catalog" className={linkClassName}>
            <span className={linkTextClassName}>Catalog</span>
          </Link>
          <a
            href="https://github.com/lilia7264769-maker/offscreen"
            target="_blank"
            rel="noreferrer"
            className={linkClassName}
          >
            <span className={linkTextClassName}>GitHub</span>
          </a>
        </nav>

        {/* ЗАМЕНИТЬ ОТКРЫВАЮЩИЙ ТЕГ SECTION НА ЭТОТ: */}
        <section
          aria-labelledby="footer-newsletter-title"
          className="flex w-full flex-col items-start gap-4 border-b border-[var(--color-white-low20)] pb-7 md:ml-auto md:w-[320px] md:max-w-[320px] md:border-0 md:pb-0 min-[1121px]:ml-0 min-[1121px]:w-[350px] min-[1121px]:max-w-[350px]"
        >
          <h2
            id="footer-newsletter-title"
            className="text-base font-semibold uppercase min-[1121px]:text-sm"
          >
            get the latest cinema news
          </h2>
          <label htmlFor="footer-email" className="sr-only">
            Email address
          </label>
          <input
            id="footer-email"
            type="email"
            placeholder="EMAIL ADDRESS"
            className="h-11 w-full rounded-[var(--radius-card)] border border-[var(--color-white-low16)] bg-[var(--color-white-low16)] px-4 text-xs font-normal text-[var(--color-white)] outline-none placeholder:text-[var(--color-white)]/50 focus:border-[var(--color-white)]"
          />
          <Button
            variant="outline"
            className="ml-auto h-9 border-[var(--color-white)] bg-transparent px-5 text-[14px] font-semibold normal-case text-[var(--color-white)] hover:bg-[var(--color-white)] hover:text-[var(--color-brand-blue)]"
          >
            Subscribe
          </Button>
        </section>
      </div>

      <div className="container-grid relative z-10">
        <p className="pt-7 pb-11 text-left text-[13px] font-normal opacity-70 md:border-t md:border-[var(--color-white-low20)] md:pt-7 md:pb-6 min-[1121px]:text-center">
          © 2026 Offscreen. All rights reserved. This product uses the TMDb API
          but is not endorsed or certified by TMDb.
        </p>
      </div>
    </footer>
  );
}
