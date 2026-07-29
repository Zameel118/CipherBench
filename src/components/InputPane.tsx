import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { MagicSuggestions } from './MagicSuggestions'
import { shannonEntropyNormalized } from '../core/magic'

const INPUT_DEBOUNCE_MS = 200

const SAMPLES: { label: string; value: string }[] = [
  { label: 'Base64 flag', value: 'RkxBR3t0ZXN0X2Jhc2U2NF9jaGFpbn0=' },
  { label: 'Hex blob', value: '464c41477b6865785f73616d706c657d' },
  {
    label: 'JWT sample',
    value:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjdGYiLCJuYW1lIjoiQ2lwaGVyQmVuY2gifQ.signature',
  },
]

export function InputPane({ suggestPulse = false }: { suggestPulse?: boolean }) {
  const input = useAppStore((s) => s.input)
  const setInput = useAppStore((s) => s.setInput)
  const autoRun = useAppStore((s) => s.autoRun)
  const runCurrentRecipe = useAppStore((s) => s.runCurrentRecipe)
  const resetInput = useAppStore((s) => s.resetInput)
  const swapInputOutput = useAppStore((s) => s.swapInputOutput)
  const [sampleOpen, setSampleOpen] = useState(false)

  useEffect(() => {
    if (!autoRun) return
    const handle = window.setTimeout(() => runCurrentRecipe(), INPUT_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [input, runCurrentRecipe, autoRun])

  const entropy = input.trim() ? shannonEntropyNormalized(input) : 0

  return (
    <section className="cb-io-pane" id="workbench-input" data-tour="workbench-input">
      <div className="cb-pane-head">
        <div className="flex items-center gap-2">
          <h2 className="cb-pane-title">// input</h2>
          {input.trim().length > 0 && (
            <span className="font-code text-[10px] text-[var(--text-dim)]">
              H≈{entropy.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              type="button"
              className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
              aria-expanded={sampleOpen}
              onClick={() => setSampleOpen((v) => !v)}
            >
              Sample ▾
            </button>
            {sampleOpen && (
              <div className="cb-menu !left-auto !right-0 !min-w-[160px]">
                {SAMPLES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className="cb-menu-item"
                    onClick={() => {
                      setInput(s.value)
                      setSampleOpen(false)
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={swapInputOutput}
            className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
            title="Promote output into input"
          >
            Swap↑
          </button>
          <button
            type="button"
            onClick={resetInput}
            className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
          >
            Clear
          </button>
        </div>
      </div>

      <MagicSuggestions pulse={suggestPulse} />

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
