import { create } from 'zustand'
import { DEFAULT_FLAG_PATTERN } from '../core/flag-pattern'
import { parseRecipeFromLocationSearch } from '../core/recipe-serializer'
import { runRecipe } from '../core/recipe-engine'
import {
  applyThemeToDocument,
  loadStoredTheme,
  THEME_STORAGE_KEY,
  type ThemeId,
} from '../core/themes'
import type { Recipe, RecipeStep } from '../core/types'
import { operationsMap } from '../operations'

export interface RecipeStepInstance extends RecipeStep {
  /** Stable id for React keys and drag-and-drop. */
  instanceId: string
}

export interface RecipeHistoryEntry {
  id: string
  label: string
  recipe: Recipe
  savedAt: number
}

export interface AppState {
  input: string
  recipe: RecipeStepInstance[]
  outputText: string
  outputError: string | undefined
  lastRunMs: number | null
  operationSearch: string
  theme: ThemeId
  autoRun: boolean
  flagPattern: string
  flagPatternError: string | undefined
  recipeHistory: RecipeHistoryEntry[]
  setInput: (value: string) => void
  setOperationSearch: (value: string) => void
  setTheme: (theme: ThemeId) => void
  setAutoRun: (value: boolean) => void
  setFlagPattern: (pattern: string) => void
  addOperationToRecipe: (operationId: string) => void
  removeRecipeStep: (instanceId: string) => void
  updateStepParams: (
    instanceId: string,
    params: Record<string, string | number | boolean>,
  ) => void
  reorderRecipe: (fromIndex: number, toIndex: number) => void
  clearRecipe: () => void
  resetInput: () => void
  swapInputOutput: () => void
  loadRecipe: (recipe: Recipe) => void
  hydrateRecipeFromUrl: () => void
  runCurrentRecipe: () => void
  saveRecipeToHistory: () => void
  loadHistoryEntry: (id: string) => void
}

const HISTORY_KEY = 'cipherbench_recipe_history'

function loadHistory(): RecipeHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecipeHistoryEntry[]
    return Array.isArray(parsed) ? parsed.slice(0, 8) : []
  } catch {
    return []
  }
}

function persistHistory(entries: RecipeHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 8)))
  } catch {
    // ignore
  }
}

function defaultParamsForOperation(
  operationId: string,
): Record<string, string | number | boolean> {
  const op = operationsMap.get(operationId)
  if (!op) return {}
  const params: Record<string, string | number | boolean> = {}
  for (const p of op.params) {
    params[p.name] = p.default
  }
  return params
}

function recipeToSteps(recipe: RecipeStepInstance[]): Recipe {
  return recipe.map(({ operationId, params }) => ({ operationId, params }))
}

function newInstanceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function recipeToInstances(recipe: Recipe): RecipeStepInstance[] {
  return recipe.map((step) => ({
    instanceId: newInstanceId(),
    operationId: step.operationId,
    params: { ...defaultParamsForOperation(step.operationId), ...step.params },
  }))
}

function historyLabel(recipe: Recipe): string {
  if (recipe.length === 0) return 'empty recipe'
  return recipe
    .map((s) => operationsMap.get(s.operationId)?.name ?? s.operationId)
    .slice(0, 3)
    .join(' → ')
}

export const useAppStore = create<AppState>((set, get) => ({
  input: '',
  recipe: [],
  outputText: '',
  outputError: undefined,
  lastRunMs: null,
  operationSearch: '',
  theme: loadStoredTheme(),
  autoRun: true,
  flagPattern: DEFAULT_FLAG_PATTERN,
  flagPatternError: undefined,
  recipeHistory: loadHistory(),

  setInput: (value) => set({ input: value }),

  setOperationSearch: (value) => set({ operationSearch: value }),

  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // ignore
    }
    set({ theme })
    applyThemeToDocument(theme)
  },

  setAutoRun: (value) => set({ autoRun: value }),

  setFlagPattern: (pattern) => {
    set({ flagPattern: pattern, flagPatternError: undefined })
  },

  addOperationToRecipe: (operationId) => {
    if (!operationsMap.has(operationId)) return
    const step: RecipeStepInstance = {
      instanceId: newInstanceId(),
      operationId,
      params: defaultParamsForOperation(operationId),
    }
    set((state) => ({ recipe: [...state.recipe, step] }))
    get().runCurrentRecipe()
  },

  removeRecipeStep: (instanceId) => {
    set((state) => ({
      recipe: state.recipe.filter((s) => s.instanceId !== instanceId),
    }))
    get().runCurrentRecipe()
  },

  updateStepParams: (instanceId, params) => {
    set((state) => ({
      recipe: state.recipe.map((s) =>
        s.instanceId === instanceId
          ? { ...s, params: { ...s.params, ...params } }
          : s,
      ),
    }))
    get().runCurrentRecipe()
  },

  reorderRecipe: (fromIndex, toIndex) => {
    set((state) => {
      const next = [...state.recipe]
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= next.length ||
        toIndex >= next.length
      ) {
        return state
      }
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved!)
      return { recipe: next }
    })
    get().runCurrentRecipe()
  },

  clearRecipe: () => {
    set({ recipe: [], outputText: '', outputError: undefined, lastRunMs: null })
    get().runCurrentRecipe()
  },

  resetInput: () => {
    set({ input: '', outputText: '', outputError: undefined, lastRunMs: null })
    get().runCurrentRecipe()
  },

  swapInputOutput: () => {
    const { input, outputText, recipe } = get()
    const display = recipe.length === 0 ? input : outputText
    set({ input: display })
    get().runCurrentRecipe()
  },

  loadRecipe: (recipe) => {
    set({ recipe: recipeToInstances(recipe) })
    get().runCurrentRecipe()
  },

  hydrateRecipeFromUrl: () => {
    if (typeof window === 'undefined') return
    const { recipe } = parseRecipeFromLocationSearch(window.location.search)
    if (recipe) {
      get().loadRecipe(recipe)
    }
  },

  runCurrentRecipe: () => {
    const { input, recipe } = get()
    const started = performance.now()
    const result = runRecipe(input, recipeToSteps(recipe), operationsMap)
    set({
      outputText: result.output.data,
      outputError: result.output.error,
      lastRunMs: Math.max(0, Math.round(performance.now() - started)),
    })
  },

  saveRecipeToHistory: () => {
    const { recipe } = get()
    if (recipe.length === 0) return
    const entry: RecipeHistoryEntry = {
      id: newInstanceId(),
      label: historyLabel(recipeToSteps(recipe)),
      recipe: recipeToSteps(recipe),
      savedAt: Date.now(),
    }
    const next = [entry, ...get().recipeHistory.filter((h) => h.label !== entry.label)].slice(
      0,
      8,
    )
    persistHistory(next)
    set({ recipeHistory: next })
  },

  loadHistoryEntry: (id) => {
    const entry = get().recipeHistory.find((h) => h.id === id)
    if (!entry) return
    get().loadRecipe(entry.recipe)
  },
}))
