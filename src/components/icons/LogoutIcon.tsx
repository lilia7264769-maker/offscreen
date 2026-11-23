interface LogoutIconProps {
  className?: string;
}

export default function LogoutIcon({ className = "" }: LogoutIconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8.33333 2.5L5 2.5C3.61929 2.5 2.5 3.61929 2.5 5L2.5 15C2.5 16.3807 3.61929 17.5 5 17.5H8.33333M13.3333 14.1667L17.5 10L13.3333 5.83333M17.5 10L9.16667 10"
        style={{ strokeWidth: "var(--icon-stroke-default)" }}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
