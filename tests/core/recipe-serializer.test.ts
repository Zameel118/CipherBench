import { describe, expect, it } from 'vitest'
import {
  recipeFromJson,
  recipeFromQueryValue,
  recipeToJson,
  recipeToQueryValue,
} from '../../src/core/recipe-serializer'
import type { Recipe } from '../../src/core/types'

const sample: Recipe = [
  {
    operationId: 'base64-decode',
    params: { alphabet: 'standard' },
  },
  {
    operationId: 'xor-cipher',
    params: { mode: 'single-byte', key: '0x41', bruteForceSingleByte: false },
  },
]

describe('recipe-serializer', () => {
  it('round-trips JSON without input data', () => {
    const json = recipeToJson(sample, true)
    expect(json).not.toContain('input')
    const { recipe, error } = recipeFromJson(json)
    expect(error).toBeUndefined()
    expect(recipe).toEqual(sample)
  })

  it('round-trips URL query value', () => {
    const q = recipeToQueryValue(sample)
    const { recipe, error } = recipeFromQueryValue(q)
    expect(error).toBeUndefined()
    expect(recipe).toEqual(sample)
  })

  it('rejects unknown operations', () => {
    const { error } = recipeFromJson(
      JSON.stringify({ v: 1, steps: [{ operationId: 'nope', params: {} }] }),
    )
    expect(error).toMatch(/Unknown operation/)
  })

  it('rejects invalid JSON', () => {
    const { error } = recipeFromJson('{')
    expect(error).toMatch(/Invalid JSON/)
  })

  it('rejects unsupported version', () => {
    const { error } = recipeFromJson(
      JSON.stringify({ v: 99, steps: [] }),
    )
    expect(error).toMatch(/version/)
  })
})
