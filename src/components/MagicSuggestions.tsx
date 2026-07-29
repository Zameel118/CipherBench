import { useMemo } from 'react'
import { suggestOperations } from '../core/magic'
import { useAppStore } from '../store/useAppStore'

export function MagicSuggestions() {
  const input = useAppStore((s) => s.input)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)

  const suggestions = useMemo(() => suggestOperations(input, 4), [input])

  if (input.trim().length === 0 || suggestions.length === 0) return null

  return (
    <div className="border-b border-[rgba(168,85,247,0.2)] bg-[rgba(168,85,247,0.06)] px-4 py-3">
      <p className="mb-2 font-code text-[10px] font-bold uppercase tracking-[0.18em] text-[#e879f9]">
        Trace hint · auto-detect
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.operationId}
            type="button"
            onClick={() => addOperationToRecipe(s.operationId)}
            className="rounded-lg border border-[rgba(168,85,247,0.35)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm font-medium text-[#e8eaf6] transition-colors hover:border-[#e879f9] hover:bg-[rgba(168,85,247,0.12)]"
          >
            {s.name}
            <span className="font-code ml-2 text-[10px] text-[#a855f7]">
              {(s.score * 100).toFixed(0)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
