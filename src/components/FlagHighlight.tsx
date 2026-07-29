import { useMemo } from 'react'
import { compileFlagRegex, DEFAULT_FLAG_PATTERN } from '../core/flag-pattern'

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
      return [{ key: 'full', text, hl: false as const }]
    }

    const parts: { key: string; text: string; hl: boolean }[] = []
    let lastIndex = 0
    let mi = 0

    for (const match of text.matchAll(regex)) {
      const m = match[0]
      const start = match.index
      if (!m || start === undefined) continue
      if (start > lastIndex) {
        parts.push({ key: `t-${lastIndex}`, text: text.slice(lastIndex, start), hl: false })
      }
      parts.push({ key: `m-${mi}`, text: m, hl: true })
      mi++
      lastIndex = start + m.length
    }
    if (lastIndex < text.length) {
      parts.push({ key: `t-${lastIndex}`, text: text.slice(lastIndex), hl: false })
    }
    return parts.length === 0 ? [{ key: 'full', text, hl: false as const }] : parts
  }, [text, pattern])

  return (
    <>
      {segments.map((seg) =>
        seg.hl ? (
          <mark
            key={seg.key}
            className="rounded-md bg-[rgba(232,121,249,0.2)] px-1 py-0.5 font-semibold text-[#e879f9] ring-1 ring-[rgba(168,85,247,0.45)]"
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
