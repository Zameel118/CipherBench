export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="cb-brand" x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="45%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="cb-fill" x1="16" y1="12" x2="48" y2="52">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#0a0a14" />
      <rect x="2" y="2" width="60" height="60" rx="12" stroke="url(#cb-brand)" strokeWidth="1.5" fill="none" />
      <path
        d="M32 10L50 19V33C50 43.5 41.5 52 32 54.5C22.5 52 14 43.5 14 33V19L32 10Z"
        fill="url(#cb-fill)"
        stroke="url(#cb-brand)"
        strokeWidth="1.5"
      />
      <path
        d="M22 28h20M22 36h14"
        stroke="url(#cb-brand)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <text
        x="32"
        y="34"
        textAnchor="middle"
        fill="url(#cb-brand)"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="11"
        fontWeight="700"
      >
        {'{CB}'}
      </text>
      <circle cx="48" cy="16" r="2" fill="#22d3ee" opacity="0.9" />
      <circle cx="16" cy="48" r="1.5" fill="#e879f9" opacity="0.8" />
    </svg>
  )
}
