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
    <section className="cb-io-pane" id="workbench-output" data-tour="decrypted-output">
      <div className="cb-pane-head">
        <h2 className="cb-pane-title">// output</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={flagPattern}
            onChange={(e) => setFlagPattern(e.target.value)}
            title="Flag regex"
            aria-label="Flag regex"
            className="cb-field !w-[140px] !py-1"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={copyOutput}
            disabled={!display}
            className="cb-btn cb-btn-ghost !px-2 !py-1 !text-[11px]"
          >
            Copy
          </button>
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

      <pre className="cb-pre">
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
