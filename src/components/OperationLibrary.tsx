import { useMemo } from 'react'
import { getAllOperations, OPERATION_CATEGORIES } from '../operations'
import { useAppStore } from '../store/useAppStore'

export function OperationLibrary() {
  const search = useAppStore((s) => s.operationSearch)
  const setSearch = useAppStore((s) => s.setOperationSearch)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)

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

  return (
    <div className="flex min-h-0 flex-col">
      <label className="sr-only" htmlFor="op-search">
        Search operations
      </label>
      <input
        id="op-search"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search operations…"
        className="mb-2 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {OPERATION_CATEGORIES.map((cat) => {
          const ops = byCategory.get(cat) ?? []
          if (ops.length === 0) return null
          return (
            <div key={cat} className="mb-3">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {cat}
              </h3>
              <ul className="space-y-1">
                {ops.map((op) => (
                  <li key={op.id}>
                    <button
                      type="button"
                      onClick={() => addOperationToRecipe(op.id)}
                      className="w-full rounded-md border border-transparent px-2 py-1.5 text-left text-sm hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                      title={op.description}
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-100">{op.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                        {op.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No operations match your search.</p>
        )}
      </div>
    </div>
  )
}
