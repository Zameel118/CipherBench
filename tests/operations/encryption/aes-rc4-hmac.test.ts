import { describe, expect, it } from 'vitest'
import { aesCrypt, hmacSign, rc4Crypt } from '../../../src/operations/encryption/aes-rc4-hmac'

describe('AES / RC4 / HMAC', () => {
  it('AES-CBC round-trips', () => {
    const key = '0123456789abcdef'
    const iv = 'fedcba9876543210'
    const enc = aesCrypt.run(
      { data: 'secret payload', type: 'string' },
      { direction: 'encrypt', key, iv },
    )
    expect(enc.error).toBeUndefined()
    const dec = aesCrypt.run(
      { data: enc.data, type: 'string' },
      { direction: 'decrypt', key, iv },
    )
    expect(dec.data).toBe('secret payload')
  })

  it('RC4 round-trips', () => {
    const enc = rc4Crypt.run(
      { data: 'stream me', type: 'string' },
      { direction: 'encrypt', key: 'k' },
    )
    const dec = rc4Crypt.run(
      { data: enc.data, type: 'string' },
      { direction: 'decrypt', key: 'k' },
    )
    expect(dec.data).toBe('stream me')
  })

  it('HMAC-SHA256 known-ish digest length', () => {
    const result = hmacSign.run(
      { data: 'hello', type: 'string' },
      { algorithm: 'SHA256', key: 'secret' },
    )
    expect(result.data).toMatch(/^[0-9a-f]{64}$/)
  })
})
