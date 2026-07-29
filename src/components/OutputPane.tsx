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
    <section className="cb-panel cb-terminal-chrome min-h-[280px] lg:min-h-0" id="workbench-output">
      <div className="cb-panel-header flex-col !items-stretch gap-3">
        <div className="flex w-full items-center justify-between gap-2">
          <div>
            <p className="font-code text-[10px] font-bold uppercase tracking-[0.2em] text-[#e879f9]">
              Decrypted output
            </p>
            <h2 className="text-base font-bold text-white">Recovered data</h2>
          </div>
          <div className="flex items-center gap-2">
            {recipe.length === 0 && (
              <span className="font-code rounded-full border border-[rgba(148,153,184,0.25)] px-2 py-0.5 text-[10px] text-[#9499b8]">
                passthrough
              </span>
            )}
            <button
              type="button"
              onClick={copyOutput}
              disabled={!display}
              className="cb-btn cb-btn-ghost !px-3 !py-1.5 !text-[11px]"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-code text-[10px] uppercase tracking-widest text-[#6b7194]">Flag</span>
          <input
            type="text"
            value={flagPattern}
            onChange={(e) => setFlagPattern(e.target.value)}
            className="font-code min-w-0 flex-1 rounded-lg border border-[rgba(37,99,235,0.25)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-xs text-[#c4b5fd] outline-none focus:border-[rgba(168,85,247,0.45)]"
            spellCheck={false}
          />
        </div>
        {flagPatternError && (
          <p className="text-xs font-medium text-[#fbbf24]">{flagPatternError}</p>
        )}
      </div>

      {outputError && recipe.length > 0 && (
        <div
          className="flex items-center gap-2 border-b border-[rgba(251,113,133,0.25)] bg-[rgba(251,113,133,0.08)] px-4 py-2 text-sm text-[#fb7185]"
          role="alert"
        >
          {outputError}
        </div>
      )}

      <pre className="font-code min-h-[200px] flex-1 overflow-auto whitespace-pre-wrap break-words px-5 py-4 text-[15px] leading-relaxed text-[#c7d2fe]">
        {patternCompileError ? display : <FlagHighlight text={display} pattern={flagPattern} />}
      </pre>
    </section>
  )
}
