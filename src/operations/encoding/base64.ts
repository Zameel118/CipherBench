import { Base64 } from 'js-base64'
import type { Operation } from '../../core/types'

function normalizeAlphabetParam(params: Record<string, string | number | boolean>): 'standard' | 'url-safe' {
  const alphabet = String(params.alphabet ?? 'standard')
  return alphabet === 'url-safe' ? 'url-safe' : 'standard'
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
 * Base64 decode (From Base64).
 * Uses js-base64 rather than hand-rolled bit packing - alphabet edge cases
 * (padding, URL-safe alphabet) are easy to get wrong and hard to spot in review.
 */
export const base64Decode: Operation = {
  id: 'base64-decode',
  name: 'From Base64',
  category: 'Encoding',
  description: 'Decode a Base64-encoded string into plain text (UTF-8).',
  params: [
    {
      name: 'alphabet',
      type: 'select',
      default: 'standard',
      options: ['standard', 'url-safe'],
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
    let cleaned = raw.trim().replace(/\s+/g, '')

    if (alphabet === 'url-safe') {
      cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')
    }

    if (!/^[A-Za-z0-9+/]+=*$/.test(cleaned)) {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid Base64: input contains characters outside the Base64 alphabet',
      }
    }

    const pad = cleaned.length % 4
    if (pad === 1) {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid Base64: length modulo 4 cannot be 1',
      }
    }
    if (pad > 0) {
      cleaned = cleaned + '='.repeat(4 - pad)
    }

    try {
      const decoded = Base64.decode(cleaned)
      return { data: decoded, type: 'string' }
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
  description: 'Encode plain text (UTF-8) to Base64.',
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
      const encoded =
        alphabet === 'url-safe'
          ? Base64.encodeURI(input.data)
          : Base64.encode(input.data)
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
