import type { Operation } from '../../core/types'

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const B85 =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~'

function encodeBase32(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bits = 0
  let value = 0
  let out = ''
  for (const b of bytes) {
    value = (value << 8) | b
    bits += 8
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31]
  while (out.length % 8 !== 0) out += '='
  return out
}

function decodeBase32(input: string): string {
  const cleaned = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '')
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const ch of cleaned) {
    const idx = B32.indexOf(ch)
    if (idx < 0) throw new Error('bad alphabet')
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return new TextDecoder().decode(Uint8Array.from(bytes))
}

function encodeBase58(text: string): string {
  const bytes = Array.from(new TextEncoder().encode(text))
  if (bytes.length === 0) return ''
  let zeros = 0
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++
  const digits = [0]
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i]!
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j]! << 8
      digits[j] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }
  let out = '1'.repeat(zeros)
  for (let i = digits.length - 1; i >= 0; i--) out += B58[digits[i]!]
  return out
}

function decodeBase58(input: string): string {
  const cleaned = input.trim()
  if (!cleaned) return ''
  let zeros = 0
  while (zeros < cleaned.length && cleaned[zeros] === '1') zeros++
  const bytes = [0]
  for (let i = zeros; i < cleaned.length; i++) {
    const idx = B58.indexOf(cleaned[i]!)
    if (idx < 0) throw new Error('bad alphabet')
    let carry = idx
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j]! * 58
      bytes[j] = carry & 0xff
      carry >>= 8
    }
    while (carry > 0) {
      bytes.push(carry & 0xff)
      carry >>= 8
    }
  }
  const out = new Uint8Array(zeros + bytes.length)
  for (let i = 0; i < zeros; i++) out[i] = 0
  for (let i = 0; i < bytes.length; i++) out[zeros + i] = bytes[bytes.length - 1 - i]!
  return new TextDecoder().decode(out)
}

function encodeAscii85(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let out = '<~'
  let i = 0
  while (i < bytes.length) {
    const chunk = [bytes[i] ?? 0, bytes[i + 1] ?? 0, bytes[i + 2] ?? 0, bytes[i + 3] ?? 0]
    const pad = Math.max(0, 4 - (bytes.length - i))
    let value =
      ((chunk[0]! << 24) >>> 0) + (chunk[1]! << 16) + (chunk[2]! << 8) + chunk[3]!
    if (value === 0 && pad === 0) {
      out += 'z'
    } else {
      const chars: string[] = []
      for (let k = 0; k < 5; k++) {
        chars.unshift(B85[value % 85]!)
        value = Math.floor(value / 85)
      }
      out += chars.slice(0, 5 - pad).join('')
    }
    i += 4
  }
  return out + '~>'
}

function decodeAscii85(input: string): string {
  let s = input.trim()
  if (s.startsWith('<~')) s = s.slice(2)
  if (s.endsWith('~>')) s = s.slice(0, -2)
  const out: number[] = []
  let tuple: number[] = []
  const flush = (count: number) => {
    let value = 0
    for (let i = 0; i < 5; i++) value = value * 85 + (tuple[i] ?? 84)
    const bytes = [
      (value >>> 24) & 0xff,
      (value >>> 16) & 0xff,
      (value >>> 8) & 0xff,
      value & 0xff,
    ]
    for (let i = 0; i < count; i++) out.push(bytes[i]!)
    tuple = []
  }
  for (const ch of s) {
    if (/\s/.test(ch)) continue
    if (ch === 'z') {
      if (tuple.length) throw new Error('bad z')
      out.push(0, 0, 0, 0)
      continue
    }
    const idx = B85.indexOf(ch)
    if (idx < 0) throw new Error('bad alphabet')
    tuple.push(idx)
    if (tuple.length === 5) flush(4)
  }
  if (tuple.length) {
    const count = tuple.length - 1
    while (tuple.length < 5) tuple.push(84)
    flush(count)
  }
  return new TextDecoder().decode(Uint8Array.from(out))
}

export const base32Encode: Operation = {
  id: 'base32-encode',
  name: 'To Base32',
  category: 'Encoding',
  description: 'Encode text to RFC 4648 Base32.',
  params: [],
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      return { data: encodeBase32(input.data), type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Base32 encode failed' }
    }
  },
}

export const base32Decode: Operation = {
  id: 'base32-decode',
  name: 'From Base32',
  category: 'Encoding',
  description: 'Decode RFC 4648 Base32 to text.',
  params: [],
  detectable: true,
  detectConfidence: (input) => {
    const t = input.trim().replace(/\s+/g, '')
    if (t.length < 8) return 0
    if (!/^[A-Za-z2-7=]+$/.test(t)) return 0
    return 0.55
  },
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      return { data: decodeBase32(input.data), type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Invalid Base32' }
    }
  },
}

export const base58Encode: Operation = {
  id: 'base58-encode',
  name: 'To Base58',
  category: 'Encoding',
  description: 'Encode text to Bitcoin-style Base58.',
  params: [],
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      return { data: encodeBase58(input.data), type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Base58 encode failed' }
    }
  },
}

export const base58Decode: Operation = {
  id: 'base58-decode',
  name: 'From Base58',
  category: 'Encoding',
  description: 'Decode Bitcoin-style Base58 to text.',
  params: [],
  detectable: true,
  detectConfidence: (input) => {
    const t = input.trim()
    if (t.length < 8) return 0
    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(t)) return 0
    return 0.45
  },
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      return { data: decodeBase58(input.data), type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Invalid Base58' }
    }
  },
}

export const base85Encode: Operation = {
  id: 'base85-encode',
  name: 'To Ascii85',
  category: 'Encoding',
  description: 'Encode text to Adobe Ascii85 (Base85) with <~ ~> framing.',
  params: [],
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      return { data: encodeAscii85(input.data), type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Ascii85 encode failed' }
    }
  },
}

export const base85Decode: Operation = {
  id: 'base85-decode',
  name: 'From Ascii85',
  category: 'Encoding',
  description: 'Decode Adobe Ascii85 / Base85.',
  params: [],
  detectable: true,
  detectConfidence: (input) => {
    const t = input.trim()
    if (t.startsWith('<~') && t.includes('~>')) return 0.8
    return 0
  },
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      return { data: decodeAscii85(input.data), type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Invalid Ascii85' }
    }
  },
}
