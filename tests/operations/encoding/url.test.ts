import { describe, expect, it } from 'vitest'
import { urlDecode, urlEncode } from '../../../src/operations/encoding/url'

describe('url encode/decode', () => {
  it('round-trips', () => {
    const enc = urlEncode.run({ data: 'a b&c=1', type: 'string' }, {})
    const dec = urlDecode.run({ data: enc.data, type: 'string' }, {})
    expect(dec.data).toBe('a b&c=1')
  })

  it('handles empty input', () => {
    expect(urlEncode.run({ data: '', type: 'string' }, {}).data).toBe('')
    expect(urlDecode.run({ data: '', type: 'string' }, {}).data).toBe('')
  })

  it('returns error for malformed percent encoding', () => {
    const result = urlDecode.run({ data: '%E0%A4%A', type: 'string' }, {})
    expect(result.error).toBeDefined()
  })

  it('decodes unicode', () => {
    const enc = urlEncode.run({ data: '🔥', type: 'string' }, {})
    const dec = urlDecode.run({ data: enc.data, type: 'string' }, {})
    expect(dec.data).toBe('🔥')
  })
})
