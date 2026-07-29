import { describe, expect, it } from 'vitest'
import { Base64 } from 'js-base64'
import { runRecipe } from '../../src/core/recipe-engine'
import type { Operation } from '../../src/core/types'
import { operationsMap } from '../../src/operations'
import { base64Decode } from '../../src/operations/encoding/base64'

/** Tiny mock ops used only to prove the engine pipes step N → step N+1. */
const suffixA: Operation = {
  id: 'suffix-a',
  name: 'Suffix A',
  category: 'Encoding',
  description: 'Appends "-A"',
  params: [],
  run: (input) => ({ data: `${input.data}-A`, type: 'string' }),
}

const suffixB: Operation = {
  id: 'suffix-b',
  name: 'Suffix B',
  category: 'Encoding',
  description: 'Appends "-B"',
  params: [],
  run: (input) => ({ data: `${input.data}-B`, type: 'string' }),
}

describe('runRecipe', () => {
  it('returns input unchanged for an empty recipe', () => {
    const result = runRecipe('plain', [], operationsMap)
    expect(result.success).toBe(true)
    expect(result.output.data).toBe('plain')
    expect(result.steps).toHaveLength(0)
  })

  it('chains two operations: output of step 1 becomes input of step 2', () => {
    const ops = new Map<string, Operation>([
      ['suffix-a', suffixA],
      ['suffix-b', suffixB],
    ])

    const result = runRecipe(
      'start',
      [
        { operationId: 'suffix-a', params: {} },
        { operationId: 'suffix-b', params: {} },
      ],
      ops,
    )

    expect(result.success).toBe(true)
    expect(result.steps.map((s) => s.data)).toEqual(['start-A', 'start-A-B'])
    expect(result.output.data).toBe('start-A-B')
  })

  it('runs a registered Base64 decode as a single-step recipe', () => {
    const encoded = Base64.encode('chained-ok')
    const result = runRecipe(
      encoded,
      [{ operationId: 'base64-decode', params: { alphabet: 'standard' } }],
      operationsMap,
    )
    expect(result.success).toBe(true)
    expect(result.output.data).toBe('chained-ok')
  })

  it('stops on the first error and does not run later steps', () => {
    const failing: Operation = {
      id: 'fail',
      name: 'Fail',
      category: 'Encoding',
      description: 'Always errors',
      params: [],
      run: () => ({ data: '', type: 'string', error: 'boom' }),
    }
    const ops = new Map<string, Operation>([
      ['fail', failing],
      ['suffix-a', suffixA],
    ])

    const result = runRecipe(
      'x',
      [
        { operationId: 'fail', params: {} },
        { operationId: 'suffix-a', params: {} },
      ],
      ops,
    )

    expect(result.success).toBe(false)
    expect(result.steps).toHaveLength(1)
    expect(result.output.error).toBe('boom')
  })

  it('reports unknown operation ids without throwing', () => {
    const result = runRecipe(
      'data',
      [{ operationId: 'does-not-exist', params: {} }],
      operationsMap,
    )
    expect(result.success).toBe(false)
    expect(result.output.error).toMatch(/Unknown operation/)
  })

  it('exposes the registered base64-decode operation', () => {
    expect(operationsMap.get('base64-decode')).toBe(base64Decode)
  })
})
