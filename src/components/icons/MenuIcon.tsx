interface MenuIconProps {
  className?: string;
}

export default function MenuIcon({ className = "" }: MenuIconProps) {
  return (
    <svg
      className={className}
      width="var(--icon-size-default)"
      height="var(--icon-size-default)"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.5 5H2.5M17.5 10H2.5M10.833 15H2.5"
        stroke="currentColor"
        strokeWidth="var(--icon-stroke-default)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
