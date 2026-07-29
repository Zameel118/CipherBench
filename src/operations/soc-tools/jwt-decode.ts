import { Base64 } from 'js-base64'
import CryptoJS from 'crypto-js'
import type { Operation } from '../../core/types'

function base64UrlToUtf8(segment: string): { json?: string; error?: string } {
  if (!segment) {
    return { error: 'Empty JWT segment' }
  }
  let padded = segment.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4
  if (pad === 1) {
    return { error: 'Invalid Base64url segment' }
  }
  if (pad > 0) {
    padded += '='.repeat(4 - pad)
  }
  try {
    const decoded = Base64.decode(padded)
    return { json: decoded }
  } catch {
    return { error: 'Failed to Base64url-decode JWT segment' }
  }
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

type HmacAlg = 'HS256' | 'HS384' | 'HS512'

function hmacVerify(
  signingInput: string,
  signatureB64Url: string,
  secret: string,
  alg: HmacAlg,
): boolean {
  const hash =
    alg === 'HS256'
      ? CryptoJS.HmacSHA256(signingInput, secret)
      : alg === 'HS384'
        ? CryptoJS.HmacSHA384(signingInput, secret)
        : CryptoJS.HmacSHA512(signingInput, secret)

  const expected = CryptoJS.enc.Base64.stringify(hash)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return timingSafeEqual(expected, signatureB64Url)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export function decodeJwt(
  token: string,
  secret?: string,
): { output: string; error?: string } {
  const trimmed = token.trim()
  if (trimmed.length === 0) {
    return { output: '' }
  }

  const parts = trimmed.split('.')
  if (parts.length !== 3) {
    return {
      output: trimmed,
      error: 'Invalid JWT: expected three dot-separated segments',
    }
  }

  const [headerSeg, payloadSeg, signatureSeg] = parts as [string, string, string]
  const header = base64UrlToUtf8(headerSeg)
  if (header.error || header.json === undefined) {
    return { output: trimmed, error: header.error ?? 'Invalid JWT header' }
  }
  const payload = base64UrlToUtf8(payloadSeg)
  if (payload.error || payload.json === undefined) {
    return { output: trimmed, error: payload.error ?? 'Invalid JWT payload' }
  }

  let headerObj: { alg?: string; typ?: string }
  try {
    headerObj = JSON.parse(header.json) as { alg?: string; typ?: string }
  } catch {
    return { output: trimmed, error: 'JWT header is not valid JSON' }
  }

  const lines: string[] = [
    '=== HEADER ===',
    prettyJson(header.json),
    '',
    '=== PAYLOAD ===',
    prettyJson(payload.json),
    '',
    '=== SIGNATURE (base64url) ===',
    signatureSeg,
  ]

  const alg = headerObj.alg ?? 'unknown'
  if (alg.startsWith('RS') || alg.startsWith('ES') || alg.startsWith('PS')) {
    lines.push(
      '',
      `Note: ${alg} verification requires a public key and is not performed here (decode/display only).`,
    )
  } else if (secret && secret.length > 0) {
    if (alg === 'HS256' || alg === 'HS384' || alg === 'HS512') {
      const signingInput = `${headerSeg}.${payloadSeg}`
      const valid = hmacVerify(signingInput, signatureSeg, secret, alg)
      lines.push('', `HMAC verification (${alg}): ${valid ? 'VALID' : 'INVALID'}`)
    } else {
      lines.push('', `HMAC verification skipped: unsupported alg "${alg}"`)
    }
  } else if (alg.startsWith('HS')) {
    lines.push('', 'HMAC verification skipped: no secret provided')
  }

  return { output: lines.join('\n') }
}

export const jwtDecode: Operation = {
  id: 'jwt-decode',
  name: 'JWT Decode',
  category: 'SOC Tools',
  description:
    'Decode JWT header and payload (Base64url) and optionally verify HMAC (HS256/384/512) with a secret.',
  params: [
    {
      name: 'secret',
      type: 'string',
      default: '',
    },
  ],
  run: (input, params) => {
    const secret = String(params.secret ?? '')
    const { output, error } = decodeJwt(input.data, secret)
    if (error) {
      return { data: input.data, type: 'string', error }
    }
    return { data: output, type: 'string' }
  },
}
