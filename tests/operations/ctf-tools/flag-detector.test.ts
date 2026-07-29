import { describe, expect, it } from 'vitest'
import { Base64 } from 'js-base64'
import { flagDetector } from '../../../src/operations/ctf-tools/flag-detector'

describe('flag-detector operation', () => {
  it('lists flags in input', () => {
    const result = flagDetector.run(
      { data: 'x FLAG{test} y', type: 'string' },
      {},
    )
    expect(result.data).toContain('FLAG{test}')
  })

  it('handles empty input', () => {
    const result = flagDetector.run({ data: '', type: 'string' }, {})
    expect(result.data).toContain('no flags')
  })

  it('returns error for invalid pattern', () => {
    const result = flagDetector.run(
      { data: Base64.encode('x'), type: 'string' },
      { pattern: '[' },
    )
    expect(result.error).toBeDefined()
  })
})
