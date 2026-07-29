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

  const loadSample = () => {
    setInput('RkxBR3t0ZXN0X2Jhc2U2NF9jaGFpbn0=')
  }

  return (
    <section className="cb-panel cb-terminal-chrome min-h-[280px] lg:min-h-0" id="workbench-input">
      <div className="cb-panel-header">
        <div>
          <p className="font-code text-[10px] font-bold uppercase tracking-[0.2em] text-[#22d3ee]">
            Intel ingest
          </p>
          <h2 className="text-base font-bold text-white">Raw signal</h2>
        </div>
        <div className="flex items-center gap-2">
          {charCount > 0 && (
            <span className="font-code text-xs text-[#6b7194]">{charCount.toLocaleString()}</span>
          )}
          <button type="button" onClick={loadSample} className="cb-btn cb-btn-ghost !px-3 !py-1.5 !text-[11px]">
            Sample
          </button>
          <button type="button" onClick={resetInput} className="cb-btn cb-btn-ghost !px-3 !py-1.5 !text-[11px]">
            Clear
          </button>
        </div>
      </div>
      <MagicSuggestions />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Drop ciphertext, logs, JWTs, PowerShell -EncodedCommand, MIME headers..."
        spellCheck={false}
        className="font-code min-h-[200px] flex-1 resize-none bg-transparent px-5 py-4 text-[15px] leading-relaxed text-[#4ade80] outline-none placeholder:text-[#4b556f]"
      />
    </section>
  )
}
