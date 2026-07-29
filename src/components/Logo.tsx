import { useId } from 'react'

/** Shield + lock mark — same geometry as the original favicon, mint palette. */
export function Logo({ size = 30 }: { size?: number }) {
  const uid = useId().replace(/:/g, '')
  const brand = `cb-brand-${uid}`
  const inner = `cb-inner-${uid}`
  const glow = `cb-glow-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="cb-logo"
    >
      <defs>
        <linearGradient id={brand} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="55%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
        <linearGradient id={inner} x1="20" y1="18" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0.08" />
        </linearGradient>
        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="64" height="64" rx="14" fill="#0b0f15" />
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="11.5"
        stroke={`url(#${brand})`}
        strokeWidth="2"
        fill="none"
        filter={`url(#${glow})`}
      />

      <path
        d="M32 11L49 19.5V33.2C49 42.8 41.2 51.2 32 53.8C22.8 51.2 15 42.8 15 33.2V19.5L32 11Z"
        fill={`url(#${inner})`}
        stroke={`url(#${brand})`}
        strokeWidth="1.75"
        filter={`url(#${glow})`}
      />

      <rect
        x="27"
        y="30"
        width="10"
        height="9"
        rx="2"
        fill="#0b0f15"
        stroke={`url(#${brand})`}
        strokeWidth="1.5"
      />
      <path
        d="M29 30V26.5C29 24.567 30.567 23 32.5 23C34.433 23 36 24.567 36 26.5V30"
        stroke={`url(#${brand})`}
        strokeWidth="1.75"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="33.5" r="1.25" fill={`url(#${brand})`} />
      <rect x="31.4" y="34.5" width="1.2" height="2.2" rx="0.6" fill={`url(#${brand})`} />

      <path
        d="M21 22h4M39 22h4M21 42h4M39 42h4"
        stroke={`url(#${brand})`}
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M32 18v-3M32 49v3M18 32h-3M49 32h3"
        stroke="#5eead4"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}
