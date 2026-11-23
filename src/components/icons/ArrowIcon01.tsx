type ArrowIcon01Props = {
  size?: 20 | 16;
  className?: string;
};

export default function ArrowIcon01({
  size = 20,
  className = "",
}: ArrowIcon01Props) {
  const strokeWidth =
    size === 16 ? "var(--icon-stroke-small)" : "var(--icon-stroke-default)";

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.5 15L12.5 10L7.5 5"
        style={{ strokeWidth }}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
