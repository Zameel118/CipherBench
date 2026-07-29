import { create } from 'zustand'
import { DEFAULT_FLAG_PATTERN } from '../core/flag-pattern'
import { parseRecipeFromLocationSearch } from '../core/recipe-serializer'
import { runRecipe } from '../core/recipe-engine'
import type { Recipe, RecipeStep } from '../core/types'
import { operationsMap } from '../operations'

export interface RecipeStepInstance extends RecipeStep {
  /** Stable id for React keys and drag-and-drop. */
  instanceId: string
}

export interface AppState {
  input: string
  recipe: RecipeStepInstance[]
  outputText: string
  outputError: string | undefined
  operationSearch: string
  flagPattern: string
  flagPatternError: string | undefined
  setInput: (value: string) => void
  setOperationSearch: (value: string) => void
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
  loadRecipe: (recipe: Recipe) => void
  hydrateRecipeFromUrl: () => void
  runCurrentRecipe: () => void
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

export const useAppStore = create<AppState>((set, get) => ({
  input: '',
  recipe: [],
  outputText: '',
  outputError: undefined,
  operationSearch: '',
  flagPattern: DEFAULT_FLAG_PATTERN,
  flagPatternError: undefined,

  setInput: (value) => set({ input: value }),

  setOperationSearch: (value) => set({ operationSearch: value }),

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
    set({ recipe: [], outputText: '', outputError: undefined })
    get().runCurrentRecipe()
  },

  resetInput: () => {
    set({ input: '', outputText: '', outputError: undefined })
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
    const result = runRecipe(input, recipeToSteps(recipe), operationsMap)
    set({
      outputText: result.output.data,
      outputError: result.output.error,
    })
  },
}))
