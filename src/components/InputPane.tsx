import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { MagicSuggestions } from './MagicSuggestions'
import { shannonEntropyNormalized } from '../core/magic'
import { detectMagic } from '../operations/data-format/hex-dump'
import { fileTooLarge } from '../core/input-limits'

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

function bytesToBinaryString(bytes: Uint8Array): string {
  let out = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    out += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return out
}

export function InputPane({ suggestPulse = false }: { suggestPulse?: boolean }) {
  const input = useAppStore((s) => s.input)
  const setInput = useAppStore((s) => s.setInput)
  const autoRun = useAppStore((s) => s.autoRun)
  const runCurrentRecipe = useAppStore((s) => s.runCurrentRecipe)
  const resetInput = useAppStore((s) => s.resetInput)
  const swapInputOutput = useAppStore((s) => s.swapInputOutput)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)
  const [sampleOpen, setSampleOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileHint, setFileHint] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!autoRun) return
    const handle = window.setTimeout(() => {
      void runCurrentRecipe()
    }, INPUT_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [input, runCurrentRecipe, autoRun])

  const entropy = input.trim() ? shannonEntropyNormalized(input) : 0

  const ingestFile = async (file: File) => {
    const sizeErr = fileTooLarge(file.size)
    if (sizeErr) {
      setFileHint(sizeErr)
      return
    }
    const buf = new Uint8Array(await file.arrayBuffer())
    const magic = detectMagic(buf)
    const asText = new TextDecoder('utf-8', { fatal: false }).decode(buf)
    const looksBinary = buf.some((b) => b === 0) || (magic !== null && magic !== 'gzip')
    if (looksBinary) {
      setInput(bytesToBinaryString(buf))
      setFileHint(`${file.name} · ${magic ?? 'binary'} · ${buf.length} bytes (latin1)`)
      addOperationToRecipe('hex-dump')
    } else {
      setInput(asText)
      setFileHint(`${file.name} · text · ${buf.length} bytes`)
    }
  }

  return (
    <section
      className={`cb-io-pane ${dragOver ? 'cb-drop-target' : ''}`}
      id="workbench-input"
      data-tour="workbench-input"
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) void ingestFile(file)
      }}
    >
      <div className="cb-pane-head">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h2 className="cb-pane-title">// input</h2>
            {input.trim().length > 0 && (
              <span className="font-code text-[10px] text-[var(--text-dim)]">
                H≈{entropy.toFixed(2)}
              </span>
            )}
          </div>
          {fileHint && (
            <span className="truncate font-code text-[10px] text-[var(--accent)]">{fileHint}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void ingestFile(file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
            onClick={() => fileRef.current?.click()}
            title="Open file (text or binary → hex dump)"
          >
            File
          </button>
          <div className="relative z-20">
            <button
              type="button"
              className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
              aria-expanded={sampleOpen}
              onClick={() => setSampleOpen((v) => !v)}
            >
              Sample ▾
            </button>
            {sampleOpen && (
              <div
                className="cb-menu !left-auto !right-0 !min-w-[160px]"
                onPointerDown={(e) => e.stopPropagation()}
              >
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
        placeholder="paste ciphertext, logs, JWT… or drop a file"
        spellCheck={false}
        className="cb-textarea"
      />
    </section>
  )
}
