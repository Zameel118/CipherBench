import { describe, expect, it } from 'vitest'
import { printableRatio, xorCipher } from '../../../src/operations/encryption/xor'

describe('xor-cipher', () => {
  it('single-byte XOR round-trip', () => {
    const plain = 'hello'
    const enc = xorCipher.run(
      { data: plain, type: 'string' },
      {
        mode: 'single-byte',
        keyFormat: 'hex',
        key: '05',
        nullPreserving: false,
        bruteForceSingleByte: false,
      },
    )
    const dec = xorCipher.run(
      { data: enc.data, type: 'string' },
      {
        mode: 'single-byte',
        keyFormat: 'hex',
        key: '05',
        nullPreserving: false,
        bruteForceSingleByte: false,
      },
    )
    expect(dec.data).toBe(plain)
  })

  it('handles empty input', () => {
    expect(
      xorCipher.run(
        { data: '', type: 'string' },
        { bruteForceSingleByte: false, keyFormat: 'hex', key: '41' },
      ).data,
    ).toBe('')
  })

  it('returns error for invalid key', () => {
    const result = xorCipher.run(
      { data: 'x', type: 'string' },
      {
        mode: 'single-byte',
        keyFormat: 'hex',
        key: 'not-a-key',
        bruteForceSingleByte: false,
      },
    )
    expect(result.error).toBeDefined()
  })

  it('repeating-key XOR', () => {
    const result = xorCipher.run(
      { data: 'abcd', type: 'string' },
      {
        mode: 'repeating-key',
        keyFormat: 'utf8',
        key: 'key',
        nullPreserving: false,
        bruteForceSingleByte: false,
      },
    )
    expect(result.error).toBeUndefined()
    expect(result.data.length).toBe(4)
  })

  it('brute force ranks printable plaintext highly', () => {
    const key = 0x42
    const plain = 'FLAG{easy_xor_test}'
    const cipher = xorCipher.run(
      { data: plain, type: 'string' },
      {
        mode: 'single-byte',
        keyFormat: 'hex',
        key: key.toString(16),
        nullPreserving: false,
        bruteForceSingleByte: false,
      },
    )
    const brute = xorCipher.run(
      { data: cipher.data, type: 'string' },
      { bruteForceSingleByte: true },
    )
    const matchLine = brute.data
      .split('\n')
      .find((line) => line.includes('0x42') && line.includes('FLAG{easy_xor_test}'))
    expect(matchLine).toBeDefined()
  })

  it('printableRatio helper', () => {
    expect(printableRatio('ABC')).toBe(1)
    expect(printableRatio('\x00\x01')).toBe(0)
  })
})
