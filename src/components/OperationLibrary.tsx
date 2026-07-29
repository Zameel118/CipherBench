import { useMemo, useState } from 'react'
import { getAllOperations, OPERATION_CATEGORIES } from '../operations'
import { useAppStore } from '../store/useAppStore'

export function OperationLibrary({ compact: _compact = false }: { compact?: boolean }) {
  const search = useAppStore((s) => s.operationSearch)
  const setSearch = useAppStore((s) => s.setOperationSearch)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)
  const [activeCat, setActiveCat] = useState<string | null>(OPERATION_CATEGORIES[0] ?? null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const all = getAllOperations()
    if (!q) return all
    return all.filter(
      (op) =>
        op.name.toLowerCase().includes(q) ||
        op.id.toLowerCase().includes(q) ||
        op.description.toLowerCase().includes(q) ||
        op.category.toLowerCase().includes(q),
    )
  }, [search])

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const cat of OPERATION_CATEGORIES) {
      map.set(cat, filtered.filter((op) => op.category === cat))
    }
    return map
  }, [filtered])

  const searching = search.trim().length > 0

  return (
    <div className="flex h-full min-h-0 flex-col" data-tour="arsenal-panel">
      <div className="cb-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="var(--text-dim)" strokeWidth="1.75" />
          <path d="M20 20l-3.5-3.5" stroke="var(--text-dim)" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <label className="sr-only" htmlFor="op-search">
          Search operations
        </label>
        <input
          id="op-search"
          data-tour="arsenal-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search ops..."
        />
      </div>

      <div className="cb-scroll min-h-0 flex-1">
        {OPERATION_CATEGORIES.map((cat) => {
          const ops = byCategory.get(cat) ?? []
          if (ops.length === 0) return null
          const open = searching || activeCat === cat
          const label = cat.replace(' Tools', ' tools')
          return (
            <div key={cat} className="mb-0.5">
              <button
                type="button"
                className="cb-cat"
                data-active={open && !searching ? 'true' : undefined}
                aria-expanded={open}
                onClick={() => setActiveCat((prev) => (prev === cat ? null : cat))}
              >
                <span>{label}</span>
                <span className="cb-cat-chevron" aria-hidden>
                  ▸
                </span>
              </button>
              <div className="cb-op-list" data-open={open ? 'true' : 'false'}>
                <div className="cb-op-list-inner pb-1">
                  {ops.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      className="cb-op"
                      title={op.description}
                      onClick={() => addOperationToRecipe(op.id)}
                    >
                      {op.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="px-2 py-6 text-center font-code text-xs text-[var(--text-dim)]">
            no ops matched
          </p>
        )}
      </div>
      <p className="cb-hint px-2 pt-2">click → recipe</p>
    </div>
  )
}
