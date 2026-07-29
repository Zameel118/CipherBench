import { Base64 } from 'js-base64'
import type { Operation } from '../../core/types'

/**
 * Base64 decode (From Base64).
 * Uses js-base64 rather than hand-rolled bit packing — alphabet edge cases
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
  detectConfidence: (input: string): number => {
    const trimmed = input.trim().replace(/\s+/g, '')
    if (trimmed.length === 0) return 0
    // Standard or URL-safe charset; length should be a multiple of 4 (with padding).
    const standardOk = /^[A-Za-z0-9+/]+=*$/.test(trimmed)
    const urlSafeOk = /^[A-Za-z0-9_-]+=*$/.test(trimmed)
    if (!standardOk && !urlSafeOk) return 0
    if (trimmed.length % 4 !== 0) return 0.3
    if (trimmed.length < 4) return 0.2
    return 0.85
  },
  run: (input, params) => {
    const raw = input.data
    if (raw.length === 0) {
      return { data: '', type: 'string' }
    }

    const alphabet = String(params.alphabet ?? 'standard')
    // Normalize whitespace that often appears in wrapped Base64 blobs.
    let cleaned = raw.trim().replace(/\s+/g, '')

    if (alphabet === 'url-safe') {
      // Convert URL-safe alphabet to standard before decoding.
      cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')
    }

    // Validate charset after URL-safe normalization.
    if (!/^[A-Za-z0-9+/]+=*$/.test(cleaned)) {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid Base64: input contains characters outside the Base64 alphabet',
      }
    }

    // Add missing padding so js-base64 / atob don't reject near-valid input.
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
