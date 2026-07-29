import CryptoJS from 'crypto-js'
import type { Operation } from '../../core/types'

const AES_DEFAULT_KEY = '0123456789abcdef'
const AES_DEFAULT_IV = '0123456789abcdef'
const RC4_DEFAULT_KEY = 'secret'
const HMAC_DEFAULT_KEY = 'secret'

const DEFAULT_KEY_WARNING =
  ' [WARNING: using the default demo key -- not secure for real data]'

function parseKey(key: string): CryptoJS.lib.WordArray {
  const trimmed = key.trim()
  if (/^(0x)?[0-9a-fA-F]+$/.test(trimmed) && trimmed.replace(/^0x/i, '').length % 2 === 0) {
    return CryptoJS.enc.Hex.parse(trimmed.replace(/^0x/i, ''))
  }
  return CryptoJS.enc.Utf8.parse(key)
}

export const aesCrypt: Operation = {
  id: 'aes-crypt',
  name: 'AES Encrypt/Decrypt',
  category: 'Encryption',
  description:
    'AES-CBC with PKCS7 using crypto-js. Key/IV as UTF-8 or hex. Ciphertext is Base64.',
  params: [
    {
      name: 'direction',
      type: 'select',
      default: 'decrypt',
      options: ['encrypt', 'decrypt'],
    },
    { name: 'key', type: 'string', default: AES_DEFAULT_KEY },
    { name: 'iv', type: 'string', default: AES_DEFAULT_IV },
  ],
  run: (input, params) => {
    if (!input.data) return { data: '', type: 'string' }
    const direction = String(params.direction ?? 'decrypt')
    const rawKey = String(params.key ?? '')
    const rawIv = String(params.iv ?? '')
    const key = parseKey(rawKey)
    const iv = parseKey(rawIv)
    const usingDefaults = rawKey === AES_DEFAULT_KEY || rawIv === AES_DEFAULT_IV
    try {
      if (direction === 'encrypt') {
        const enc = CryptoJS.AES.encrypt(input.data, key, {
          iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        })
        const out = enc.toString()
        return {
          data: usingDefaults ? out + DEFAULT_KEY_WARNING : out,
          type: 'string',
        }
      }
      const dec = CryptoJS.AES.decrypt(input.data.trim(), key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      })
      const text = dec.toString(CryptoJS.enc.Utf8)
      if (!text) {
        return {
          data: input.data,
          type: 'string',
          error: 'AES decrypt produced empty UTF-8 (wrong key/IV or ciphertext?)',
        }
      }
      return { data: text, type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'AES operation failed' }
    }
  },
}

export const rc4Crypt: Operation = {
  id: 'rc4-crypt',
  name: 'RC4',
  category: 'Encryption',
  description: 'RC4 stream cipher (crypto-js). Ciphertext is crypto-js Base64.',
  params: [
    {
      name: 'direction',
      type: 'select',
      default: 'decrypt',
      options: ['encrypt', 'decrypt'],
    },
    { name: 'key', type: 'string', default: RC4_DEFAULT_KEY },
  ],
  run: (input, params) => {
    if (!input.data) return { data: '', type: 'string' }
    const rawKey = String(params.key ?? '')
    const direction = String(params.direction ?? 'decrypt')
    if (!rawKey) {
      return { data: input.data, type: 'string', error: 'RC4 key cannot be empty' }
    }
    const usingDefault = rawKey === RC4_DEFAULT_KEY
    try {
      if (direction === 'encrypt') {
        const out = CryptoJS.RC4.encrypt(input.data, rawKey).toString()
        return {
          data: usingDefault ? out + DEFAULT_KEY_WARNING : out,
          type: 'string',
        }
      }
      const dec = CryptoJS.RC4.decrypt(input.data.trim(), rawKey)
      const text = dec.toString(CryptoJS.enc.Utf8)
      if (!text) {
        return {
          data: input.data,
          type: 'string',
          error: 'RC4 decrypt produced empty UTF-8 (wrong key or ciphertext?)',
        }
      }
      return { data: text, type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'RC4 failed' }
    }
  },
}

export const hmacSign: Operation = {
  id: 'hmac-sign',
  name: 'HMAC',
  category: 'Hashing',
  description: 'Compute HMAC-SHA256/SHA1/MD5 of the input with a secret key (hex digest).',
  params: [
    {
      name: 'algorithm',
      type: 'select',
      default: 'SHA256',
      options: ['SHA256', 'SHA1', 'MD5'],
    },
    { name: 'key', type: 'string', default: HMAC_DEFAULT_KEY },
  ],
  run: (input, params) => {
    if (!input.data) return { data: '', type: 'string' }
    const rawKey = String(params.key ?? '')
    const algorithm = String(params.algorithm ?? 'SHA256')
    const usingDefault = rawKey === HMAC_DEFAULT_KEY
    try {
      let hash: CryptoJS.lib.WordArray
      if (algorithm === 'SHA1') hash = CryptoJS.HmacSHA1(input.data, rawKey)
      else if (algorithm === 'MD5') hash = CryptoJS.HmacMD5(input.data, rawKey)
      else hash = CryptoJS.HmacSHA256(input.data, rawKey)
      const out = hash.toString(CryptoJS.enc.Hex)
      return {
        data: usingDefault ? out + DEFAULT_KEY_WARNING : out,
        type: 'string',
      }
    } catch {
      return { data: input.data, type: 'string', error: 'HMAC failed' }
    }
  },
}
