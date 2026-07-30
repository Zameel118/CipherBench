import { Base64 } from 'js-base64'
import { stringFromCharCodes } from '../../core/char-codes'
import type { Operation } from '../../core/types'

const STANDARD_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
const URLSAFE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_='

function normalizeAlphabetParam(params: Record<string, string | number | boolean>): 'standard' | 'url-safe' {
  const alphabet = String(params.alphabet ?? 'standard')
  return alphabet === 'url-safe' ? 'url-safe' : 'standard'
}

function alphabetChars(kind: 'standard' | 'url-safe'): string {
  return kind === 'url-safe' ? URLSAFE_ALPHABET : STANDARD_ALPHABET
}

function base64DetectConfidence(input: string): number {
  const trimmed = input.trim().replace(/\s+/g, '')
  if (trimmed.length === 0) return 0
  const standardOk = /^[A-Za-z0-9+/]+=*$/.test(trimmed)
  const urlSafeOk = /^[A-Za-z0-9_-]+=*$/.test(trimmed)
  if (!standardOk && !urlSafeOk) return 0
  if (trimmed.length % 4 !== 0) return 0.3
  if (trimmed.length < 4) return 0.2
  return 0.85
}

/**
 * Convert Base64 payload to a pipeline string.
 * Prefer UTF-8 when the bytes are valid UTF-8 (normal text).
 * Fall back to latin1 so binary CTF blobs (XOR/gzip) stay byte-accurate like CyberChef.
 */
function bytesToPipelineString(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return stringFromCharCodes(bytes)
  }
}

/**
 * Base64 decode (From Base64).
 * CyberChef-compatible options: remove non-alphabet chars, strict mode.
 */
export const base64Decode: Operation = {
  id: 'base64-decode',
  name: 'From Base64',
  category: 'Encoding',
  description:
    'Decode Base64. Valid UTF-8 becomes Unicode; otherwise latin1 bytes (CyberChef-compatible). Optional strip of non-alphabet chars + strict mode.',
  params: [
    {
      name: 'alphabet',
      type: 'select',
      default: 'standard',
      options: ['standard', 'url-safe'],
    },
    {
      name: 'removeNonAlphabet',
      type: 'boolean',
      default: true,
    },
    {
      name: 'strictMode',
      type: 'boolean',
      default: false,
    },
  ],
  detectable: true,
  detectConfidence: base64DetectConfidence,
  run: (input, params) => {
    const raw = input.data
    if (raw.length === 0) {
      return { data: '', type: 'string' }
    }

    const alphabet = normalizeAlphabetParam(params)
    const removeNonAlphabet = params.removeNonAlphabet !== false
    const strictMode = params.strictMode === true
    const allowed = alphabetChars(alphabet)

    let cleaned = raw.trim().replace(/\s+/g, '')

    if (removeNonAlphabet) {
      cleaned = [...cleaned].filter((ch) => allowed.includes(ch)).join('')
    } else if (![...cleaned].every((ch) => allowed.includes(ch))) {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid Base64: input contains characters outside the Base64 alphabet',
      }
    }

    if (alphabet === 'url-safe') {
      cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')
    }

    if (cleaned.length === 0) {
      return { data: '', type: 'string' }
    }

    const pad = cleaned.length % 4
    if (pad === 1) {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid Base64: length modulo 4 cannot be 1',
      }
    }

    if (strictMode && pad !== 0) {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid Base64 (strict): length must be a multiple of 4',
      }
    }

    if (pad > 0) {
      cleaned = cleaned + '='.repeat(4 - pad)
    }

    try {
      const bytes = Base64.toUint8Array(cleaned)
      return { data: bytesToPipelineString(bytes), type: 'string' }
    } catch {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid Base64: failed to decode',
      }
    }
  },
}

export const base64Encode: Operation = {
  id: 'base64-encode',
  name: 'To Base64',
  category: 'Encoding',
  description: 'Encode plain text (UTF-8) or binary pipeline bytes to Base64.',
  params: [
    {
      name: 'alphabet',
      type: 'select',
      default: 'standard',
      options: ['standard', 'url-safe'],
    },
  ],
  run: (input, params) => {
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }
    const alphabet = normalizeAlphabetParam(params)
    try {
      let encoded: string
      const isBinary = [...input.data].every((ch) => ch.charCodeAt(0) <= 0xff)
      if (isBinary) {
        const bytes = Uint8Array.from(input.data, (c) => c.charCodeAt(0) & 0xff)
        encoded =
          alphabet === 'url-safe'
            ? Base64.fromUint8Array(bytes, true)
            : Base64.fromUint8Array(bytes)
      } else if (alphabet === 'url-safe') {
        encoded = Base64.encodeURI(input.data)
      } else {
        encoded = Base64.encode(input.data)
      }
      return { data: encoded, type: 'string' }
    } catch {
      return {
        data: input.data,
        type: 'string',
        error: 'Failed to Base64-encode input',
      }
    }
  },
}
