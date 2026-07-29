import type { Operation } from '../../core/types'

const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
}

function encodeHtmlEntities(text: string, mode: string): string {
  return [...text]
    .map((ch) => {
      const code = ch.codePointAt(0)!
      if (mode === 'named') {
        if (ch === '&') return '&amp;'
        if (ch === '<') return '&lt;'
        if (ch === '>') return '&gt;'
        if (ch === '"') return '&quot;'
        if (ch === "'") return '&apos;'
      }
      if (mode === 'hex') return `&#x${code.toString(16)};`
      return `&#${code};`
    })
    .join('')
}

function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (full, body: string) => {
    if (body[0] === '#') {
      const hex = body[1]?.toLowerCase() === 'x'
      const n = parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10)
      if (!Number.isFinite(n)) return full
      try {
        return String.fromCodePoint(n)
      } catch {
        return full
      }
    }
    return NAMED[body.toLowerCase()] ?? full
  })
}

export const htmlEntityEncode: Operation = {
  id: 'html-entity-encode',
  name: 'To HTML Entities',
  category: 'Encoding',
  description: 'Encode characters as HTML entities (named, decimal, or hex).',
  params: [
    {
      name: 'mode',
      type: 'select',
      default: 'named',
      options: ['named', 'decimal', 'hex'],
    },
  ],
  run: (input, params) => {
    if (!input.data) return { data: '', type: 'string' }
    const mode = String(params.mode ?? 'named')
    return { data: encodeHtmlEntities(input.data, mode), type: 'string' }
  },
}

export const htmlEntityDecode: Operation = {
  id: 'html-entity-decode',
  name: 'From HTML Entities',
  category: 'Encoding',
  description: 'Decode HTML named and numeric character references.',
  params: [],
  detectable: true,
  detectConfidence: (input) => (/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/.test(input) ? 0.7 : 0),
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    return { data: decodeHtmlEntities(input.data), type: 'string' }
  },
}

export const punycodeEncode: Operation = {
  id: 'punycode-encode',
  name: 'To Punycode',
  category: 'Encoding',
  description: 'Encode a Unicode domain label with punycode (via URL API host conversion).',
  params: [],
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      const host = input.data.trim()
      const url = new URL(`http://${host}`)
      return { data: url.hostname, type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Punycode encode failed' }
    }
  },
}

export const punycodeDecode: Operation = {
  id: 'punycode-decode',
  name: 'From Punycode',
  category: 'Encoding',
  description: 'Decode a punycode/IDNA host to Unicode where the browser supports it.',
  params: [],
  detectable: true,
  detectConfidence: (input) => (/^xn--/i.test(input.trim()) ? 0.75 : 0),
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      const host = input.data.trim()
      // URL parser returns Unicode hostname in modern browsers for xn-- labels
      const url = new URL(`http://${host}`)
      return { data: url.hostname, type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Punycode decode failed' }
    }
  },
}
