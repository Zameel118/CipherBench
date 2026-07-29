export type OperationCategory =
  | 'Encoding'
  | 'Encryption'
  | 'Hashing'
  | 'CTF Tools'
  | 'SOC Tools'
  | 'Data Format'
  | 'Extractors'

export interface OperationParam {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select'
  default: string | number | boolean
  options?: string[] // for "select" type
}

export interface OperationInput {
  data: string
  type: 'string' | 'bytes'
}

export interface OperationOutput {
  data: string
  type: 'string' | 'bytes'
  error?: string
}

export interface Operation {
  id: string // unique, kebab-case, e.g. "base64-decode"
  name: string // display name, e.g. "From Base64"
  category: OperationCategory
  description: string
  params: OperationParam[]
  run: (input: OperationInput, params: Record<string, string | number | boolean>) => OperationOutput
  detectable?: boolean
  detectConfidence?: (input: string) => number // 0-1 heuristic, used by Magic auto-detect
}

/** A single step in a recipe: which operation to run and with what params. */
export interface RecipeStep {
  operationId: string
  params: Record<string, string | number | boolean>
}

export type Recipe = RecipeStep[]
