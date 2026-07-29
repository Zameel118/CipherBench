import { useEffect, type ReactNode } from 'react'
import sopMarkdown from '../content/sop-usage.md?raw'

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#e879f9]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="font-code rounded bg-[rgba(0,0,0,0.35)] px-1 py-0.5 text-[12px] text-[#22d3ee]">
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function SopBody({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n')
  const nodes: ReactNode[] = []
  let listItems: string[] = []
  let listOrdered = false

  const flushList = () => {
    if (listItems.length === 0) return
    const Tag = listOrdered ? 'ol' : 'ul'
    nodes.push(
      <Tag
        key={`list-${nodes.length}`}
        className={`mb-4 space-y-1.5 pl-5 text-sm text-[#c7d2fe] ${listOrdered ? 'list-decimal' : 'list-disc'}`}
      >
        {listItems.map((item, idx) => (
          <li key={idx}>{renderInline(item)}</li>
        ))}
      </Tag>,
    )
    listItems = []
    listOrdered = false
  }

  for (const line of lines) {
    const trimmed = line.trimEnd()
    if (trimmed === '') {
      flushList()
      continue
    }
    if (trimmed.startsWith('# ')) {
      flushList()
      nodes.push(
        <h1 key={nodes.length} className="mb-4 text-xl font-extrabold text-white">
          {renderInline(trimmed.slice(2))}
        </h1>,
      )
      continue
    }
    if (trimmed.startsWith('## ')) {
      flushList()
      nodes.push(
        <h2
          key={nodes.length}
          className="mb-3 mt-6 border-b border-[rgba(168,85,247,0.25)] pb-2 text-sm font-bold uppercase tracking-[0.12em] text-[#e879f9]"
        >
          {renderInline(trimmed.slice(3))}
        </h2>,
      )
      continue
    }
    if (trimmed.startsWith('### ')) {
      flushList()
      nodes.push(
        <h3 key={nodes.length} className="mb-2 mt-4 text-base font-bold text-[#22d3ee]">
          {renderInline(trimmed.slice(4))}
        </h3>,
      )
      continue
    }
    const bullet = trimmed.match(/^- (.+)$/)
    if (bullet) {
      if (listOrdered && listItems.length > 0) flushList()
      listOrdered = false
      listItems.push(bullet[1]!)
      continue
    }
    const numbered = trimmed.match(/^\d+\.\s+(.+)$/)
    if (numbered) {
      if (!listOrdered && listItems.length > 0) flushList()
      listOrdered = true
      listItems.push(numbered[1]!)
      continue
    }
    flushList()
    nodes.push(
      <p key={nodes.length} className="mb-3 text-sm leading-relaxed text-[#9499b8]">
        {renderInline(trimmed)}
      </p>,
    )
  }
  flushList()
  return <>{nodes}</>
}

export function SopGuidePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="cb-sop-root" role="dialog" aria-modal="true" aria-label="SOP guide">
      <button type="button" className="cb-sop-backdrop" onClick={onClose} aria-label="Close SOP" />
      <div className="cb-sop-panel cb-panel cb-terminal-chrome">
        <header className="cb-panel-header flex-shrink-0">
          <div>
            <p className="font-code text-[10px] font-bold uppercase tracking-[0.2em] text-[#22d3ee]">
              Mission documentation
            </p>
            <h2 className="text-base font-bold text-white">SOP guide (SOC + CTF)</h2>
          </div>
          <button type="button" onClick={onClose} className="cb-btn cb-btn-ghost !px-3 !py-1.5 !text-[11px]">
            Close
          </button>
        </header>
        <div className="cb-sop-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <SopBody markdown={sopMarkdown} />
        </div>
      </div>
    </div>
  )
}
