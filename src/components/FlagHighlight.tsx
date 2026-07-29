import { useEffect, useState } from 'react'
import {
  DEFAULT_FLAG_PATTERN,
  findFlagMatchesAsync,
  type FlagMatch,
} from '../core/flag-pattern'

function segmentsFromMatches(text: string, matches: FlagMatch[]) {
  if (matches.length === 0) {
    return [{ key: 'full', text, hl: false as const }]
  }
  const sorted = [...matches].sort((a, b) => a.index - b.index)
  const parts: { key: string; text: string; hl: boolean }[] = []
  let lastIndex = 0
  let mi = 0
  for (const m of sorted) {
    if (m.index > lastIndex) {
      parts.push({ key: `t-${lastIndex}`, text: text.slice(lastIndex, m.index), hl: false })
    }
    parts.push({ key: `m-${mi}`, text: m.text, hl: true })
    mi++
    lastIndex = m.end
  }
  if (lastIndex < text.length) {
    parts.push({ key: `t-${lastIndex}`, text: text.slice(lastIndex), hl: false })
  }
  return parts
}

export function FlagHighlight({
  text,
  pattern = DEFAULT_FLAG_PATTERN,
}: {
  text: string
  pattern?: string
}) {
  const [segments, setSegments] = useState<{ key: string; text: string; hl: boolean }[]>(
    () => [{ key: 'full', text, hl: false }],
  )

  useEffect(() => {
    if (text.length === 0) {
      setSegments([{ key: 'full', text: '', hl: false }])
      return
    }

    let cancelled = false
    void findFlagMatchesAsync(text, pattern).then(({ matches, error }) => {
      if (cancelled) return
      if (error) {
        setSegments([{ key: 'full', text, hl: false }])
        return
      }
      setSegments(segmentsFromMatches(text, matches))
    })

    return () => {
      cancelled = true
    }
  }, [text, pattern])

  return (
    <>
      {segments.map((seg) =>
        seg.hl ? (
          <mark
            key={seg.key}
            className="rounded-md bg-[var(--accent-dim)] px-1 py-0.5 font-semibold text-[var(--accent)] ring-1 ring-[var(--accent-border)]"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={seg.key}>{seg.text}</span>
        ),
      )}
    </>
  )
}
