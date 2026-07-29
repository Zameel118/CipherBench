import type { Operation } from '../../core/types'

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function utf8ToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

export const hexEncode: Operation = {
  id: 'hex-encode',
  name: 'To Hex',
  category: 'Encoding',
  description: 'Encode text as lowercase hexadecimal (UTF-8 bytes).',
  params: [
    {
      name: 'delimiter',
      type: 'select',
      default: 'none',
      options: ['none', 'space'],
    },
  ],
  run: (input, params) => {
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }
    const bytes = utf8ToBytes(input.data)
    const hex = bytesToHex(bytes)
    if (params.delimiter === 'space') {
      const spaced = hex.match(/.{1,2}/g)?.join(' ') ?? hex
      return { data: spaced, type: 'string' }
    }
    return { data: hex, type: 'string' }
  },
}

export const hexDecode: Operation = {
  id: 'hex-decode',
  name: 'From Hex',
  category: 'Encoding',
  description: 'Decode a hexadecimal string into plain text (UTF-8).',
  params: [],
  detectable: true,
  detectConfidence: (input: string): number => {
    const cleaned = input.trim().replace(/\s+/g, '')
    if (cleaned.length === 0) return 0
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) return 0
    if (cleaned.length % 2 !== 0) return 0.35
    if (cleaned.length < 2) return 0.2
    return 0.8
  },
  run: (input) => {
    const raw = input.data
    if (raw.length === 0) {
      return { data: '', type: 'string' }
    }

    const cleaned = raw.trim().replace(/\s+/g, '')
    if (cleaned.length === 0) {
      return { data: '', type: 'string' }
    }
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid hex: only 0-9 and A-F are allowed (optional whitespace)',
      }
    }
    if (cleaned.length % 2 !== 0) {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid hex: odd number of nibbles',
      }
    }

    try {
      const bytes = new Uint8Array(cleaned.length / 2)
      for (let i = 0; i < cleaned.length; i += 2) {
        bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16)
      }
      const decoded = bytesToUtf8(bytes)
      return { data: decoded, type: 'string' }
    } catch {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid hex: not valid UTF-8 after decode',
      }
    }
  },
}
