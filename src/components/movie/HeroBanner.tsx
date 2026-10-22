import Image from "next/image";
import Badge from "../ui/Badge";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[460px] bg-gray-50 text-gray-900 flex items-end pb-12 overflow-hidden border-b border-gray-100">
      {/* Изображение на задний фон */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://unsplash.com"
          alt="Spider-Man Backdrop"
          fill
          priority
          className="object-cover object-top opacity-15"
        />
        {/* Мягкий градиент, растворяющийся в светлом фоне сайта книзу */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/40 to-transparent" />
      </div>

      {/* Контент баннера */}
      <div className="relative z-10 container mx-auto px-6 max-w-[1200px] w-full">
        <div className="flex flex-col gap-4 max-w-[620px]">
          {/* Ряд тегов (используем дефолтный светлый вариант Badge) */}
          <div className="flex flex-wrap gap-2">
            <Badge>2023</Badge>
            <Badge>Animation</Badge>
            <Badge>Action</Badge>
            <Badge>★ 8.4</Badge>
          </div>

          {/* Заголовок */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-gray-900">
            Spider-Man: <br />
            <span className="text-blue-600">Across the</span> Spider-Verse
          </h1>

          {/* Краткое описание */}
          <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed">
            Miles Morales catapults across the Multiverse, where he encounters a
            team of Spider-People charged with protecting its very existence.
          </p>

          {/* Полностью округленная кнопка под твою дневную тему */}
          <div className="mt-2">
            <button className="bg-gray-900 text-white hover:bg-gray-800 transition-colors px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider shadow-sm">
              Watch Trailer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
