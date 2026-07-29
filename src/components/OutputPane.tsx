import { useEffect } from 'react'
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
    useAppStore.setState({
      flagPatternError: patternCompileError,
    })
  }, [flagPattern, patternCompileError])

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-800/80 bg-[#0f1629]">
      <header className="flex-shrink-0 border-b border-slate-800/60 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgb(245_158_11/0.4)]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Output</h2>
          </div>
          {recipe.length === 0 && (
            <span className="text-[10px] text-slate-600">
              passthrough
            </span>
          )}
        </div>

        {/* Flag pattern input — compact */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Flag regex</span>
          <input
            type="text"
            value={flagPattern}
            onChange={(e) => setFlagPattern(e.target.value)}
            className="min-w-0 flex-1 rounded border border-slate-700/60 bg-slate-900/60 px-2 py-0.5 font-mono text-[11px] text-slate-300 outline-none transition-colors focus:border-cyan-700 focus:ring-1 focus:ring-cyan-800"
            spellCheck={false}
          />
        </div>
        {flagPatternError && (
          <p className="mt-1 text-[10px] text-amber-400" role="status">
            {flagPatternError}
          </p>
        )}
      </header>

      {outputError && recipe.length > 0 && (
        <div
          className="flex-shrink-0 border-b border-red-900/40 bg-red-950/30 px-3 py-1.5 text-xs text-red-400"
          role="alert"
        >
          <span className="mr-1.5 font-mono text-red-500">✕</span>
          {outputError}
        </div>
      )}

      <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-sm leading-relaxed text-sky-300/90">
        {patternCompileError ? (
          display
        ) : (
          <FlagHighlight text={display} pattern={flagPattern} />
        )}
      </pre>
    </section>
  )
}
