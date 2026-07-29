export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#18122B" />
      <rect x="2" y="2" width="60" height="60" rx="12" stroke="url(#lg1)" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M32 12L48 20V34C48 42.837 41.18 50.603 32 53C22.82 50.603 16 42.837 16 34V20L32 12Z" fill="url(#lg1)" opacity="0.15" stroke="url(#lg2)" strokeWidth="1.5" />
      <rect x="26" y="30" width="12" height="10" rx="2" fill="url(#lg2)" />
      <path d="M28 30V26C28 23.791 29.791 22 32 22C34.209 22 36 23.791 36 26V30" stroke="url(#lg2)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="34" r="1.5" fill="#18122B" />
      <rect x="31.25" y="35" width="1.5" height="2.5" rx="0.75" fill="#18122B" />
    </svg>
  )
}
