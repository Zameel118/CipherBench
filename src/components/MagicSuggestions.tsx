import { useMemo, useEffect, useState } from 'react'
import { suggestMagicChains } from '../core/magic-chains'
import { useAppStore } from '../store/useAppStore'

export function MagicSuggestions({ pulse = false }: { pulse?: boolean }) {
  const input = useAppStore((s) => s.input)
  const loadRecipeSteps = useAppStore((s) => s.loadRecipeSteps)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)
  const chains = useMemo(() => suggestMagicChains(input, 4), [input])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
  }, [input])

  if (!visible || input.trim().length === 0 || chains.length === 0) return null

  return (
    <div
      id="magic-suggestions"
      className={`cb-suggest ${pulse ? 'is-pulse' : ''}`}
      data-tour="magic-suggestions"
    >
      <div className="cb-suggest-head">
        <p className="cb-suggest-title">
          // magic · {chains.length} chain{chains.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          className="cb-btn cb-btn-ghost !px-2 !py-0.5 !text-[10px]"
          onClick={() => setVisible(false)}
          title="Hide until input changes"
        >
          hide
        </button>
      </div>
      <div className="cb-suggest-chips">
        {chains.map((c) => (
          <button
            key={c.id}
            type="button"
            className="cb-suggest-chip"
            title={`${c.reason}${c.preview ? `\n→ ${c.preview}` : ''}`}
            onClick={() => {
              if (c.recipe.length === 1) {
                addOperationToRecipe(c.recipe[0]!.operationId)
              } else {
                loadRecipeSteps(c.recipe)
              }
            }}
          >
            {c.name}
            <em>{(c.score * 100).toFixed(0)}%</em>
          </button>
        ))}
      </div>
    </div>
  )
}
