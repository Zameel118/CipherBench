import { describe, expect, it } from 'vitest'
import { Base64 } from 'js-base64'
import { base64Decode, base64Encode } from '../../../src/operations/encoding/base64'

const run = (data: string, params: Record<string, string | number | boolean> = {}) =>
  base64Decode.run({ data, type: 'string' }, params)

describe('base64-decode', () => {
  it('decodes a standard Base64 string', () => {
    const encoded = Base64.encode('Hello, CipherBench!')
    const result = run(encoded, { alphabet: 'standard' })
    expect(result.error).toBeUndefined()
    expect(result.data).toBe('Hello, CipherBench!')
  })

  it('returns empty string for empty input', () => {
    const result = run('')
    expect(result.error).toBeUndefined()
    expect(result.data).toBe('')
  })

  it('returns an error for malformed Base64', () => {
    const result = run('!!!not-base64!!!')
    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/Invalid Base64/i)
  })

  it('decodes unicode content', () => {
    const text = 'フラグ{こんにちは} 🔐'
    const encoded = Base64.encode(text)
    const result = run(encoded)
    expect(result.error).toBeUndefined()
    expect(result.data).toBe(text)
  })

  it('decodes URL-safe Base64 when alphabet is url-safe', () => {
    const original = 'subjects??>>'
    const urlSafe = Base64.encodeURI(original)
    const result = run(urlSafe, { alphabet: 'url-safe' })
    expect(result.error).toBeUndefined()
    expect(result.data).toBe(original)
  })

  it('preserves binary bytes for XOR chains (CyberChef-compatible)', () => {
    // Letter O (not zero): Reverse → From Base64 → XOR 0x8F
    const input = 'jbe+q/6+m3+ru/K/uj/rqHO4vyv5nv/r8zv66j+rG/65uru9'
    const reversed = [...input].reverse().join('')
    const decoded = run(reversed)
    expect(decoded.error).toBeUndefined()
    const xored = [...decoded.data]
      .map((ch) => String.fromCharCode(ch.charCodeAt(0) ^ 0x8f))
      .join('')
    expect(xored).toBe('yeah I guess this one was a bit evil')
  })
})

describe('base64-encode', () => {
  it('encodes text to standard Base64', () => {
    const result = base64Encode.run(
      { data: 'test', type: 'string' },
      { alphabet: 'standard' },
    )
    expect(result.error).toBeUndefined()
    expect(result.data).toBe(Base64.encode('test'))
  })

  it('returns empty for empty input', () => {
    const result = base64Encode.run({ data: '', type: 'string' }, {})
    expect(result.data).toBe('')
  })

  it('encodes unicode', () => {
    const text = 'café ☕'
    const result = base64Encode.run({ data: text, type: 'string' }, {})
    expect(result.error).toBeUndefined()
    expect(run(result.data).data).toBe(text)
  })
})
