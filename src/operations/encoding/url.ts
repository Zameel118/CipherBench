import type { Operation } from '../../core/types'

export const urlEncode: Operation = {
  id: 'url-encode',
  name: 'URL Encode',
  category: 'Encoding',
  description: 'Percent-encode text for use in URLs (encodeURIComponent).',
  params: [],
  run: (input) => {
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }
    try {
      return { data: encodeURIComponent(input.data), type: 'string' }
    } catch {
      return {
        data: input.data,
        type: 'string',
        error: 'Failed to URL-encode input',
      }
    }
  },
}

export const urlDecode: Operation = {
  id: 'url-decode',
  name: 'URL Decode',
  category: 'Encoding',
  description: 'Decode percent-encoded URL text (decodeURIComponent).',
  params: [],
  detectable: true,
  detectConfidence: (input: string): number => {
    if (input.length === 0) return 0
    const matches = input.match(/%[0-9a-fA-F]{2}/g)
    if (!matches || matches.length === 0) return 0
    const ratio = matches.length / Math.max(input.length / 3, 1)
    return Math.min(0.95, 0.4 + ratio * 0.4)
  },
  run: (input) => {
    const raw = input.data
    if (raw.length === 0) {
      return { data: '', type: 'string' }
    }
    try {
      return { data: decodeURIComponent(raw.replace(/\+/g, ' ')), type: 'string' }
    } catch {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid URL encoding: malformed % sequences',
      }
    }
  },
}
