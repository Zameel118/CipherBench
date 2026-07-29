import { useMemo } from 'react'
import { suggestOperations } from '../core/magic'
import { useAppStore } from '../store/useAppStore'

export function MagicSuggestions() {
  const input = useAppStore((s) => s.input)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)

  const suggestions = useMemo(() => suggestOperations(input, 3), [input])

  if (input.trim().length === 0 || suggestions.length === 0) return null

  return (
    <div className="flex-shrink-0 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,255,136,0.03)' }}>
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--accent-dim)' }}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Auto-detected
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.operationId}
            type="button"
            onClick={() => addOperationToRecipe(s.operationId)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:brightness-125"
            style={{
              background: 'rgba(0,255,136,0.08)',
              border: '1px solid rgba(0,255,136,0.2)',
              color: 'var(--accent)',
            }}
          >
            {s.name}
            <span className="font-code ml-2 text-xs" style={{ color: 'var(--accent-dim)' }}>
              {(s.score * 100).toFixed(0)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
