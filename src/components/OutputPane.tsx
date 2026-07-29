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
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Output</h2>
        {recipe.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add recipe steps to transform input.
          </p>
        )}
        <label className="mt-2 block text-xs text-slate-600 dark:text-slate-300">
          Flag pattern
          <input
            type="text"
            value={flagPattern}
            onChange={(e) => setFlagPattern(e.target.value)}
            className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            spellCheck={false}
          />
        </label>
        {flagPatternError && (
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300" role="status">
            {flagPatternError}
          </p>
        )}
      </header>
      {outputError && recipe.length > 0 && (
        <div
          className="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          {outputError}
        </div>
      )}
      <pre className="min-h-[220px] flex-1 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-sm text-slate-900 dark:text-slate-100">
        {patternCompileError ? (
          display
        ) : (
          <FlagHighlight text={display} pattern={flagPattern} />
        )}
      </pre>
    </section>
  )
}
