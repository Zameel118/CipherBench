import { describe, expect, it } from 'vitest'
import {
  base32Decode,
  base32Encode,
  base58Decode,
  base58Encode,
  base85Decode,
  base85Encode,
} from '../../../src/operations/encoding/base-n'
import {
  htmlEntityDecode,
  htmlEntityEncode,
  punycodeDecode,
  punycodeEncode,
} from '../../../src/operations/encoding/html-entities'
import {
  gzipCompress,
  gzipDecompress,
  zlibCompress,
  zlibDecompress,
} from '../../../src/operations/encoding/compression'

describe('base-n codecs', () => {
  it('Base32 round-trips', () => {
    const enc = base32Encode.run({ data: 'FLAG{base32}', type: 'string' }, {})
    expect(enc.error).toBeUndefined()
    const dec = base32Decode.run({ data: enc.data, type: 'string' }, {})
    expect(dec.data).toBe('FLAG{base32}')
  })

  it('Base58 round-trips', () => {
    const enc = base58Encode.run({ data: 'hello', type: 'string' }, {})
    const dec = base58Decode.run({ data: enc.data, type: 'string' }, {})
    expect(dec.data).toBe('hello')
  })

  it('Ascii85 round-trips', () => {
    const enc = base85Encode.run({ data: 'Ascii85!', type: 'string' }, {})
    expect(enc.data.startsWith('<~')).toBe(true)
    const dec = base85Decode.run({ data: enc.data, type: 'string' }, {})
    expect(dec.data).toBe('Ascii85!')
  })
})

describe('html entities + punycode', () => {
  it('encodes and decodes entities', () => {
    const enc = htmlEntityEncode.run({ data: '<script>"&"', type: 'string' }, {})
    expect(enc.data).toContain('&lt;')
    const dec = htmlEntityDecode.run({ data: enc.data, type: 'string' }, {})
    expect(dec.data).toBe('<script>"&"')
  })

  it('punycode round-trips via URL host API', () => {
    const enc = punycodeEncode.run({ data: 'münchen.de', type: 'string' }, {})
    expect(enc.error).toBeUndefined()
    expect(enc.data.toLowerCase()).toContain('xn--')
    const dec = punycodeDecode.run({ data: enc.data, type: 'string' }, {})
    expect(dec.data.toLowerCase()).toContain('nchen')
  })
})

describe('compression', () => {
  it('gzip round-trips', () => {
    const enc = gzipCompress.run({ data: 'FLAG{gzip}', type: 'string' }, {})
    expect(enc.error).toBeUndefined()
    const dec = gzipDecompress.run({ data: enc.data, type: 'bytes' }, {})
    expect(dec.data).toBe('FLAG{gzip}')
  })

  it('zlib round-trips', () => {
    const enc = zlibCompress.run({ data: 'zlib-ok', type: 'string' }, {})
    const dec = zlibDecompress.run({ data: enc.data, type: 'bytes' }, {})
    expect(dec.data).toBe('zlib-ok')
  })
})
