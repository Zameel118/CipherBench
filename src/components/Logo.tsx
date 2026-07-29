export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="32" height="32" rx="7" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
      <path
        d="M10 11.5h7.2c2.2 0 3.8 1.5 3.8 3.6 0 2.1-1.6 3.6-3.8 3.6H13.2V21H10V11.5Zm3.2 2.2v2.8h3.7c.95 0 1.55-.55 1.55-1.4 0-.85-.6-1.4-1.55-1.4H13.2Z"
        fill="var(--accent)"
      />
      <path d="M8 8.5h2.2v15H8V8.5Z" fill="var(--text-muted)" opacity="0.55" />
    </svg>
  )
}
