import { useEffect, useCallback, useMemo, useState } from 'react'
import { compileFlagRegex } from '../core/flag-pattern'
import { copyText, downloadTextFile } from '../core/export'
import { useAppStore } from '../store/useAppStore'
import { FlagHighlight } from './FlagHighlight'

function lineDiffSummary(baseline: string, current: string): string {
  const a = baseline.split('\n')
  const b = current.split('\n')
  const max = Math.max(a.length, b.length)
  const lines: string[] = []
  let shown = 0
  for (let i = 0; i < max && shown < 40; i++) {
    const left = a[i]
    const right = b[i]
    if (left === right) continue
    if (left !== undefined && right === undefined) {
      lines.push(`- ${left}`)
      shown++
    } else if (left === undefined && right !== undefined) {
      lines.push(`+ ${right}`)
      shown++
    } else {
      lines.push(`- ${left}`)
      lines.push(`+ ${right}`)
      shown += 2
    }
  }
  if (shown === 0) return '(no line differences vs fork)'
  if (max > 40 && shown >= 40) lines.push('… truncated')
  return lines.join('\n')
}

export function OutputPane() {
  const outputText = useAppStore((s) => s.outputText)
  const outputError = useAppStore((s) => s.outputError)
  const input = useAppStore((s) => s.input)
  const recipe = useAppStore((s) => s.recipe)
  const flagPattern = useAppStore((s) => s.flagPattern)
  const setFlagPattern = useAppStore((s) => s.setFlagPattern)
  const flagPatternError = useAppStore((s) => s.flagPatternError)
  const forkSnapshot = useAppStore((s) => s.forkSnapshot)
  const captureForkSnapshot = useAppStore((s) => s.captureForkSnapshot)
  const clearForkSnapshot = useAppStore((s) => s.clearForkSnapshot)
  const [toast, setToast] = useState<string | null>(null)
  const [wrap, setWrap] = useState(true)
  const [showDiff, setShowDiff] = useState(false)

  const display = recipe.length === 0 ? input : outputText
  const { error: patternCompileError } = compileFlagRegex(flagPattern)

  const diffText = useMemo(() => {
    if (forkSnapshot == null) return null
    return lineDiffSummary(forkSnapshot, display)
  }, [forkSnapshot, display])

  useEffect(() => {
    useAppStore.setState({ flagPatternError: patternCompileError })
  }, [flagPattern, patternCompileError])

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1800)
  }

  const copyOutput = useCallback(async () => {
    if (!display) return
    const ok = await copyText(display)
    flash(ok ? 'copied' : 'blocked')
  }, [display])

  const downloadOutput = useCallback(() => {
    if (!display) return
    downloadTextFile(`cipherbench-output-${Date.now()}.txt`, display)
    flash('downloaded')
  }, [display])

  return (
    <section className="cb-io-pane" id="workbench-output" data-tour="decrypted-output">
      <div className="cb-pane-head">
        <h2 className="cb-pane-title">// output</h2>
        <div className="flex flex-wrap items-center gap-1">
          <input
            type="text"
            value={flagPattern}
            onChange={(e) => setFlagPattern(e.target.value)}
            title="Flag regex"
            aria-label="Flag regex"
            className="cb-field !w-[120px] !py-1"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setWrap((v) => !v)}
            className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
            title="Toggle word wrap"
          >
            {wrap ? 'Wrap' : 'Scroll'}
          </button>
          <button
            type="button"
            onClick={() => {
              captureForkSnapshot()
              flash('forked')
            }}
            className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
            title="Capture output as fork baseline"
          >
            Fork
          </button>
          {forkSnapshot != null && (
            <>
              <button
                type="button"
                onClick={() => setShowDiff((v) => !v)}
                className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
                title="Show line diff vs fork"
              >
                {showDiff ? 'HideΔ' : 'Diff'}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearForkSnapshot()
                  setShowDiff(false)
                  flash('cleared')
                }}
                className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
              >
                Unfork
              </button>
            </>
          )}
          <button
            type="button"
            onClick={copyOutput}
            disabled={!display}
            className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={downloadOutput}
            disabled={!display}
            className="cb-btn cb-btn-quiet !px-2 !py-1 !text-[11px]"
            title="Download output as .txt"
          >
            ↓ Out
          </button>
          {toast && (
            <span className="font-code text-[10px] text-[var(--accent)]" role="status">
              {toast}
            </span>
          )}
        </div>
      </div>

      {flagPatternError && (
        <p className="px-4 text-xs text-[var(--warn)]">{flagPatternError}</p>
      )}

      {outputError && recipe.length > 0 && (
        <div className="px-4 py-2 text-sm text-[var(--danger)]" role="alert">
          {outputError}
        </div>
      )}

      {showDiff && diffText != null && (
        <pre className="cb-pre !max-h-[28%] !border-b !border-[var(--border)] !text-[var(--warn)]">
          {diffText}
        </pre>
      )}

      <pre
        className="cb-pre"
        style={{ whiteSpace: wrap ? 'pre-wrap' : 'pre', wordBreak: wrap ? 'break-word' : 'normal' }}
      >
        {patternCompileError ? (
          display || 'decoded result, live'
        ) : display ? (
          <FlagHighlight text={display} pattern={flagPattern} />
        ) : (
          <span className="text-[var(--text-dim)]">decoded result, live</span>
        )}
      </pre>
    </section>
  )
}
