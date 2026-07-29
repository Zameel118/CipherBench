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
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-800">Input</h2>
        <button
          type="button"
          onClick={resetInput}
          className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
        >
          Reset input
        </button>
      </header>
      <MagicSuggestions />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste ciphertext, logs, or encoded data…"
        spellCheck={false}
        className="min-h-0 flex-1 resize-none border-0 bg-transparent p-3 font-mono text-sm text-slate-900 outline-none"
      />
    </section>
  )
}
