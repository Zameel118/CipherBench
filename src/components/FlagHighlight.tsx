import { useMemo } from 'react'
import {
  compileFlagRegex,
  DEFAULT_FLAG_PATTERN,
} from '../core/flag-pattern'

export function FlagHighlight({
  text,
  pattern = DEFAULT_FLAG_PATTERN,
}: {
  text: string
  pattern?: string
}) {
  const segments = useMemo(() => {
    const { regex, error } = compileFlagRegex(pattern)
    if (!regex || error || text.length === 0) {
      return [{ key: 'full', text, highlight: false as const }]
    }

    const parts: { key: string; text: string; highlight: boolean }[] = []
    let lastIndex = 0
    let matchIndex = 0

    for (const match of text.matchAll(regex)) {
      const matched = match[0]
      const start = match.index
      if (!matched || start === undefined) continue
      if (start > lastIndex) {
        parts.push({
          key: `t-${lastIndex}`,
          text: text.slice(lastIndex, start),
          highlight: false,
        })
      }
      parts.push({
        key: `m-${matchIndex}`,
        text: matched,
        highlight: true,
      })
      matchIndex++
      lastIndex = start + matched.length
    }

    if (lastIndex < text.length) {
      parts.push({
        key: `t-${lastIndex}`,
        text: text.slice(lastIndex),
        highlight: false,
      })
    }

    if (parts.length === 0) {
      return [{ key: 'full', text, highlight: false as const }]
    }

    return parts
  }, [text, pattern])

  return (
    <>
      {segments.map((seg) =>
        seg.highlight ? (
          <mark
            key={seg.key}
            className="rounded bg-amber-500/20 px-0.5 text-amber-300 ring-1 ring-amber-500/40"
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
