type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="CrewCircle"
    >
      <circle cx="100" cy="100" r="90" fill="none" stroke="#ff6b35" strokeWidth="8" />
      <circle cx="100" cy="60" r="18" fill="#ff6b35" />
      <rect x="88" y="78" width="24" height="20" rx="4" fill="#ff6b35" />
      <circle cx="65" cy="120" r="18" fill="#ff6b35" opacity="0.8" />
      <rect x="53" y="138" width="24" height="20" rx="4" fill="#ff6b35" opacity="0.8" />
      <circle cx="135" cy="120" r="18" fill="#ff6b35" opacity="0.6" />
      <rect x="123" y="138" width="24" height="20" rx="4" fill="#ff6b35" opacity="0.6" />
      <path
        d="M 90 100 L 95 105 L 115 85"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
