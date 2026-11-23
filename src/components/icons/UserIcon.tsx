interface UserIconProps {
  className?: string;
}

export default function UserIcon({ className = "" }: UserIconProps) {
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
        d="M4.04778 17.5H15.9525C16.347 17.5 16.6668 17.1802 16.6668 16.7857C16.6668 14.4188 14.748 12.5 12.3811 12.5H7.61921C5.25228 12.5 3.3335 14.4188 3.3335 16.7857C3.3335 17.1802 3.65329 17.5 4.04778 17.5ZM13.5418 6.04167C13.5418 7.99768 11.9562 9.58333 10.0002 9.58333C8.04415 9.58333 6.4585 7.99768 6.4585 6.04167C6.4585 4.08566 8.04415 2.5 10.0002 2.5C11.9562 2.5 13.5418 4.08566 13.5418 6.04167Z"
        style={{ strokeWidth: "var(--icon-stroke-default)" }}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
