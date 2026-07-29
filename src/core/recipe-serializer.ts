import { Base64 } from 'js-base64'
import type { Recipe, RecipeStep } from './types'
import { operationsMap } from '../operations'

export const RECIPE_QUERY_PARAM = 'recipe'
export const RECIPE_SERIALIZER_VERSION = 1 as const

export interface SerializedRecipePayload {
  v: typeof RECIPE_SERIALIZER_VERSION
  steps: RecipeStep[]
}

export function recipeToPayload(recipe: Recipe): SerializedRecipePayload {
  return {
    v: RECIPE_SERIALIZER_VERSION,
    steps: recipe.map((step) => ({
      operationId: step.operationId,
      params: { ...step.params },
    })),
  }
}

export function recipeToJson(recipe: Recipe, pretty = false): string {
  return JSON.stringify(recipeToPayload(recipe), null, pretty ? 2 : 0)
}

export function recipeFromJson(
  json: string,
): { recipe: Recipe | null; error?: string } {
  if (!json.trim()) {
    return { recipe: null, error: 'Empty recipe JSON' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { recipe: null, error: 'Invalid JSON' }
  }

  return validateSerializedRecipe(parsed)
}

/** URL-safe Base64 of the JSON payload (no input data). */
export function recipeToQueryValue(recipe: Recipe): string {
  const json = recipeToJson(recipe)
  return Base64.encodeURI(json)
}

export function recipeFromQueryValue(
  value: string,
): { recipe: Recipe | null; error?: string } {
  if (!value.trim()) {
    return { recipe: null, error: 'Empty recipe parameter' }
  }
  try {
    const json = Base64.decode(value)
    return recipeFromJson(json)
  } catch {
    return { recipe: null, error: 'Invalid recipe encoding in URL' }
  }
}

export function buildShareUrl(recipe: Recipe, baseUrl?: string): string {
  const origin =
    baseUrl ??
    (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '')
  const url = new URL(origin || 'http://localhost/')
  url.searchParams.set(RECIPE_QUERY_PARAM, recipeToQueryValue(recipe))
  return url.toString()
}

export function parseRecipeFromLocationSearch(
  search: string,
): { recipe: Recipe | null; error?: string } {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  )
  const value = params.get(RECIPE_QUERY_PARAM)
  if (!value) {
    return { recipe: null }
  }
  return recipeFromQueryValue(value)
}

function validateSerializedRecipe(
  parsed: unknown,
): { recipe: Recipe | null; error?: string } {
  if (!parsed || typeof parsed !== 'object') {
    return { recipe: null, error: 'Recipe payload must be an object' }
  }

  const obj = parsed as { v?: number; steps?: unknown }
  if (obj.v !== RECIPE_SERIALIZER_VERSION) {
    return { recipe: null, error: 'Unsupported recipe version' }
  }
  if (!Array.isArray(obj.steps)) {
    return { recipe: null, error: 'Recipe steps must be an array' }
  }

  const recipe: Recipe = []
  for (const step of obj.steps) {
    if (!step || typeof step !== 'object') {
      return { recipe: null, error: 'Invalid recipe step' }
    }
    const s = step as { operationId?: unknown; params?: unknown }
    if (typeof s.operationId !== 'string' || !operationsMap.has(s.operationId)) {
      return { recipe: null, error: `Unknown operation: ${String(s.operationId)}` }
    }
    if (s.params !== undefined && (typeof s.params !== 'object' || s.params === null)) {
      return { recipe: null, error: 'Step params must be an object' }
    }
    recipe.push({
      operationId: s.operationId,
      params: (s.params as RecipeStep['params']) ?? {},
    })
  }

  return { recipe }
}
