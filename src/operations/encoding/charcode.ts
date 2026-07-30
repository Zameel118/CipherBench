import type { Operation } from '../../core/types'

function toCodes(text: string, base: string, delimiter: string): string {
  const codes = [...text].map((ch) => {
    const n = ch.codePointAt(0)!
    if (base === 'hex') return n.toString(16)
    if (base === 'octal') return n.toString(8)
    if (base === 'binary') return n.toString(2)
    return String(n)
  })
  const sep =
    delimiter === 'space'
      ? ' '
      : delimiter === 'comma'
        ? ','
        : delimiter === 'semicolon'
          ? ';'
          : delimiter === '0x'
            ? ' 0x'
            : delimiter === '\\x'
              ? ''
              : ' '
  if (delimiter === '0x') {
    return codes.map((c) => (base === 'hex' ? `0x${c}` : c)).join(' ')
  }
  if (delimiter === '\\x') {
    return codes.map((c) => (base === 'hex' ? `\\x${c.padStart(2, '0')}` : c)).join('')
  }
  return codes.join(sep === ' ' || sep === ',' || sep === ';' ? sep : ' ')
}

function fromCodes(raw: string, base: string): { text?: string; error?: string } {
  let tokens: string[] = []
  const cleaned = raw.trim()
  if (!cleaned) return { text: '' }

  if (/\\x[0-9a-fA-F]+/i.test(cleaned)) {
    tokens = [...cleaned.matchAll(/\\x([0-9a-fA-F]+)/gi)].map((m) => m[1]!)
  } else if (/0x[0-9a-fA-F]+/i.test(cleaned)) {
    tokens = [...cleaned.matchAll(/0x([0-9a-fA-F]+)/gi)].map((m) => m[1]!)
  } else {
    tokens = cleaned.split(/[\s,;]+/).filter(Boolean)
  }

  if (tokens.length === 0) {
    return { error: 'No charcodes found' }
  }

  const radix = base === 'hex' ? 16 : base === 'octal' ? 8 : base === 'binary' ? 2 : 10
  const cps: number[] = []
  for (const t of tokens) {
    const n = parseInt(t.replace(/^0x/i, ''), radix)
    if (!Number.isFinite(n) || n < 0 || n > 0x10ffff) {
      return { error: `Invalid code: ${t}` }
    }
    cps.push(n)
  }
  try {
    return { text: String.fromCodePoint(...cps) }
  } catch {
    // chunk for large arrays
    let out = ''
    for (const n of cps) out += String.fromCodePoint(n)
    return { text: out }
  }
}

export const toCharcode: Operation = {
  id: 'to-charcode',
  name: 'To Charcode',
  category: 'Encoding',
  description: 'Convert characters to code points (decimal, hex, octal, or binary).',
  params: [
    {
      name: 'base',
      type: 'select',
      default: 'decimal',
      options: ['decimal', 'hex', 'octal', 'binary'],
    },
    {
      name: 'delimiter',
      type: 'select',
      default: 'space',
      options: ['space', 'comma', 'semicolon', '0x', '\\x'],
    },
  ],
  run: (input, params) => {
    if (!input.data) return { data: '', type: 'string' }
    const base = String(params.base ?? 'decimal')
    const delimiter = String(params.delimiter ?? 'space')
    return { data: toCodes(input.data, base, delimiter), type: 'string' }
  },
}

export const fromCharcode: Operation = {
  id: 'from-charcode',
  name: 'From Charcode',
  category: 'Encoding',
  description: 'Convert space/comma/0x/\\x separated code points back to text.',
  params: [
    {
      name: 'base',
      type: 'select',
      default: 'decimal',
      options: ['decimal', 'hex', 'octal', 'binary'],
    },
  ],
  detectable: true,
  detectConfidence: (input) => {
    const t = input.trim()
    if (/^(?:\d{1,3}[\s,;]+){3,}\d{1,3}$/.test(t)) return 0.55
    if (/(?:0x|\\x)[0-9a-fA-F]+/i.test(t) && t.length >= 8) return 0.5
    return 0
  },
  run: (input, params) => {
    if (!input.data.trim()) return { data: '', type: 'string' }
    const base = String(params.base ?? 'decimal')
    // Auto-detect hex delimiters
    const effectiveBase =
      /(?:0x|\\x)[0-9a-fA-F]/i.test(input.data) && base === 'decimal' ? 'hex' : base
    const { text, error } = fromCodes(input.data, effectiveBase)
    if (error) return { data: input.data, type: 'string', error }
    return { data: text ?? '', type: 'string' }
  },
}
