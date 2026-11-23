import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";

const rippleClasses = [
  "w-[34%] [animation-delay:0s]",
  "w-[46%] [animation-delay:-1.75s]",
  "w-[58%] [animation-delay:-3.5s]",
  "w-[70%] [animation-delay:-5.25s]",
] as const;

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--color-bg-main)] text-[var(--color-black)]">
      <Header />

      <main className="relative isolate flex flex-1 flex-col items-center justify-center gap-0 overflow-hidden px-4 pb-16 pt-24 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 grid place-items-center"
        >
          <div className="relative aspect-square w-[min(85vw,44rem)]">
            {rippleClasses.map((rippleClass) => (
              <span
                key={rippleClass}
                className={`absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-[var(--color-black-low)] opacity-30 [animation-duration:7s] [animation-timing-function:ease-out] motion-reduce:animate-none motion-reduce:opacity-30 ${rippleClass}`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-8xl sm:text-9xl font-bold tracking-tight">404</h1>
          <p className="mt-4 text-lg sm:text-xl font-medium opacity-80">
            Page not found
          </p>
          <Button
            href="/"
            variant="outline"
            className="mt-7 h-9 border-[var(--color-black)] bg-transparent px-5 text-[14px] font-semibold normal-case text-[var(--color-black)] hover:bg-[var(--color-black)] hover:text-[var(--color-white)]"
          >
            Back home
          </Button>
        </div>
      </main>
    </div>
  );
}
