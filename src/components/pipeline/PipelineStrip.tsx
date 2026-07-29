import { useCallback, useState } from 'react'
import { getOperation } from '../../operations'
import { useAppStore, type RecipeStepInstance } from '../../store/useAppStore'

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
  const inputClass =
    'font-code w-full rounded-lg border border-[rgba(37,99,235,0.25)] bg-[rgba(0,0,0,0.35)] px-2 py-1.5 text-xs text-[#e8eaf6] outline-none focus:border-[rgba(168,85,247,0.5)]'

  if (type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-xs text-[#9499b8]">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) =>
            updateStepParams(step.instanceId, { [paramName]: e.target.checked })
          }
          className="accent-[#a855f7]"
        />
        {paramName}
      </label>
    )
  }

  if (type === 'select' && options) {
    return (
      <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#6b7194]">
        {paramName}
        <select
          value={String(value)}
          onChange={(e) =>
            updateStepParams(step.instanceId, { [paramName]: e.target.value })
          }
          className={inputClass}
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
      <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#6b7194]">
        {paramName}
        <input
          type="number"
          value={Number(value)}
          onChange={(e) =>
            updateStepParams(step.instanceId, {
              [paramName]: Number(e.target.value),
            })
          }
          className={inputClass}
        />
      </label>
    )
  }

  return (
    <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#6b7194]">
      {paramName}
      <input
        type="text"
        value={String(value)}
        onChange={(e) =>
          updateStepParams(step.instanceId, { [paramName]: e.target.value })
        }
        className={inputClass}
      />
    </label>
  )
}

export function PipelineStrip() {
  const recipe = useAppStore((s) => s.recipe)
  const removeRecipeStep = useAppStore((s) => s.removeRecipeStep)
  const reorderRecipe = useAppStore((s) => s.reorderRecipe)
  const clearRecipe = useAppStore((s) => s.clearRecipe)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

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

  if (recipe.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm font-medium text-[#9499b8]">
          No ops in the chain yet.
        </p>
        <p className="max-w-md text-xs text-[#6b7194]">
          Open <span className="text-[#e879f9]">Arsenal</span> and add transforms, or load a mission preset from the command bar.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-[rgba(37,99,235,0.15)] px-4 py-2">
        <span className="font-code text-[10px] uppercase tracking-[0.2em] text-[#6b7194]">
          {recipe.length} stage{recipe.length !== 1 ? 's' : ''}
        </span>
        <button type="button" onClick={clearRecipe} className="cb-btn cb-btn-ghost !px-3 !py-1.5 !text-[11px]">
          Clear chain
        </button>
      </div>
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-4">
        {recipe.map((step, index) => {
          const op = getOperation(step.operationId)
          if (!op) return null
          const isOpen = expanded === step.instanceId
          return (
            <div key={step.instanceId} className="flex flex-shrink-0 items-stretch gap-2">
              <div
                draggable
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                className="flex w-[min(280px,70vw)] flex-col rounded-xl border transition-all"
                style={{
                  borderColor:
                    dragIndex === index
                      ? 'rgba(232,121,249,0.6)'
                      : 'rgba(37,99,235,0.28)',
                  background: 'rgba(10,14,28,0.9)',
                  opacity: dragIndex === index ? 0.6 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-2 p-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() =>
                      setExpanded(isOpen ? null : step.instanceId)
                    }
                  >
                    <span className="font-code text-[10px] font-bold text-[#22d3ee]">
                      STAGE {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="truncate text-sm font-semibold text-white">{op.name}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecipeStep(step.instanceId)}
                    className="rounded-md p-1 text-[#fb7185] hover:bg-[rgba(251,113,133,0.1)]"
                    aria-label={`Remove ${op.name}`}
                  >
                    ×
                  </button>
                </div>
                {isOpen && op.params.length > 0 && (
                  <div className="grid gap-2 border-t border-[rgba(37,99,235,0.15)] p-3">
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
              </div>
              {index < recipe.length - 1 && (
                <div className="flex items-center text-[#a855f7]">→</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
