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
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-800">Output</h2>
        {recipe.length === 0 && (
          <p className="text-xs text-slate-500">
            Add recipe steps to transform input.
          </p>
        )}
        <label className="mt-2 block text-xs text-slate-600">
          Flag pattern
          <input
            type="text"
            value={flagPattern}
            onChange={(e) => setFlagPattern(e.target.value)}
            className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 font-mono text-xs"
            spellCheck={false}
          />
        </label>
        {flagPatternError && (
          <p className="mt-1 text-xs text-amber-800" role="status">
            {flagPatternError}
          </p>
        )}
      </header>
      {outputError && recipe.length > 0 && (
        <div
          className="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-800"
          role="alert"
        >
          {outputError}
        </div>
      )}
      <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-sm text-slate-900">
        {patternCompileError ? (
          display
        ) : (
          <FlagHighlight text={display} pattern={flagPattern} />
        )}
      </pre>
    </section>
  )
}
