import { useMemo } from 'react'
import { findFlagMatches } from '../core/flag-pattern'
import { suggestMagicChains } from '../core/magic-chains'
import { countIocs } from '../operations/soc-tools/ioc-extract'
import { useAppStore } from '../store/useAppStore'

export function StatusTray({ onFocusSuggestions }: { onFocusSuggestions: () => void }) {
  const input = useAppStore((s) => s.input)
  const outputText = useAppStore((s) => s.outputText)
  const recipe = useAppStore((s) => s.recipe)
  const flagPattern = useAppStore((s) => s.flagPattern)
  const addOperationToRecipe = useAppStore((s) => s.addOperationToRecipe)

  const display = recipe.length === 0 ? input : outputText

  const flagCount = useMemo(
    () => findFlagMatches(display, flagPattern).length,
    [display, flagPattern],
  )
  const iocCount = useMemo(() => countIocs(display), [display])
  const suggestions = useMemo(() => suggestMagicChains(input, 4), [input])

  return (
    <div className="cb-status-tray">
      <span className="cb-status-item" data-active={flagCount > 0 ? 'true' : undefined}>
        <span aria-hidden>⚑</span>
        {flagCount > 0 ? `${flagCount} flag${flagCount === 1 ? '' : 's'} found` : 'flags found'}
      </span>
      <button
        type="button"
        className="cb-status-item"
        data-active={iocCount > 0 ? 'true' : undefined}
        onClick={() => addOperationToRecipe('ioc-extract')}
        title="Add IOC extract to recipe"
      >
        <span aria-hidden>🛡</span>
        {iocCount > 0 ? `iocs (${iocCount})` : 'iocs'}
      </button>
      <button
        type="button"
        className="cb-status-item"
        data-active={suggestions.length > 0 ? 'true' : undefined}
        onClick={onFocusSuggestions}
        title="Jump to auto-detect suggestions"
      >
        <span aria-hidden>✦</span>
        suggestions{suggestions.length > 0 ? ` (${suggestions.length})` : ''}
      </button>
    </div>
  )
}
