interface HeartIconProps {
  filled?: boolean;
  className?: string;
}

export default function HeartIcon({
  filled = false,
  className = "",
}: HeartIconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.99982 6.29367L9.99862 6.29118M9.99862 6.29118C9.58118 5.42657 8.55414 3.33337 5.91649 3.33337C3.65879 3.33337 1.58316 5.68018 1.66649 8.23556C1.72278 10.1343 2.99984 11.6878 4.49984 13.155C5.99381 14.6163 7.39605 15.9354 8.41074 16.8765C9.3098 17.7104 10.6895 17.71 11.5883 16.8759C12.6032 15.934 14.0055 14.6143 15.4974 13.155C16.9974 11.6878 18.2745 10.1343 18.3307 8.23556C18.4141 5.68018 16.3384 3.33337 14.0807 3.33337C11.4431 3.33337 10.4161 5.42657 9.99862 6.29118ZM9.99862 6.29118L9.99741 6.29367"
        fill={filled ? "currentColor" : "none"}
        style={{ strokeWidth: "var(--icon-stroke-default)" }}
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
