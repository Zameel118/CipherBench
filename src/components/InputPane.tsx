import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

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

  return (
    <section className="cb-io-pane" id="workbench-input" data-tour="workbench-input">
      <div className="cb-pane-head">
        <h2 className="cb-pane-title">// input</h2>
        <button type="button" onClick={resetInput} className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]">
          Clear
        </button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="paste ciphertext, logs, JWT..."
        spellCheck={false}
        className="cb-textarea"
      />
    </section>
  )
}
