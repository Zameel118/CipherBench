import { describe, expect, it } from 'vitest'
import { base64Decode } from '../../src/operations/encoding/base64'
import { fromCharcode, toCharcode } from '../../src/operations/encoding/charcode'
import { fromMorse, toMorse } from '../../src/operations/encoding/morse'
import { reverseString } from '../../src/operations/encoding/text-transform'
import { entropyAnalysis } from '../../src/operations/data-format/entropy'
import { vigenereCipher } from '../../src/operations/encryption/vigenere'
import { parseXorKeyBytes, xorCipher } from '../../src/operations/encryption/xor'

describe('reverse by modes', () => {
  it('reverses by character (unicode)', () => {
    expect(
      reverseString.run({ data: 'ab🔥cd', type: 'string' }, { by: 'character' }).data,
    ).toBe('dc🔥ba')
  })

  it('reverses by line', () => {
    expect(
      reverseString.run({ data: 'a\nb\nc', type: 'string' }, { by: 'line' }).data,
    ).toBe('c\nb\na')
  })

  it('reverses by byte', () => {
    expect(
      reverseString.run({ data: 'ABC', type: 'string' }, { by: 'byte' }).data,
    ).toBe('CBA')
  })
})

describe('XOR key formats + null preserving', () => {
  it('parses hex key 8F', () => {
    expect(parseXorKeyBytes('8F', 'hex')).toEqual([0x8f])
    expect(parseXorKeyBytes('0x8F', 'hex')).toEqual([0x8f])
  })

  it('utf8 key bytes', () => {
    expect(parseXorKeyBytes('AB', 'utf8')).toEqual([65, 66])
  })

  it('null preserving skips xor when either is 0', () => {
    const input = String.fromCharCode(0, 0x41, 0)
    const result = xorCipher.run(
      { data: input, type: 'string' },
      {
        mode: 'single-byte',
        keyFormat: 'hex',
        key: 'FF',
        nullPreserving: true,
        bruteForceSingleByte: false,
      },
    )
    expect(result.data.charCodeAt(0)).toBe(0)
    expect(result.data.charCodeAt(1)).toBe(0x41 ^ 0xff)
    expect(result.data.charCodeAt(2)).toBe(0)
  })

  it('hex key XOR matches CyberChef sample', () => {
    const input = 'jbe+q/6+m3+ru/K/uj/rqHO4vyv5nv/r8zv66j+rG/65uru9'
    const reversed = reverseString.run(
      { data: input, type: 'string' },
      { by: 'character' },
    ).data
    const decoded = base64Decode.run(
      { data: reversed, type: 'string' },
      { alphabet: 'standard', removeNonAlphabet: true, strictMode: false },
    )
    const out = xorCipher.run(
      { data: decoded.data, type: 'string' },
      {
        mode: 'single-byte',
        keyFormat: 'hex',
        key: '8F',
        nullPreserving: false,
        bruteForceSingleByte: false,
      },
    )
    expect(out.data).toBe('yeah I guess this one was a bit evil')
  })
})

describe('charcode', () => {
  it('round-trips decimal', () => {
    const enc = toCharcode.run(
      { data: 'ABC', type: 'string' },
      { base: 'decimal', delimiter: 'space' },
    )
    expect(enc.data).toBe('65 66 67')
    const dec = fromCharcode.run({ data: enc.data, type: 'string' }, { base: 'decimal' })
    expect(dec.data).toBe('ABC')
  })

  it('decodes 0x hex form', () => {
    const dec = fromCharcode.run(
      { data: '0x48 0x69', type: 'string' },
      { base: 'hex' },
    )
    expect(dec.data).toBe('Hi')
  })
})

describe('morse', () => {
  it('round-trips SOS', () => {
    const enc = toMorse.run({ data: 'SOS', type: 'string' }, { dotDash: '.-' })
    expect(enc.data).toBe('... --- ...')
    const dec = fromMorse.run({ data: enc.data, type: 'string' }, {})
    expect(dec.data).toBe('SOS')
  })

  it('decodes word gaps', () => {
    const enc = toMorse.run({ data: 'HI YOU', type: 'string' }, { dotDash: '.-' })
    const dec = fromMorse.run({ data: enc.data, type: 'string' }, {})
    expect(dec.data).toBe('HI YOU')
  })
})

describe('vigenere', () => {
  it('round-trips', () => {
    const enc = vigenereCipher.run(
      { data: 'AttackAtDawn', type: 'string' },
      { direction: 'encrypt', key: 'LEMON' },
    )
    const dec = vigenereCipher.run(
      { data: enc.data, type: 'string' },
      { direction: 'decrypt', key: 'LEMON' },
    )
    expect(dec.data).toBe('AttackAtDawn')
  })
})

describe('entropy', () => {
  it('reports low entropy for repeated text', () => {
    const result = entropyAnalysis.run({ data: 'aaaaaaaaaa', type: 'string' }, {})
    expect(result.data).toMatch(/Shannon entropy/)
    expect(result.data).toMatch(/low/i)
  })
})
