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

export function RecipeShare({ onDone }: { onDone?: () => void }) {
  const loadRecipe = useAppStore((s) => s.loadRecipe)
  const saveRecipeToHistory = useAppStore((s) => s.saveRecipeToHistory)
  const recipeHistory = useAppStore((s) => s.recipeHistory)
  const loadHistoryEntry = useAppStore((s) => s.loadHistoryEntry)
  const recipeLength = useAppStore((s) => s.recipe.length)
  const [importJson, setImportJson] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const showMessage = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 2500)
  }

  const copyJson = async () => {
    await navigator.clipboard.writeText(recipeToJson(recipeFromStore(), true))
    showMessage('recipe JSON copied')
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(buildShareUrl(recipeFromStore()))
    showMessage('share link copied')
  }

  const downloadJson = () => {
    const blob = new Blob([recipeToJson(recipeFromStore(), true)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cipherbench-recipe-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    saveRecipeToHistory()
    showMessage('recipe downloaded + saved to history')
  }

  const loadFromJson = () => {
    const { recipe, error } = recipeFromJson(importJson)
    if (error || !recipe) {
      showMessage(error ?? 'invalid JSON')
      return
    }
    loadRecipe(recipe)
    setImportJson('')
    showMessage('recipe loaded')
    onDone?.()
  }

  return (
    <div className="space-y-3">
      <p className="font-code text-[11px] text-[var(--text-muted)]">
        Transmit recipes only - input never leaves this browser.
      </p>

      <div className="cb-share-grid">
        <button
          type="button"
          className="cb-share-action"
          onClick={copyJson}
          disabled={recipeLength === 0}
        >
          <strong>Copy JSON</strong>
          <span>clipboard payload</span>
        </button>
        <button
          type="button"
          className="cb-share-action"
          onClick={copyLink}
          disabled={recipeLength === 0}
        >
          <strong>Copy link</strong>
          <span>URL with recipe</span>
        </button>
        <button
          type="button"
          className="cb-share-action"
          onClick={downloadJson}
          disabled={recipeLength === 0}
        >
          <strong>Download</strong>
          <span>.json file</span>
        </button>
        <button
          type="button"
          className="cb-share-action"
          onClick={() => {
            saveRecipeToHistory()
            showMessage('saved to local history')
          }}
          disabled={recipeLength === 0}
        >
          <strong>Save history</strong>
          <span>this device only</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder="paste recipe JSON..."
          className="cb-field min-w-0 flex-1"
        />
        <button type="button" onClick={loadFromJson} className="cb-btn cb-btn-primary !text-[12px]">
          Import
        </button>
      </div>

      {recipeHistory.length > 0 && (
        <div>
          <p className="mb-2 font-code text-[10px] uppercase tracking-[0.12em] text-[var(--text-dim)]">
            recent
          </p>
          <div className="flex max-h-28 flex-col gap-1 overflow-y-auto">
            {recipeHistory.map((h) => (
              <button
                key={h.id}
                type="button"
                className="cb-menu-item !py-1.5"
                onClick={() => {
                  loadHistoryEntry(h.id)
                  onDone?.()
                }}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {message && (
        <p className="font-code text-xs text-[var(--accent)]" role="status">
          {message}
        </p>
      )}
    </div>
  )
}
