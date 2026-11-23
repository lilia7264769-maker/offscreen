import Image from "next/image";
import Link from "next/link";

interface GenreCardProps {
  title: string;
  image: string;
  href: string;
}

export default function GenreCard({ title, image, href }: GenreCardProps) {
  return (
    <Link
      href={href}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      className="group flex h-[112px] w-[128px] shrink-0 flex-col items-center gap-0 rounded-[var(--radius-card)] bg-[var(--color-white)] px-2 pt-1 pb-2 shadow-genre-card transition-colors duration-200 hover:bg-[var(--color-genre-hover)] focus-visible:bg-[var(--color-genre-hover)] sm:h-[160px] sm:w-[200px] sm:gap-2 sm:px-4 sm:py-4"
    >
      <div className="relative h-[72px] w-full sm:h-[128px]">
        <Image
          src={image}
          alt=""
          draggable={false}
          fill
          sizes="(min-width: 640px) 188px, 112px"
          className="object-contain transition-[filter] duration-200 group-hover:brightness-0 group-hover:invert group-focus-visible:brightness-0 group-focus-visible:invert"
        />
      </div>

      <span className="text-center text-[16px] leading-6 font-bold text-[var(--color-brand-blue)] transition-colors duration-200 group-hover:text-[var(--color-white)] group-focus-visible:text-[var(--color-white)] sm:text-[20px] sm:leading-7">
        {title}
      </span>
    </Link>
  );
}
