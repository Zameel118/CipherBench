import { useEffect, useCallback } from 'react'
import { compileFlagRegex } from '../core/flag-pattern'
import { useAppStore } from '../store/useAppStore'
import { FlagHighlight } from './FlagHighlight'

export function OutputPane() {
  const outputText = useAppStore((s) => s.outputText)
  const outputError = useAppStore((s) => s.outputError)
  const input = useAppStore((s) => s.input)
  const recipe = useAppStore((s) => s.recipe)
  const flagPattern = useAppStore((s) => s.flagPattern)
  const setFlagPattern = useAppStore((s) => s.setFlagPattern)
  const flagPatternError = useAppStore((s) => s.flagPatternError)

  const display = recipe.length === 0 ? input : outputText
  const { error: patternCompileError } = compileFlagRegex(flagPattern)

  useEffect(() => {
    useAppStore.setState({ flagPatternError: patternCompileError })
  }, [flagPattern, patternCompileError])

  const copyOutput = useCallback(async () => {
    if (display) await navigator.clipboard.writeText(display)
  }, [display])

  return (
    <section
      className="card flex min-h-0 flex-col"
      style={{ borderTop: '2px solid #44aaff' }}
    >
      <div className="card-header flex-col !items-start gap-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#44aaff', boxShadow: '0 0 8px rgba(68,170,255,0.5)' }} />
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#44aaff' }}>Output</h2>
          </div>
          <div className="flex items-center gap-2">
            {recipe.length === 0 && (
              <span className="rounded-md px-2 py-0.5 text-xs font-medium" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
                passthrough
              </span>
            )}
            <button
              type="button"
              onClick={copyOutput}
              disabled={!display}
              className="rounded-md px-3 py-1 text-xs font-semibold transition-colors hover:opacity-80 disabled:opacity-25"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
            >
              Copy
            </button>
          </div>
        </div>

        {/* Flag pattern */}
        <div className="flex w-full items-center gap-2">
          <span className="flex-shrink-0 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Flag regex</span>
          <input
            type="text"
            value={flagPattern}
            onChange={(e) => setFlagPattern(e.target.value)}
            className="font-code min-w-0 flex-1 rounded-md px-3 py-1.5 text-xs outline-none transition-colors"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            spellCheck={false}
          />
        </div>
        {flagPatternError && (
          <p className="text-xs font-medium" style={{ color: '#ffaa44' }}>{flagPatternError}</p>
        )}
      </div>

      {outputError && recipe.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 text-sm" style={{ borderBottom: '1px solid var(--border)', color: 'var(--danger)', background: 'rgba(255,68,102,0.05)' }}>
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {outputError}
        </div>
      )}

      <pre className="font-code min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-4 text-sm leading-relaxed" style={{ color: '#aaccff' }}>
        {patternCompileError ? display : <FlagHighlight text={display} pattern={flagPattern} />}
      </pre>
    </section>
  )
}
