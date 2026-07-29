import type {
  Operation,
  OperationInput,
  OperationOutput,
  Recipe,
} from './types'

export interface RecipeRunResult {
  /** Final output after the last successful step (or empty if nothing ran). */
  output: OperationOutput
  /** Per-step outputs, aligned with recipe indices. Failed steps stop the chain. */
  steps: OperationOutput[]
  /** True if every step completed without an error field. */
  success: boolean
}

/**
 * Pure recipe runner - no React, no DOM, no store.
 * Pipes each step's output into the next step's input.
 * Stops on the first step that returns an `error` (or if an operation id is unknown).
 */
export function runRecipe(
  input: string,
  recipe: Recipe,
  operations: Map<string, Operation> | Record<string, Operation>,
): RecipeRunResult {
  const lookup =
    operations instanceof Map
      ? operations
      : new Map(Object.entries(operations))

  const steps: OperationOutput[] = []
  let current: OperationInput = { data: input, type: 'string' }

  if (recipe.length === 0) {
    return {
      output: { data: input, type: 'string' },
      steps,
      success: true,
    }
  }

  for (const step of recipe) {
    const op = lookup.get(step.operationId)
    if (!op) {
      const missing: OperationOutput = {
        data: current.data,
        type: current.type,
        error: `Unknown operation: ${step.operationId}`,
      }
      steps.push(missing)
      return { output: missing, steps, success: false }
    }

    // Merge defaults so callers can omit params they don't care about.
    const mergedParams: Record<string, string | number | boolean> = {}
    for (const p of op.params) {
      mergedParams[p.name] =
        step.params[p.name] !== undefined ? step.params[p.name] : p.default
    }
    for (const [key, value] of Object.entries(step.params)) {
      if (!(key in mergedParams)) {
        mergedParams[key] = value
      }
    }

    let result: OperationOutput
    try {
      result = op.run(current, mergedParams)
    } catch (err) {
      // Operations must not throw, but guard anyway so one bad op can't crash the chain.
      result = {
        data: current.data,
        type: current.type,
        error: err instanceof Error ? err.message : String(err),
      }
    }

    steps.push(result)

    if (result.error) {
      return { output: result, steps, success: false }
    }

    current = { data: result.data, type: result.type }
  }

  return {
    output: steps[steps.length - 1]!,
    steps,
    success: true,
  }
}
