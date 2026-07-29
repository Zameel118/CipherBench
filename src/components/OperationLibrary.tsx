import { useMemo, useState } from 'react'
import { getAllOperations, OPERATION_CATEGORIES } from '../operations'
import { useAppStore } from '../store/useAppStore'

const CATEGORY_ICONS: Record<string, string> = {
  Encoding: '⟨⟩',
  Encryption: '🔐',
  Hashing: '#',
  'CTF Tools': '🚩',
  'SOC Tools': '🛡',
}

export function OperationLibrary() {
  const search = useAppStore((s) => s.operationSearch)
  const setSearch = useAppStore((s) => s.setOperationSearch)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

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
      <div className="relative mb-2">
        <svg className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          id="op-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ops…"
          className="w-full rounded-md border border-slate-700/50 bg-slate-900/60 py-1.5 pl-7 pr-2 text-xs text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-700 focus:ring-1 focus:ring-cyan-800"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {OPERATION_CATEGORIES.map((cat) => {
          const ops = byCategory.get(cat) ?? []
          if (ops.length === 0) return null
          const isCollapsed = collapsed.has(cat)
          return (
            <div key={cat} className="mb-1">
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left transition-colors hover:bg-slate-800/50"
              >
                <span className="text-xs">{CATEGORY_ICONS[cat] ?? '●'}</span>
                <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {cat}
                </span>
                <span className="text-[10px] text-slate-600">{ops.length}</span>
                <svg className={`h-3 w-3 text-slate-600 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {!isCollapsed && (
                <ul className="mb-1 ml-1 space-y-0.5">
                  {ops.map((op) => (
                    <li key={op.id}>
                      <button
                        type="button"
                        onClick={() => addOperationToRecipe(op.id)}
                        className="group w-full rounded px-2 py-1 text-left transition-all hover:bg-cyan-950/40 hover:shadow-[inset_0_0_0_1px_rgb(6_182_212/0.2)]"
                        title={op.description}
                      >
                        <span className="text-xs font-medium text-slate-300 group-hover:text-cyan-400">{op.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-xs text-slate-600">No operations match.</p>
        )}
      </div>
    </div>
  )
}
