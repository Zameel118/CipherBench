import CryptoJS from 'crypto-js'
import { hashAsync } from '../../core/heavy-compute'
import type { Operation, OperationInput, OperationOutput } from '../../core/types'

const LARGE = 40_000

function syncHash(algo: 'MD5' | 'SHA1' | 'SHA256', text: string): string {
  if (algo === 'MD5') return CryptoJS.MD5(text).toString(CryptoJS.enc.Hex)
  if (algo === 'SHA1') return CryptoJS.SHA1(text).toString(CryptoJS.enc.Hex)
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex)
}

function makeHashOp(
  id: string,
  name: string,
  algo: 'MD5' | 'SHA1' | 'SHA256',
  description: string,
): Operation {
  const run = (input: OperationInput): OperationOutput => {
    if (input.data.length === 0) return { data: '', type: 'string' }
    try {
      return { data: syncHash(algo, input.data), type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: `Failed to compute ${name}` }
    }
  }
  return {
    id,
    name,
    category: 'Hashing',
    description,
    params: [],
    run,
    runAsync: async (input) => {
      if (input.data.length < LARGE) return run(input)
      try {
        const digest = await hashAsync(algo, input.data)
        // hashAsync falls back poorly if worker fails - prefer sync if digest looks stubby
        if (digest.startsWith(`${algo}:`)) return run(input)
        return { data: digest, type: 'string' }
      } catch {
        return run(input)
      }
    },
  }
}

export const md5Hash = makeHashOp(
  'md5-hash',
  'MD5',
  'MD5',
  'Compute MD5 hash (hex). Large inputs use a Web Worker when available.',
)

export const sha1Hash = makeHashOp(
  'sha1-hash',
  'SHA-1',
  'SHA1',
  'Compute SHA-1 hash (hex). Large inputs use a Web Worker when available.',
)

export const sha256Hash = makeHashOp(
  'sha256-hash',
  'SHA-256',
  'SHA256',
  'Compute SHA-256 hash (hex). Large inputs use a Web Worker when available.',
)
