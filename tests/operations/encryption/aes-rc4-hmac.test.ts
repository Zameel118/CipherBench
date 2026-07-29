import { describe, expect, it } from 'vitest'
import { aesCrypt, hmacSign, rc4Crypt } from '../../../src/operations/encryption/aes-rc4-hmac'

describe('AES / RC4 / HMAC', () => {
  it('AES-CBC round-trips with non-default key', () => {
    const key = 'myCustomKey12345'
    const iv = 'fedcba9876543210'
    const enc = aesCrypt.run(
      { data: 'secret payload', type: 'string' },
      { direction: 'encrypt', key, iv },
    )
    expect(enc.error).toBeUndefined()
    expect(enc.data).not.toContain('WARNING')
    const dec = aesCrypt.run(
      { data: enc.data, type: 'string' },
      { direction: 'decrypt', key, iv },
    )
    expect(dec.data).toBe('secret payload')
  })

  it('AES warns on default key', () => {
    const enc = aesCrypt.run(
      { data: 'test', type: 'string' },
      { direction: 'encrypt', key: '0123456789abcdef', iv: '0123456789abcdef' },
    )
    expect(enc.data).toContain('WARNING')
  })

  it('RC4 round-trips with non-default key', () => {
    const enc = rc4Crypt.run(
      { data: 'stream me', type: 'string' },
      { direction: 'encrypt', key: 'mykey' },
    )
    expect(enc.data).not.toContain('WARNING')
    const dec = rc4Crypt.run(
      { data: enc.data, type: 'string' },
      { direction: 'decrypt', key: 'mykey' },
    )
    expect(dec.data).toBe('stream me')
  })

  it('HMAC-SHA256 with non-default key', () => {
    const result = hmacSign.run(
      { data: 'hello', type: 'string' },
      { algorithm: 'SHA256', key: 'my-hmac-key' },
    )
    expect(result.data).toMatch(/^[0-9a-f]{64}$/)
    expect(result.data).not.toContain('WARNING')
  })

  it('HMAC warns on default key', () => {
    const result = hmacSign.run(
      { data: 'hello', type: 'string' },
      { algorithm: 'SHA256', key: 'secret' },
    )
    expect(result.data).toContain('WARNING')
  })
})
