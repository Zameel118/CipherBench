import { useMemo } from 'react'
import { suggestOperations } from '../core/magic'
import { useAppStore } from '../store/useAppStore'

export function MagicSuggestions({ open }: { open: boolean }) {
  const input = useAppStore((s) => s.input)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)

  const suggestions = useMemo(() => suggestOperations(input, 4), [input])

  if (!open || input.trim().length === 0 || suggestions.length === 0) return null

  return (
    <div className="border-b border-[var(--border)] bg-[var(--accent-dim)] px-4 py-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
        Suggestions
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.operationId}
            type="button"
            onClick={() => addOperationToRecipe(s.operationId)}
            className="rounded-md border border-[var(--accent-border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text)] hover:border-[var(--accent)]"
          >
            {s.name}
            <span className="font-code ml-2 text-[10px] text-[var(--accent)]">
              {(s.score * 100).toFixed(0)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
