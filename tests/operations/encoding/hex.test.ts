import { describe, expect, it } from 'vitest'
import { hexDecode, hexEncode } from '../../../src/operations/encoding/hex'

describe('hex encode/decode', () => {
  it('round-trips ASCII', () => {
    const enc = hexEncode.run({ data: 'ABC', type: 'string' }, { delimiter: 'none' })
    const dec = hexDecode.run({ data: enc.data, type: 'string' }, {})
    expect(dec.error).toBeUndefined()
    expect(dec.data).toBe('ABC')
  })

  it('handles empty input', () => {
    expect(hexEncode.run({ data: '', type: 'string' }, {}).data).toBe('')
    expect(hexDecode.run({ data: '', type: 'string' }, {}).data).toBe('')
  })

  it('rejects malformed hex', () => {
    const result = hexDecode.run({ data: 'gg', type: 'string' }, {})
    expect(result.error).toMatch(/Invalid hex/i)
  })

  it('rejects odd-length hex', () => {
    const result = hexDecode.run({ data: 'abc', type: 'string' }, {})
    expect(result.error).toMatch(/odd/i)
  })

  it('decodes unicode utf-8 bytes', () => {
    const hex = 'e3 81 93 e3 82 93'
    const result = hexDecode.run({ data: hex, type: 'string' }, {})
    expect(result.error).toBeUndefined()
    expect(result.data).toBe('こん')
  })
})
