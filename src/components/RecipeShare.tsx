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
    showMessage('Copied JSON')
  }

  const copyLink = async () => {
    const url = buildShareUrl(recipeFromStore())
    await navigator.clipboard.writeText(url)
    showMessage('Copied link')
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
    <div className="flex-shrink-0 border-t border-slate-800/60 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={copyJson}
            disabled={recipeLength === 0}
            className="rounded border border-slate-700/40 bg-slate-900/50 px-2 py-0.5 text-[10px] text-slate-500 transition-colors hover:border-slate-600 hover:text-slate-300 disabled:opacity-30"
          >
            JSON
          </button>
          <button
            type="button"
            onClick={copyLink}
            disabled={recipeLength === 0}
            className="rounded border border-slate-700/40 bg-slate-900/50 px-2 py-0.5 text-[10px] text-slate-500 transition-colors hover:border-slate-600 hover:text-slate-300 disabled:opacity-30"
          >
            Link
          </button>
        </div>
        <input
          type="text"
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder="Paste recipe JSON…"
          className="min-w-0 flex-1 rounded border border-slate-700/40 bg-slate-900/50 px-2 py-0.5 font-mono text-[10px] text-slate-400 outline-none transition-colors placeholder:text-slate-700 focus:border-cyan-700"
        />
        <button
          type="button"
          onClick={loadFromJson}
          className="rounded border border-slate-700/40 bg-slate-900/50 px-2 py-0.5 text-[10px] text-slate-500 transition-colors hover:border-slate-600 hover:text-slate-300"
        >
          Load
        </button>
      </div>
      {message && (
        <p className="mt-1 text-[10px] text-cyan-500" role="status">
          {message}
        </p>
      )}
    </div>
  )
}
