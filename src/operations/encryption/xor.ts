import type { Operation } from '../../core/types'

/** Fraction of bytes that look printable ASCII (for ranking XOR brute-force hits). */
export function printableRatio(text: string): number {
  if (text.length === 0) return 0
  let printable = 0
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (
      (code >= 32 && code <= 126) ||
      code === 9 ||
      code === 10 ||
      code === 13
    ) {
      printable++
    }
  }
  return printable / text.length
}

function parseKeyByte(key: string): number | null {
  const trimmed = key.trim()
  if (trimmed.length === 0) return null
  if (/^(0x)?[0-9a-fA-F]{1,2}$/.test(trimmed)) {
    const n = parseInt(trimmed.replace(/^0x/i, ''), 16)
    return n & 0xff
  }
  const n = Number(trimmed)
  if (Number.isInteger(n) && n >= 0 && n <= 255) return n
  return null
}

function xorWithKey(text: string, keyBytes: number[]): string {
  if (keyBytes.length === 0) return text
  const codes = [...text].map((ch) => ch.charCodeAt(0))
  const out = codes.map((c, i) => c ^ keyBytes[i % keyBytes.length]!)
  return String.fromCharCode(...out)
}

export const xorCipher: Operation = {
  id: 'xor-cipher',
  name: 'XOR',
  category: 'Encryption',
  description:
    'XOR each byte with a single-byte or repeating key. Optional single-byte brute force with printable scores.',
  params: [
    {
      name: 'mode',
      type: 'select',
      default: 'single-byte',
      options: ['single-byte', 'repeating-key'],
    },
    {
      name: 'key',
      type: 'string',
      default: '0x41',
    },
    {
      name: 'bruteForceSingleByte',
      type: 'boolean',
      default: false,
    },
  ],
  run: (input, params) => {
    const raw = input.data
    if (raw.length === 0) {
      return { data: '', type: 'string' }
    }

    if (params.bruteForceSingleByte === true) {
      const candidates: { key: number; text: string; score: number }[] = []
      for (let k = 0; k < 256; k++) {
        const decoded = xorWithKey(raw, [k])
        candidates.push({ key: k, text: decoded, score: printableRatio(decoded) })
      }
      candidates.sort((a, b) => b.score - a.score || a.key - b.key)
      const lines = candidates.map(
        (c) =>
          `key 0x${c.key.toString(16).padStart(2, '0')} (${c.key}) score ${c.score.toFixed(3)}: ${c.text}`,
      )
      return { data: lines.join('\n'), type: 'string' }
    }

    const mode = String(params.mode ?? 'single-byte')
    const keyStr = String(params.key ?? '')

    if (mode === 'single-byte') {
      const byte = parseKeyByte(keyStr)
      if (byte === null) {
        return {
          data: raw,
          type: 'string',
          error: 'Invalid XOR key: use 0–255 or hex byte (e.g. 0x41)',
        }
      }
      return { data: xorWithKey(raw, [byte]), type: 'string' }
    }

    if (keyStr.length === 0) {
      return {
        data: raw,
        type: 'string',
        error: 'Repeating key cannot be empty',
      }
    }

    const keyBytes = [...keyStr].map((ch) => ch.charCodeAt(0) & 0xff)
    return { data: xorWithKey(raw, keyBytes), type: 'string' }
  },
}
