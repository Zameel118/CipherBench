import { useMemo, useState } from 'react'
import { getAllOperations, OPERATION_CATEGORIES } from '../operations'
import { useAppStore } from '../store/useAppStore'

const CATEGORY_COLORS: Record<string, string> = {
  Encoding: '#22d3ee',
  Encryption: '#fb7185',
  Hashing: '#fbbf24',
  'CTF Tools': '#e879f9',
  'SOC Tools': '#60a5fa',
  'Data Format': '#a78bfa',
  Extractors: '#4ade80',
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
    <div className="flex h-full min-h-0 flex-col">
      <label className="sr-only" htmlFor="op-search">
        Search operations
      </label>
      <input
        id="op-search"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search arsenal — base64, jwt, xor..."
        className="font-code mb-3 w-full rounded-xl border border-[rgba(37,99,235,0.3)] bg-[rgba(0,0,0,0.4)] px-4 py-3 text-sm text-white outline-none placeholder:text-[#6b7194] focus:border-[rgba(168,85,247,0.5)]"
      />
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {OPERATION_CATEGORIES.map((cat) => {
          const ops = byCategory.get(cat) ?? []
          if (ops.length === 0) return null
          const isCollapsed = collapsed.has(cat)
          const color = CATEGORY_COLORS[cat] ?? '#a855f7'
          return (
            <div key={cat} className="mb-3">
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-[rgba(255,255,255,0.03)]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
                <span
                  className="flex-1 text-xs font-bold uppercase tracking-[0.16em]"
                  style={{ color }}
                >
                  {cat}
                </span>
                <span className="font-code text-[10px] text-[#6b7194]">{ops.length}</span>
              </button>
              {!isCollapsed && (
                <div className="mt-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {ops.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => addOperationToRecipe(op.id)}
                      className="rounded-xl border border-[rgba(37,99,235,0.15)] bg-[rgba(10,14,28,0.6)] px-3 py-2.5 text-left transition-all hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.08)]"
                      title={op.description}
                    >
                      <span className="text-sm font-semibold text-[#e8eaf6]">{op.name}</span>
                      <span className="mt-0.5 block line-clamp-1 text-[11px] text-[#6b7194]">
                        {op.description}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#6b7194]">No operations match.</p>
        )}
      </div>
    </div>
  )
}
