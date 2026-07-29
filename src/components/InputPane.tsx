import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { MagicSuggestions } from './MagicSuggestions'

const INPUT_DEBOUNCE_MS = 200

export function InputPane() {
  const input = useAppStore((s) => s.input)
  const setInput = useAppStore((s) => s.setInput)
  const runCurrentRecipe = useAppStore((s) => s.runCurrentRecipe)
  const resetInput = useAppStore((s) => s.resetInput)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      runCurrentRecipe()
    }, INPUT_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [input, runCurrentRecipe])

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-800/80 bg-[#0f1629]">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-800/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-500/80 shadow-[0_0_6px_rgb(6_182_212/0.4)]" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Input</h2>
        </div>
        <button
          type="button"
          onClick={resetInput}
          className="rounded px-2 py-0.5 text-[11px] text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
        >
          Clear
        </button>
      </header>
      <MagicSuggestions />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste ciphertext, logs, or encoded data…"
        spellCheck={false}
        className="min-h-0 flex-1 resize-none border-0 bg-transparent p-3 font-mono text-sm leading-relaxed text-emerald-300/90 outline-none placeholder:text-slate-600"
      />
    </section>
  )
}
