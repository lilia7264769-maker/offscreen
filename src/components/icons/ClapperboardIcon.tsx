interface ClapperboardIconProps {
  size?: number;
  className?: string;
}

export default function ClapperboardIcon({
  size = 20,
  className = "",
}: ClapperboardIconProps) {
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
        d="M2.5 5.83333H6.66669M2.5 5.83333V15C2.5 16.3807 3.61929 17.5 5 17.5H15C16.3807 17.5 17.5 16.3807 17.5 15V5.83333M2.5 5.83333V5C2.5 3.61929 3.6193 2.5 5.00001 2.5M6.66669 5.83333H10.8333M6.66669 5.83333L5.00001 2.5M10.8333 5.83333H15M10.8333 5.83333L9.16666 2.5M15 5.83333H17.5M15 5.83333L13.3333 2.5M17.5 5.83333V5C17.5 3.61929 16.3807 2.5 15 2.5H5.00001"
        stroke="currentColor"
        strokeWidth="var(--icon-stroke-small)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
