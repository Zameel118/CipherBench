import { useState } from 'react'
import { buildShareUrl, recipeToJson, recipeFromJson } from '../core/recipe-serializer'
import { copyText, downloadTextFile } from '../core/export'
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
  const input = useAppStore((s) => s.input)
  const outputText = useAppStore((s) => s.outputText)
  const recipe = useAppStore((s) => s.recipe)
  const [importJson, setImportJson] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const display = recipe.length === 0 ? input : outputText
  const hasOutput = display.trim().length > 0

  const showMessage = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 2800)
  }

  const requireRecipe = () => {
    if (recipeLength === 0) {
      showMessage('add ops to the recipe first')
      return false
    }
    return true
  }

  const copyJson = async () => {
    if (!requireRecipe()) return
    const ok = await copyText(recipeToJson(recipeFromStore(), true))
    showMessage(ok ? 'recipe JSON copied' : 'clipboard blocked')
  }

  const copyLink = async () => {
    if (!requireRecipe()) return
    const ok = await copyText(buildShareUrl(recipeFromStore()))
    showMessage(ok ? 'share link copied' : 'clipboard blocked')
  }

  const downloadRecipe = () => {
    if (!requireRecipe()) return
    downloadTextFile(
      `cipherbench-recipe-${Date.now()}.json`,
      recipeToJson(recipeFromStore(), true),
      'application/json',
    )
    saveRecipeToHistory()
    showMessage('recipe downloaded')
  }

  const downloadOutput = () => {
    if (!hasOutput) {
      showMessage('nothing to download yet')
      return
    }
    downloadTextFile(`cipherbench-output-${Date.now()}.txt`, display, 'text/plain')
    showMessage('output downloaded')
  }

  const copyOutput = async () => {
    if (!hasOutput) {
      showMessage('nothing to copy yet')
      return
    }
    const ok = await copyText(display)
    showMessage(ok ? 'output copied' : 'clipboard blocked')
  }

  const loadFromJson = () => {
    const { recipe: parsed, error } = recipeFromJson(importJson)
    if (error || !parsed) {
      showMessage(error ?? 'invalid JSON')
      return
    }
    loadRecipe(parsed)
    setImportJson('')
    showMessage('recipe loaded')
    onDone?.()
  }

  return (
    <div className="space-y-3">
      <p className="font-code text-[11px] text-[var(--text-muted)]">
        Transmit recipes / results. Pasted input stays in this browser.
      </p>

      <div className="cb-share-grid">
        <button type="button" className="cb-share-action" onClick={copyJson}>
          <strong>Copy JSON</strong>
          <span>recipe to clipboard</span>
        </button>
        <button type="button" className="cb-share-action" onClick={copyLink}>
          <strong>Copy link</strong>
          <span>shareable recipe URL</span>
        </button>
        <button type="button" className="cb-share-action" onClick={downloadRecipe}>
          <strong>Download recipe</strong>
          <span>.json file</span>
        </button>
        <button type="button" className="cb-share-action" onClick={downloadOutput}>
          <strong>Download output</strong>
          <span>.txt decoded result</span>
        </button>
        <button type="button" className="cb-share-action" onClick={copyOutput}>
          <strong>Copy output</strong>
          <span>result to clipboard</span>
        </button>
        <button
          type="button"
          className="cb-share-action"
          onClick={() => {
            if (!requireRecipe()) return
            saveRecipeToHistory()
            showMessage('saved to local history')
          }}
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
                  showMessage(`loaded: ${h.label}`)
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
