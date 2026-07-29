import { useMemo, useEffect, useState } from 'react'
import { suggestOperations } from '../core/magic'
import { useAppStore } from '../store/useAppStore'

export function MagicSuggestions({ pulse = false }: { pulse?: boolean }) {
  const input = useAppStore((s) => s.input)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)
  const suggestions = useMemo(() => suggestOperations(input, 4), [input])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
  }, [input])

  if (!visible || input.trim().length === 0 || suggestions.length === 0) return null

  return (
    <div
      id="magic-suggestions"
      className={`cb-suggest ${pulse ? 'is-pulse' : ''}`}
      data-tour="magic-suggestions"
    >
      <div className="cb-suggest-head">
        <p className="cb-suggest-title">// detect · {suggestions.length} hit{suggestions.length === 1 ? '' : 's'}</p>
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
        {suggestions.map((s) => (
          <button
            key={s.operationId}
            type="button"
            className="cb-suggest-chip"
            title={s.reason}
            onClick={() => addOperationToRecipe(s.operationId)}
          >
            {s.name}
            <em>{(s.score * 100).toFixed(0)}%</em>
          </button>
        ))}
      </div>
    </div>
  )
}
