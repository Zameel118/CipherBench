import { useState } from 'react'
import { buildShareUrl, recipeToJson, recipeFromJson } from '../core/recipe-serializer'
import type { Recipe } from '../core/types'
import { useAppStore } from '../store/useAppStore'

function recipeFromStore(): Recipe {
  return useAppStore.getState().recipe.map(({ operationId, params }) => ({
    operationId,
    params: { ...params },
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
    showMessage('Recipe JSON copied')
  }
  const copyLink = async () => {
    await navigator.clipboard.writeText(buildShareUrl(recipeFromStore()))
    showMessage('Share link copied')
  }
  const loadFromJson = () => {
    const { recipe, error } = recipeFromJson(importJson)
    if (error || !recipe) {
      showMessage(error ?? 'Invalid JSON')
      return
    }
    loadRecipe(recipe)
    setImportJson('')
    showMessage('Recipe loaded')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyJson}
          disabled={recipeLength === 0}
          className="cb-btn cb-btn-quiet !text-[12px]"
        >
          Copy JSON
        </button>
        <button
          type="button"
          onClick={copyLink}
          disabled={recipeLength === 0}
          className="cb-btn cb-btn-quiet !text-[12px]"
        >
          Copy link
        </button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder="Paste recipe JSON..."
          className="cb-field min-w-0 flex-1"
        />
        <button type="button" onClick={loadFromJson} className="cb-btn cb-btn-primary !text-[12px]">
          Import
        </button>
      </div>
      {message && (
        <p className="font-code text-xs text-[var(--accent)]" role="status">
          {message}
        </p>
      )}
    </div>
  )
}
