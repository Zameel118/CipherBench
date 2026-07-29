import { describe, expect, it } from 'vitest'
import CryptoJS from 'crypto-js'
import { Base64 } from 'js-base64'
import { decodeJwt, jwtDecode } from '../../../src/operations/soc-tools/jwt-decode'

function b64urlJson(obj: unknown): string {
  return Base64.encodeURI(JSON.stringify(obj))
}

function signHs256(header: object, payload: object, secret: string): string {
  const headerSeg = b64urlJson(header)
  const payloadSeg = b64urlJson(payload)
  const signingInput = `${headerSeg}.${payloadSeg}`
  const sig = CryptoJS.HmacSHA256(signingInput, secret)
  const b64 = CryptoJS.enc.Base64.stringify(sig)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${signingInput}.${b64}`
}

describe('jwt-decode', () => {
  it('decodes header and payload', () => {
    const token = signHs256({ alg: 'HS256', typ: 'JWT' }, { sub: 'user1' }, 'secret')
    const { output, error } = decodeJwt(token)
    expect(error).toBeUndefined()
    expect(output).toContain('"sub": "user1"')
    expect(output).toContain('HS256')
  })

  it('verifies valid HMAC with secret', () => {
    const secret = 'test-secret'
    const token = signHs256({ alg: 'HS256', typ: 'JWT' }, { role: 'admin' }, secret)
    const { output } = decodeJwt(token, secret)
    expect(output).toContain('HMAC verification (HS256): VALID')
  })

  it('reports invalid HMAC with wrong secret', () => {
    const token = signHs256({ alg: 'HS256', typ: 'JWT' }, { role: 'admin' }, 'right')
    const { output } = decodeJwt(token, 'wrong')
    expect(output).toContain('HMAC verification (HS256): INVALID')
  })

  it('notes RS256 decode-only', () => {
    const token = `${b64urlJson({ alg: 'RS256', typ: 'JWT' })}.${b64urlJson({ a: 1 })}.sig`
    const { output } = decodeJwt(token)
    expect(output).toContain('decode/display only')
  })

  it('handles empty input', () => {
    expect(jwtDecode.run({ data: '', type: 'string' }, {}).data).toBe('')
  })

  it('errors on malformed token', () => {
    const result = jwtDecode.run({ data: 'not.a.jwt.extra', type: 'string' }, {})
    expect(result.error).toMatch(/Invalid JWT/)
  })
})
