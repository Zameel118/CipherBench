import CryptoJS from 'crypto-js'
import type { Operation } from '../../core/types'

/**
 * MD5 via crypto-js - not for new security designs, but still common in
 * legacy forensics and CTF hash-cracking exercises.
 */
export const md5Hash: Operation = {
  id: 'md5-hash',
  name: 'MD5',
  category: 'Hashing',
  description: 'Compute MD5 hash (hex) of the input string.',
  params: [],
  run: (input) => {
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }
    try {
      const hash = CryptoJS.MD5(input.data).toString(CryptoJS.enc.Hex)
      return { data: hash, type: 'string' }
    } catch {
      return {
        data: input.data,
        type: 'string',
        error: 'Failed to compute MD5',
      }
    }
  },
}
