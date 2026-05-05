export function LeafIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22C6.5 22 3 17.5 3 12c0-4.5 3-8.5 7.5-9.5C14 2 19 4 20.5 7.5c1 2.5.5 6-1.5 8.5-1.5 1.8-4 3-7 3z"
        fill="oklch(52% 0.19 32 / 0.15)"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 22c0-5.5 3-10 8.5-14.5"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
