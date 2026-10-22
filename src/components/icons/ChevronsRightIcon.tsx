type ChevronsRightIconProps = {
  size?: 20 | 16;
};

export default function ChevronsRightIcon({
  size = 20,
}: ChevronsRightIconProps) {
  const strokeWidth =
    size === 16 ? "var(--icon-stroke-small)" : "var(--icon-stroke-default)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.1665 15L9.1665 10L4.1665 5M10.8332 15L15.8332 10L10.8332 5"
        style={{ strokeWidth }}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
