import { describe, expect, it } from 'vitest'
import { suggestMagicChains } from '../../src/core/magic-chains'
import { buildCaseReportMarkdown } from '../../src/core/case-report'

describe('magic chains', () => {
  it('suggests base64 chain for padded alphabet', () => {
    const chains = suggestMagicChains('RkxBR3t0ZXN0fQ==', 6)
    expect(chains.some((c) => c.recipe.some((s) => s.operationId === 'base64-decode'))).toBe(
      true,
    )
  })

  it('suggests JWT decode for three-part token', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature'
    const chains = suggestMagicChains(jwt, 6)
    expect(chains.some((c) => c.id === 'jwt-decode')).toBe(true)
  })
})

describe('case report', () => {
  it('builds markdown with recipe and io', () => {
    const md = buildCaseReportMarkdown({
      input: 'in',
      output: 'out',
      recipe: [{ operationId: 'base64-decode', params: {} }],
      flagPattern: 'FLAG\\{.*?\\}',
      lastRunMs: 12,
      forkSnapshot: 'old',
    })
    expect(md).toContain('# CipherBench Case Report')
    expect(md).toContain('base64-decode')
    expect(md).toContain('## Fork snapshot')
  })
})
