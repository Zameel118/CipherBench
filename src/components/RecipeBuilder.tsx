import { useCallback, useState } from 'react'
import { getOperation } from '../operations'
import { useAppStore, type RecipeStepInstance } from '../store/useAppStore'
import { OperationLibrary } from './OperationLibrary'
import { RecipeShare } from './RecipeShare'

function ParamControl({
  step,
  paramName,
  type,
  options,
  value,
}: {
  step: RecipeStepInstance
  paramName: string
  type: 'string' | 'number' | 'boolean' | 'select'
  options?: string[]
  value: string | number | boolean
}) {
  const updateStepParams = useAppStore((s) => s.updateStepParams)
  const inputStyle = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }

  if (type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => updateStepParams(step.instanceId, { [paramName]: e.target.checked })}
          className="accent-[#00ff88]"
        />
        {paramName}
      </label>
    )
  }

  if (type === 'select' && options) {
    return (
      <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {paramName}
        <select
          value={String(value)}
          onChange={(e) => updateStepParams(step.instanceId, { [paramName]: e.target.value })}
          className="rounded-md px-2 py-1.5 text-sm outline-none"
          style={inputStyle}
        >
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </label>
    )
  }

  if (type === 'number') {
    return (
      <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {paramName}
        <input
          type="number"
          value={Number(value)}
          onChange={(e) => updateStepParams(step.instanceId, { [paramName]: Number(e.target.value) })}
          className="rounded-md px-2 py-1.5 text-sm outline-none"
          style={inputStyle}
        />
      </label>
    )
  }

  return (
    <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
      {paramName}
      <input
        type="text"
        value={String(value)}
        onChange={(e) => updateStepParams(step.instanceId, { [paramName]: e.target.value })}
        className="font-code rounded-md px-2 py-1.5 text-sm outline-none"
        style={inputStyle}
      />
    </label>
  )
}

export function RecipeBuilder() {
  const recipe = useAppStore((s) => s.recipe)
  const removeRecipeStep = useAppStore((s) => s.removeRecipeStep)
  const reorderRecipe = useAppStore((s) => s.reorderRecipe)
  const clearRecipe = useAppStore((s) => s.clearRecipe)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const onDragStart = useCallback((index: number) => setDragIndex(index), [])
  const onDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault()
      if (dragIndex === null || dragIndex === index) return
      reorderRecipe(dragIndex, index)
      setDragIndex(index)
    },
    [dragIndex, reorderRecipe],
  )
  const onDragEnd = useCallback(() => setDragIndex(null), [])

  return (
    <section
      className="card flex min-h-0 flex-col"
      style={{ borderTop: '2px solid #ffcc00' }}
    >
      <div className="card-header">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#ffcc00', boxShadow: '0 0 8px rgba(255,204,0,0.5)' }} />
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#ffcc00' }}>Recipe</h2>
          {recipe.length > 0 && (
            <span className="font-code rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: 'rgba(255,204,0,0.1)', color: '#ffcc00' }}>
              {recipe.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={clearRecipe}
          disabled={recipe.length === 0}
          className="rounded-md px-3 py-1 text-xs font-semibold transition-colors hover:opacity-80 disabled:opacity-25"
          style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
        >
          Clear
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        {/* Library */}
        <div className="flex min-h-0 flex-col p-3" style={{ borderRight: '1px solid var(--border)' }}>
          <OperationLibrary />
        </div>

        {/* Pipeline */}
        <div className="flex min-h-0 flex-col p-3">
          <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Pipeline
          </h3>

          {recipe.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '2px dashed var(--border)' }}>
                  <svg className="h-6 w-6" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 6v12m-6-6h12" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Add operations to build<br />your decode pipeline
                </p>
              </div>
            </div>
          ) : (
            <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {recipe.map((step, index) => {
                const op = getOperation(step.operationId)
                if (!op) return null
                return (
                  <li
                    key={step.instanceId}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    onDragEnd={onDragEnd}
                    className={`group rounded-xl p-3 transition-all ${
                      dragIndex === index ? 'scale-[0.98] opacity-50' : ''
                    }`}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: dragIndex === index ? '1px solid var(--accent)' : '1px solid var(--border)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="cursor-grab active:cursor-grabbing" style={{ color: 'var(--text-muted)' }}>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                            <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                          </svg>
                        </span>
                        <span className="font-code flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--accent)' }}>
                          {index + 1}
                        </span>
                        <span className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {op.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRecipeStep(step.instanceId)}
                        className="flex-shrink-0 rounded-md p-1 opacity-0 transition-all group-hover:opacity-100"
                        style={{ color: 'var(--danger)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,68,102,0.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        aria-label={`Remove ${op.name}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    {op.params.length > 0 && (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {op.params.map((p) => (
                          <ParamControl
                            key={p.name}
                            step={step}
                            paramName={p.name}
                            type={p.type}
                            options={p.options}
                            value={step.params[p.name] !== undefined ? step.params[p.name]! : p.default}
                          />
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
      <RecipeShare />
    </section>
  )
}
