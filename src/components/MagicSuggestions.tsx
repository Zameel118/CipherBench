import { useMemo } from 'react'
import { suggestOperations } from '../core/magic'
import { useAppStore } from '../store/useAppStore'

export function MagicSuggestions() {
  const input = useAppStore((s) => s.input)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)

  const suggestions = useMemo(
    () => suggestOperations(input, 3),
    [input],
  )

  if (input.trim().length === 0 || suggestions.length === 0) {
    return null
  }

  return (
    <div className="flex-shrink-0 border-b border-cyan-900/20 bg-cyan-950/20 px-3 py-1.5">
      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-600">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Auto-detect
      </p>
      <div className="flex flex-wrap gap-1">
        {suggestions.map((s) => (
          <button
            key={s.operationId}
            type="button"
            onClick={() => addOperationToRecipe(s.operationId)}
            className="rounded-full border border-cyan-800/40 bg-cyan-950/40 px-2 py-0.5 text-[11px] text-cyan-400 transition-all hover:border-cyan-600/50 hover:bg-cyan-900/30 hover:text-cyan-300"
          >
            {s.name}
            <span className="ml-1 text-[9px] text-cyan-600">
              {(s.score * 100).toFixed(0)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
