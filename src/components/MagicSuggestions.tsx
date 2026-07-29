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
    <div className="border-b border-slate-100 bg-sky-50/80 px-3 py-2">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-sky-900">
        Magic suggestions
      </p>
      <ul className="space-y-1">
        {suggestions.map((s) => (
          <li key={s.operationId}>
            <button
              type="button"
              onClick={() => addOperationToRecipe(s.operationId)}
              className="w-full rounded-md border border-sky-200 bg-white px-2 py-1.5 text-left text-sm hover:border-sky-300 hover:bg-sky-50"
            >
              <span className="font-medium text-slate-800">{s.name}</span>
              <span className="ml-2 text-xs text-slate-500">
                {(s.score * 100).toFixed(0)}% — {s.reason}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
