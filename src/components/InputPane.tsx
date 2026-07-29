import { useEffect, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { MagicSuggestions } from './MagicSuggestions'

const INPUT_DEBOUNCE_MS = 200

export function InputPane() {
  const input = useAppStore((s) => s.input)
  const setInput = useAppStore((s) => s.setInput)
  const runCurrentRecipe = useAppStore((s) => s.runCurrentRecipe)
  const resetInput = useAppStore((s) => s.resetInput)

  useEffect(() => {
    const handle = window.setTimeout(() => runCurrentRecipe(), INPUT_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [input, runCurrentRecipe])

  const charCount = useMemo(() => input.length, [input])

  return (
    <section
      className="card glow-green flex min-h-0 flex-col"
      style={{ borderTop: '2px solid var(--accent)' }}
    >
      <div className="card-header">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Input</h2>
        </div>
        <div className="flex items-center gap-3">
          {charCount > 0 && (
            <span className="font-code text-xs" style={{ color: 'var(--text-muted)' }}>
              {charCount.toLocaleString()}
            </span>
          )}
          <button
            type="button"
            onClick={resetInput}
            className="rounded-md px-3 py-1 text-xs font-semibold transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
          >
            Clear
          </button>
        </div>
      </div>
      <MagicSuggestions />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste ciphertext, encoded data, JWTs, PowerShell commands, logs..."
        spellCheck={false}
        className="font-code min-h-0 flex-1 resize-none bg-transparent p-4 text-sm leading-relaxed outline-none"
        style={{ color: '#66ffaa', caretColor: 'var(--accent)' }}
      />
    </section>
  )
}
