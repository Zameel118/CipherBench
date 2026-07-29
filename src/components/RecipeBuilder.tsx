import { useCallback, useState } from 'react'
import { getOperation } from '../operations'
import { useAppStore, type RecipeStepInstance } from '../store/useAppStore'
import { OperationLibrary } from './OperationLibrary'

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
      <label className="flex items-center gap-2 text-xs text-slate-700">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) =>
            updateStepParams(step.instanceId, { [paramName]: e.target.checked })
          }
        />
        {paramName}
      </label>
    )
  }

  if (type === 'select' && options) {
    return (
      <label className="flex flex-col gap-0.5 text-xs text-slate-700">
        <span className="text-slate-500">{paramName}</span>
        <select
          value={String(value)}
          onChange={(e) =>
            updateStepParams(step.instanceId, { [paramName]: e.target.value })
          }
          className="rounded border border-slate-200 px-1.5 py-1 text-sm"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (type === 'number') {
    return (
      <label className="flex flex-col gap-0.5 text-xs text-slate-700">
        <span className="text-slate-500">{paramName}</span>
        <input
          type="number"
          value={Number(value)}
          onChange={(e) =>
            updateStepParams(step.instanceId, {
              [paramName]: Number(e.target.value),
            })
          }
          className="rounded border border-slate-200 px-1.5 py-1 text-sm"
        />
      </label>
    )
  }

  return (
    <label className="flex flex-col gap-0.5 text-xs text-slate-700">
      <span className="text-slate-500">{paramName}</span>
      <input
        type="text"
        value={String(value)}
        onChange={(e) =>
          updateStepParams(step.instanceId, { [paramName]: e.target.value })
        }
        className="rounded border border-slate-200 px-1.5 py-1 font-mono text-sm"
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
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-800">Recipe</h2>
        <button
          type="button"
          onClick={clearRecipe}
          disabled={recipe.length === 0}
          className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        >
          Clear recipe
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col border-b border-slate-100 pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-3">
          <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">
            Library
          </h3>
          <OperationLibrary />
        </div>

        <div className="flex min-h-0 flex-col">
          <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">
            Active steps
          </h3>
          {recipe.length === 0 ? (
            <p className="text-sm text-slate-500">
              Add operations from the library. Drag steps to reorder.
            </p>
          ) : (
            <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto">
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
                    className={`rounded-md border border-slate-200 bg-slate-50 p-2 ${
                      dragIndex === index ? 'opacity-60 ring-2 ring-sky-300' : ''
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="cursor-grab text-xs text-slate-400">⋮⋮</span>
                        <span className="ml-1 text-sm font-medium text-slate-800">
                          {index + 1}. {op.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRecipeStep(step.instanceId)}
                        className="shrink-0 rounded px-1.5 py-0.5 text-xs text-red-700 hover:bg-red-50"
                        aria-label={`Remove ${op.name}`}
                      >
                        Remove
                      </button>
                    </div>
                    {op.params.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2">
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
    </section>
  )
}
