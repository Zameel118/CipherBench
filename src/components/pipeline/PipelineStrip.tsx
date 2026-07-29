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
  const inputClass = 'cb-field mt-1'

  if (type === 'boolean') {
    return (
      <label className="flex items-center gap-2 font-code text-xs text-[var(--text-muted)]">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) =>
            updateStepParams(step.instanceId, { [paramName]: e.target.checked })
          }
          className="accent-[var(--accent)]"
        />
        {paramName}
      </label>
    )
  }

  if (type === 'select' && options) {
    return (
      <label className="block font-code text-[10px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
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
      <label className="block font-code text-[10px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
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
    <label className="block font-code text-[10px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
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

function stepSubtitle(opName: string, params: Record<string, string | number | boolean>) {
  if (params.bruteForceSingleByte === true) return 'key: single-byte'
  if (params.mode) return `mode: ${String(params.mode)}`
  if (params.direction) return String(params.direction)
  if (params.alphabet) return String(params.alphabet)
  return opName
}

export function PipelineStrip({ layout: _layout = 'vertical' }: { layout?: 'horizontal' | 'vertical' }) {
  const recipe = useAppStore((s) => s.recipe)
  const removeRecipeStep = useAppStore((s) => s.removeRecipeStep)
  const reorderRecipe = useAppStore((s) => s.reorderRecipe)
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

  return (
    <div className="flex h-full min-h-0 flex-col" data-tour="ops-chain-panel">
      <div className="cb-scroll min-h-0 flex-1 space-y-2">
        {recipe.map((step, index) => {
          const op = getOperation(step.operationId)
          if (!op) return null
          const isOpen = expanded === step.instanceId
          return (
            <div
              key={step.instanceId}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={onDragEnd}
              className="cb-step"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              data-dragging={dragIndex === index ? 'true' : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : step.instanceId)}
                >
                  <p className="cb-step-title">
                    {String(index + 1).padStart(2, '0')}. {op.name}
                  </p>
                  <p className="cb-step-meta">{stepSubtitle(op.name, step.params)}</p>
                </button>
                <button
                  type="button"
                  onClick={() => removeRecipeStep(step.instanceId)}
                  className="font-code text-[var(--text-dim)] transition-colors hover:text-[var(--danger)]"
                  aria-label={`Remove ${op.name}`}
                >
                  ×
                </button>
              </div>
              {op.params.length > 0 && (
                <div className="cb-step-params" data-open={isOpen ? 'true' : 'false'}>
                  <div className="cb-step-params-inner grid gap-2">
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
                </div>
              )}
            </div>
          )
        })}
        <div className="cb-drop">+ drop step</div>
      </div>
    </div>
  )
}
