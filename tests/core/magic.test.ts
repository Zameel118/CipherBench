import { describe, expect, it } from 'vitest'
import { Base64 } from 'js-base64'
import { suggestOperations } from '../../src/core/magic'
import { base64Decode } from '../../src/operations/encoding/base64'
import { hexDecode } from '../../src/operations/encoding/hex'

describe('magic suggestOperations', () => {
  it('suggests base64 decode for base64-shaped input', () => {
    const input = Base64.encode('hello world')
    const suggestions = suggestOperations(input, 3, [base64Decode, hexDecode])
    expect(suggestions[0]?.operationId).toBe('base64-decode')
    expect(suggestions[0]!.score).toBeGreaterThan(0.5)
  })

  it('returns at most limit suggestions', () => {
    const input = '48656c6c6f'
    const suggestions = suggestOperations(input, 2, [base64Decode, hexDecode])
    expect(suggestions.length).toBeLessThanOrEqual(2)
  })

  it('returns empty for blank input', () => {
    expect(suggestOperations('   ', 3, [base64Decode])).toEqual([])
  })
})
