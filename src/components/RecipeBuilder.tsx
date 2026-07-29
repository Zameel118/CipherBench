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

  if (type === 'boolean') {
    return (
      <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) =>
            updateStepParams(step.instanceId, { [paramName]: e.target.checked })
          }
          className="accent-cyan-500"
        />
        {paramName}
      </label>
    )
  }

  if (type === 'select' && options) {
    return (
      <label className="flex flex-col gap-0.5 text-[11px] text-slate-400">
        <span className="text-slate-500">{paramName}</span>
        <select
          value={String(value)}
          onChange={(e) =>
            updateStepParams(step.instanceId, { [paramName]: e.target.value })
          }
          className="rounded border border-slate-700/50 bg-slate-900/70 px-1.5 py-0.5 text-[11px] text-slate-300 outline-none"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </label>
    )
  }

  if (type === 'number') {
    return (
      <label className="flex flex-col gap-0.5 text-[11px] text-slate-400">
        <span className="text-slate-500">{paramName}</span>
        <input
          type="number"
          value={Number(value)}
          onChange={(e) =>
            updateStepParams(step.instanceId, {
              [paramName]: Number(e.target.value),
            })
          }
          className="rounded border border-slate-700/50 bg-slate-900/70 px-1.5 py-0.5 text-[11px] text-slate-300 outline-none"
        />
      </label>
    )
  }

  return (
    <label className="flex flex-col gap-0.5 text-[11px] text-slate-400">
      <span className="text-slate-500">{paramName}</span>
      <input
        type="text"
        value={String(value)}
        onChange={(e) =>
          updateStepParams(step.instanceId, { [paramName]: e.target.value })
        }
        className="rounded border border-slate-700/50 bg-slate-900/70 px-1.5 py-0.5 font-mono text-[11px] text-slate-300 outline-none"
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

  const onDragStart = useCallback((index: number) => {
    setDragIndex(index)
  }, [])

  const onDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault()
      if (dragIndex === null || dragIndex === index) return
      reorderRecipe(dragIndex, index)
      setDragIndex(index)
    },
    [dragIndex, reorderRecipe],
  )

  const onDragEnd = useCallback(() => {
    setDragIndex(null)
  }, [])

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-800/80 bg-[#0f1629]">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-slate-800/60 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-violet-500/80 shadow-[0_0_6px_rgb(139_92_246/0.4)]" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recipe</h2>
          {recipe.length > 0 && (
            <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold text-violet-400">
              {recipe.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={clearRecipe}
          disabled={recipe.length === 0}
          className="rounded px-2 py-0.5 text-[11px] text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-30"
        >
          Clear
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Operations library */}
        <div className="flex min-h-0 flex-col border-b border-slate-800/40 p-2 md:border-b-0 md:border-r">
          <OperationLibrary />
        </div>

        {/* Active steps */}
        <div className="flex min-h-0 flex-col p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Pipeline
            </span>
          </div>
          {recipe.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="max-w-[180px] text-center text-xs leading-relaxed text-slate-600">
                Click operations from the library to build your decode pipeline.
              </p>
            </div>
          ) : (
            <ol className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
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
                    className={`group rounded-md border transition-all ${
                      dragIndex === index
                        ? 'border-cyan-500/40 opacity-60 ring-1 ring-cyan-500/30'
                        : 'border-slate-700/40 hover:border-slate-600/60'
                    } bg-slate-900/50 p-2`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="cursor-grab text-[10px] text-slate-600 active:cursor-grabbing">⠿</span>
                        <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded bg-cyan-900/40 text-[9px] font-bold text-cyan-400">
                          {index + 1}
                        </span>
                        <span className="truncate text-xs font-medium text-slate-200">
                          {op.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRecipeStep(step.instanceId)}
                        className="flex-shrink-0 rounded p-0.5 text-slate-600 opacity-0 transition-all hover:bg-red-950/40 hover:text-red-400 group-hover:opacity-100"
                        aria-label={`Remove ${op.name}`}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    {op.params.length > 0 && (
                      <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                        {op.params.map((p) => (
                          <ParamControl
                            key={p.name}
                            step={step}
                            paramName={p.name}
                            type={p.type}
                            options={p.options}
                            value={
                              step.params[p.name] !== undefined
                                ? step.params[p.name]!
                                : p.default
                            }
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
