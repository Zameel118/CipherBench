import { describe, expect, it } from 'vitest'
import { base64Decode, base64Encode } from '../../../src/operations/encoding/base64'
import { Base64 } from 'js-base64'

describe('base64-decode parity options', () => {
  it('removes non-alphabet chars by default', () => {
    const encoded = Base64.encode('hello')
    const noisy = encoded.slice(0, 4) + '!' + encoded.slice(4)
    const result = base64Decode.run(
      { data: noisy, type: 'string' },
      { alphabet: 'standard', removeNonAlphabet: true, strictMode: false },
    )
    expect(result.error).toBeUndefined()
    expect(result.data).toBe('hello')
  })

  it('errors on non-alphabet when removeNonAlphabet is false', () => {
    const result = base64Decode.run(
      { data: 'aGVsbG8!h', type: 'string' },
      { alphabet: 'standard', removeNonAlphabet: false, strictMode: false },
    )
    expect(result.error).toBeDefined()
  })

  it('strict mode rejects unpadded length', () => {
    // "hel" -> aGVs (needs padding to multiple of 4 if we strip =)
    const result = base64Decode.run(
      { data: 'aGVs', type: 'string' },
      { alphabet: 'standard', removeNonAlphabet: true, strictMode: true },
    )
    // aGVs is already length 4 — use incomplete
    const result2 = base64Decode.run(
      { data: 'aGV', type: 'string' },
      { alphabet: 'standard', removeNonAlphabet: true, strictMode: true },
    )
    expect(result2.error).toMatch(/strict/i)
    expect(result.error).toBeUndefined()
  })

  it('preserves binary for XOR chain with letter O', () => {
    const input = 'jbe+q/6+m3+ru/K/uj/rqHO4vyv5nv/r8zv66j+rG/65uru9'
    const reversed = [...input].reverse().join('')
    const decoded = base64Decode.run(
      { data: reversed, type: 'string' },
      { alphabet: 'standard', removeNonAlphabet: true, strictMode: false },
    )
    const xored = [...decoded.data]
      .map((ch) => String.fromCharCode(ch.charCodeAt(0) ^ 0x8f))
      .join('')
    expect(xored).toBe('yeah I guess this one was a bit evil')
  })

  it('round-trips unicode via encode/decode', () => {
    const text = 'フラグ{test}'
    const enc = base64Encode.run({ data: text, type: 'string' }, { alphabet: 'standard' })
    const dec = base64Decode.run(
      { data: enc.data, type: 'string' },
      { alphabet: 'standard', removeNonAlphabet: true, strictMode: false },
    )
    expect(dec.data).toBe(text)
  })
})
