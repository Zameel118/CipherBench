import CryptoJS from 'crypto-js'
import type { Operation } from '../../core/types'

function shaHash(input: string, algo: 'SHA1' | 'SHA256'): string {
  if (algo === 'SHA1') {
    return CryptoJS.SHA1(input).toString(CryptoJS.enc.Hex)
  }
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex)
}

/**
 * SHA-1 / SHA-256 through crypto-js (same rationale as MD5: vetted library, no home-grown hashing).
 */
export const sha1Hash: Operation = {
  id: 'sha1-hash',
  name: 'SHA-1',
  category: 'Hashing',
  description: 'Compute SHA-1 hash (hex) of the input string.',
  params: [],
  run: (input) => {
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }
    try {
      return { data: shaHash(input.data, 'SHA1'), type: 'string' }
    } catch {
      return {
        data: input.data,
        type: 'string',
        error: 'Failed to compute SHA-1',
      }
    }
  },
}

export const sha256Hash: Operation = {
  id: 'sha256-hash',
  name: 'SHA-256',
  category: 'Hashing',
  description: 'Compute SHA-256 hash (hex) of the input string.',
  params: [],
  run: (input) => {
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }
    try {
      return { data: shaHash(input.data, 'SHA256'), type: 'string' }
    } catch {
      return {
        data: input.data,
        type: 'string',
        error: 'Failed to compute SHA-256',
      }
    }
  },
}
