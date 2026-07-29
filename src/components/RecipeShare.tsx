import { useState } from 'react'
import {
  buildShareUrl,
  recipeToJson,
  recipeFromJson,
} from '../core/recipe-serializer'
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
    const json = recipeToJson(recipeFromStore(), true)
    await navigator.clipboard.writeText(json)
    showMessage('Recipe JSON copied')
  }

  const copyLink = async () => {
    const url = buildShareUrl(recipeFromStore())
    await navigator.clipboard.writeText(url)
    showMessage('Share link copied')
  }

  const loadFromJson = () => {
    const { recipe, error } = recipeFromJson(importJson)
    if (error || !recipe) {
      showMessage(error ?? 'Failed to load recipe')
      return
    }
    loadRecipe(recipe)
    setImportJson('')
    showMessage('Recipe loaded')
  }

  return (
    <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-800">
      <p className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
        Save / share recipe
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyJson}
          disabled={recipeLength === 0}
          className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Copy JSON
        </button>
        <button
          type="button"
          onClick={copyLink}
          disabled={recipeLength === 0}
          className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Copy link
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder='Paste recipe JSON…'
          className="min-w-0 flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={loadFromJson}
          className="shrink-0 rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Load
        </button>
      </div>
      {message && (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300" role="status">
          {message}
        </p>
      )}
    </div>
  )
}
