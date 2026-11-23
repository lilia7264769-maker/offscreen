type PlusIconProps = {
  size?: 20 | 16;
  className?: string;
};

export default function PlusIcon({
  size = 20,
  className = "",
}: PlusIconProps) {
  const strokeWidth = size === 16 ? "var(--icon-stroke-small)" : "1.6";

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
        d="M10.0001 4.16675V15.8334M4.16675 10.0001H15.8334"
        style={{ strokeWidth }}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
