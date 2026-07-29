import { useState } from 'react'
import { buildShareUrl, recipeToJson, recipeFromJson } from '../core/recipe-serializer'
import type { Recipe } from '../core/types'
import { useAppStore } from '../store/useAppStore'

function recipeFromStore(): Recipe {
  return useAppStore.getState().recipe.map(({ operationId, params }) => ({
    operationId, params: { ...params },
  }))
}

export function RecipeShare() {
  const loadRecipe = useAppStore((s) => s.loadRecipe)
  const recipeLength = useAppStore((s) => s.recipe.length)
  const [importJson, setImportJson] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const showMessage = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 2500)
  }

  const copyJson = async () => {
    await navigator.clipboard.writeText(recipeToJson(recipeFromStore(), true))
    showMessage('Copied JSON')
  }
  const copyLink = async () => {
    await navigator.clipboard.writeText(buildShareUrl(recipeFromStore()))
    showMessage('Copied link')
  }
  const loadFromJson = () => {
    const { recipe, error } = recipeFromJson(importJson)
    if (error || !recipe) { showMessage(error ?? 'Invalid JSON'); return }
    loadRecipe(recipe)
    setImportJson('')
    showMessage('Recipe loaded')
  }

  const btnStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
  }

  return (
    <div className="flex-shrink-0 px-3 py-2" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <button type="button" onClick={copyJson} disabled={recipeLength === 0} className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-80 disabled:opacity-25" style={btnStyle}>JSON</button>
        <button type="button" onClick={copyLink} disabled={recipeLength === 0} className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-80 disabled:opacity-25" style={btnStyle}>Link</button>
        <input
          type="text"
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder="Paste recipe JSON..."
          className="font-code min-w-0 flex-1 rounded-md px-3 py-1.5 text-xs outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        />
        <button type="button" onClick={loadFromJson} className="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-80" style={btnStyle}>Load</button>
      </div>
      {message && (
        <p className="mt-1.5 text-xs font-semibold" style={{ color: 'var(--accent)' }}>{message}</p>
      )}
    </div>
  )
}
