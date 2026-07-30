import { stringFromCharCodes } from '../../core/char-codes'
import { xorBruteForceAsync } from '../../core/heavy-compute'
import { bruteForceInputTooLarge } from '../../core/input-limits'
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

function parseHexBytes(key: string): number[] | null {
  const cleaned = key.trim().replace(/^0x/i, '').replace(/[\s:_,-]/g, '')
  if (!cleaned || cleaned.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(cleaned)) return null
  const out: number[] = []
  for (let i = 0; i < cleaned.length; i += 2) {
    out.push(parseInt(cleaned.slice(i, i + 2), 16) & 0xff)
  }
  return out.length ? out : null
}

function parseDecimalBytes(key: string): number[] | null {
  const parts = key.trim().split(/[\s,]+/).filter(Boolean)
  if (parts.length === 0) return null
  const out: number[] = []
  for (const p of parts) {
    const n = Number(p)
    if (!Number.isInteger(n) || n < 0 || n > 255) return null
    out.push(n)
  }
  return out
}

function parseBase64Key(key: string): number[] | null {
  try {
    const bin = atob(key.trim().replace(/-/g, '+').replace(/_/g, '/'))
    return [...bin].map((c) => c.charCodeAt(0) & 0xff)
  } catch {
    return null
  }
}

/** Parse XOR key according to CyberChef-style key format. */
export function parseXorKeyBytes(key: string, format: string): number[] | null {
  const trimmed = key.trim()
  if (!trimmed) return null
  const fmt = format.toLowerCase()

  if (fmt === 'hex') {
    // Allow single-byte shortcuts: "8F", "0x8F", "41"
    if (/^(0x)?[0-9a-fA-F]{1,2}$/.test(trimmed)) {
      return [parseInt(trimmed.replace(/^0x/i, ''), 16) & 0xff]
    }
    return parseHexBytes(trimmed)
  }
  if (fmt === 'decimal') return parseDecimalBytes(trimmed)
  if (fmt === 'base64') return parseBase64Key(trimmed)
  // utf8 / latin1: each code unit as a key byte
  return [...trimmed].map((ch) => ch.charCodeAt(0) & 0xff)
}

function xorWithKey(text: string, keyBytes: number[], nullPreserving: boolean): string {
  if (keyBytes.length === 0) return text
  const codes = [...text].map((ch) => ch.charCodeAt(0) & 0xff)
  const out = codes.map((c, i) => {
    const k = keyBytes[i % keyBytes.length]!
    if (nullPreserving && (c === 0 || k === 0)) return c
    return c ^ k
  })
  return stringFromCharCodes(out)
}

function xorBruteSync(raw: string) {
  const candidates: { key: number; text: string; score: number }[] = []
  for (let k = 0; k < 256; k++) {
    const decoded = xorWithKey(raw, [k], false)
    candidates.push({ key: k, text: decoded, score: printableRatio(decoded) })
  }
  candidates.sort((a, b) => b.score - a.score || a.key - b.key)
  return candidates
    .map(
      (c) =>
        `key 0x${c.key.toString(16).padStart(2, '0')} (${c.key}) score ${c.score.toFixed(3)}: ${c.text}`,
    )
    .join('\n')
}

export const xorCipher: Operation = {
  id: 'xor-cipher',
  name: 'XOR',
  category: 'Encryption',
  description:
    'XOR each byte with a key (hex/utf8/decimal/base64). Optional null-preserving and single-byte brute force.',
  params: [
    {
      name: 'mode',
      type: 'select',
      default: 'single-byte',
      options: ['single-byte', 'repeating-key'],
    },
    {
      name: 'keyFormat',
      type: 'select',
      default: 'hex',
      options: ['hex', 'utf8', 'decimal', 'base64'],
    },
    {
      name: 'key',
      type: 'string',
      default: '41',
    },
    {
      name: 'nullPreserving',
      type: 'boolean',
      default: false,
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
      const sizeError = bruteForceInputTooLarge(raw.length)
      if (sizeError) {
        return { data: raw, type: 'string', error: sizeError }
      }
      return { data: xorBruteSync(raw), type: 'string' }
    }

    const mode = String(params.mode ?? 'single-byte')
    const keyFormat = String(params.keyFormat ?? 'hex')
    const keyStr = String(params.key ?? '')
    const nullPreserving = params.nullPreserving === true

    const keyBytes = parseXorKeyBytes(keyStr, keyFormat)
    if (!keyBytes || keyBytes.length === 0) {
      return {
        data: raw,
        type: 'string',
        error: `Invalid XOR key for format "${keyFormat}"`,
      }
    }

    if (mode === 'single-byte') {
      return { data: xorWithKey(raw, [keyBytes[0]!], nullPreserving), type: 'string' }
    }

    return { data: xorWithKey(raw, keyBytes, nullPreserving), type: 'string' }
  },
  runAsync: async (input, params) => {
    if (params.bruteForceSingleByte !== true) {
      return xorCipher.run!(input, params)
    }
    const raw = input.data
    if (raw.length === 0) return { data: '', type: 'string' }
    const sizeError = bruteForceInputTooLarge(raw.length)
    if (sizeError) return { data: raw, type: 'string', error: sizeError }
    try {
      const lines = await xorBruteForceAsync(raw)
      return { data: lines, type: 'string' }
    } catch {
      return { data: xorBruteSync(raw), type: 'string' }
    }
  },
}
