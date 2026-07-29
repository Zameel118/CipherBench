import { useMemo, useState } from 'react'
import { getAllOperations, OPERATION_CATEGORIES } from '../operations'
import { useAppStore } from '../store/useAppStore'

const CATEGORY_COLORS: Record<string, string> = {
  Encoding: '#00ff88',
  Encryption: '#ff6644',
  Hashing: '#ffcc00',
  'CTF Tools': '#ff44aa',
  'SOC Tools': '#44aaff',
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
      <label className="sr-only" htmlFor="op-search">Search operations</label>
      <div className="relative mb-3">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          id="op-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search operations..."
          className="w-full rounded-lg py-2.5 pl-10 pr-3 text-sm font-medium outline-none transition-all"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {OPERATION_CATEGORIES.map((cat) => {
          const ops = byCategory.get(cat) ?? []
          if (ops.length === 0) return null
          const isCollapsed = collapsed.has(cat)
          const color = CATEGORY_COLORS[cat] ?? 'var(--accent)'
          return (
            <div key={cat} className="mb-2">
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors"
                style={{ background: isCollapsed ? 'transparent' : `${color}08` }}
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                <span className="flex-1 text-sm font-bold uppercase tracking-[0.15em]" style={{ color }}>
                  {cat}
                </span>
                <span className="font-code rounded-md px-1.5 py-0.5 text-xs font-semibold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                  {ops.length}
                </span>
                <svg
                  className={`h-3 w-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                  style={{ color: 'var(--text-muted)' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                >
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {!isCollapsed && (
                <div className="mt-0.5 space-y-0.5 pl-2">
                  {ops.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => addOperationToRecipe(op.id)}
                      className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all"
                      style={{ color: 'var(--text-secondary)' }}
                      title={op.description}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${color}10`
                        e.currentTarget.style.color = color
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }}
                    >
                      <svg className="h-3 w-3 flex-shrink-0 opacity-40 transition-opacity group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                      </svg>
                      <span className="text-sm font-medium">{op.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No operations match.</p>
        )}
      </div>
    </div>
  )
}
