import { Base64 } from 'js-base64'
import type { Operation } from '../../core/types'

/**
 * RFC 2047 encoded-words: =?charset?B|Q?encoded_text?=
 * Common in raw email headers (Subject, From display names).
 */
const ENCODED_WORD_RE =
  /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g

function decodeQuotedPrintableQ(input: string, charset: string): string {
  const bytes: number[] = []
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!
    if (ch === '_') {
      bytes.push(0x20)
      continue
    }
    if (ch === '=' && i + 2 < input.length) {
      const hex = input.slice(i + 1, i + 3)
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        bytes.push(parseInt(hex, 16))
        i += 2
        continue
      }
    }
    bytes.push(ch.charCodeAt(0) & 0xff)
  }
  try {
    return new TextDecoder(charset, { fatal: false }).decode(new Uint8Array(bytes))
  } catch {
    return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes))
  }
}

function decodeEncodedWord(charset: string, encoding: string, data: string): string {
  const enc = encoding.toUpperCase()
  const cs = charset.trim() || 'utf-8'
  if (enc === 'B') {
    try {
      const bytes = Base64.toUint8Array(data)
      return new TextDecoder(cs, { fatal: false }).decode(bytes)
    } catch {
      return data
    }
  }
  if (enc === 'Q') {
    return decodeQuotedPrintableQ(data, cs)
  }
  return data
}

export function decodeMimeEncodedWords(input: string): string {
  if (input.length === 0) return ''
  return input.replace(ENCODED_WORD_RE, (_full, charset, enc, data) =>
    decodeEncodedWord(String(charset), String(enc), String(data)),
  )
}

export const mimeHeaderDecode: Operation = {
  id: 'mime-header-decode',
  name: 'MIME Encoded-Word Decode',
  category: 'SOC Tools',
  description:
    'Decode RFC 2047 encoded-words in email headers (=?UTF-8?B?...?= / =?UTF-8?Q?...?=).',
  params: [],
  run: (input) => {
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }
    try {
      return { data: decodeMimeEncodedWords(input.data), type: 'string' }
    } catch {
      return {
        data: input.data,
        type: 'string',
        error: 'Failed to decode MIME encoded-words',
      }
    }
  },
}
