interface LoadMoreProps {
  onLoad: () => void;
}

export default function LoadMore({ onLoad }: LoadMoreProps) {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onLoad}
        className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-border-grey)] bg-[var(--color-bg-main)] px-8 text-[13px] font-semibold uppercase text-[var(--color-black)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-black)_4%,var(--color-bg-main))]"
      >
        Load more
      </button>
    </div>
  );
}
