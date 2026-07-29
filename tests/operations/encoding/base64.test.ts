import { describe, expect, it } from 'vitest'
import { Base64 } from 'js-base64'
import { base64Decode } from '../../../src/operations/encoding/base64'

describe('base64-decode', () => {
  it('decodes a standard Base64 string', () => {
    const encoded = Base64.encode('Hello, CipherBench!')
    const result = base64Decode.run(
      { data: encoded, type: 'string' },
      { alphabet: 'standard' },
    )
    expect(result.error).toBeUndefined()
    expect(result.data).toBe('Hello, CipherBench!')
  })

  it('returns empty string for empty input', () => {
    const result = base64Decode.run(
      { data: '', type: 'string' },
      { alphabet: 'standard' },
    )
    expect(result.error).toBeUndefined()
    expect(result.data).toBe('')
  })

  it('returns an error for malformed Base64', () => {
    const result = base64Decode.run(
      { data: '!!!not-base64!!!', type: 'string' },
      { alphabet: 'standard' },
    )
    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/Invalid Base64/i)
  })

  it('decodes unicode content', () => {
    const text = 'フラグ{こんにちは} 🔐'
    const encoded = Base64.encode(text)
    const result = base64Decode.run(
      { data: encoded, type: 'string' },
      { alphabet: 'standard' },
    )
    expect(result.error).toBeUndefined()
    expect(result.data).toBe(text)
  })

  it('decodes URL-safe Base64 when alphabet is url-safe', () => {
    const original = 'subjects??>>'
    // encodeURI produces the URL-safe alphabet (-_ instead of +/) without padding.
    const urlSafe = Base64.encodeURI(original)
    expect(urlSafe).toMatch(/[-_]/) // sanity: fixture must exercise URL-safe chars
    const result = base64Decode.run(
      { data: urlSafe, type: 'string' },
      { alphabet: 'url-safe' },
    )
    expect(result.error).toBeUndefined()
    expect(result.data).toBe(original)
  })

  it('scores high confidence on plausible Base64', () => {
    const score = base64Decode.detectConfidence?.(Base64.encode('flag{test}'))
    expect(score).toBeGreaterThan(0.5)
  })

  it('scores zero on clearly non-Base64 text', () => {
    const score = base64Decode.detectConfidence?.('hello world!!!')
    expect(score).toBe(0)
  })
})
