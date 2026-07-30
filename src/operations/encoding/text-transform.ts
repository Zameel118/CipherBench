import type { Operation } from '../../core/types'
import { stringFromCharCodes } from '../../core/char-codes'

export const reverseString: Operation = {
  id: 'reverse-string',
  name: 'Reverse',
  category: 'Encoding',
  description: 'Reverse by character (Unicode-aware), byte (latin1 code units), or line.',
  params: [
    {
      name: 'by',
      type: 'select',
      default: 'character',
      options: ['character', 'byte', 'line'],
    },
  ],
  run: (input, params) => {
    const by = String(params.by ?? 'character')
    if (!input.data) return { data: '', type: 'string' }

    if (by === 'line') {
      const endsWithNl = /\r?\n$/.test(input.data)
      const lines = input.data.split(/\r?\n/)
      if (endsWithNl && lines[lines.length - 1] === '') lines.pop()
      lines.reverse()
      return { data: lines.join('\n') + (endsWithNl ? '\n' : ''), type: 'string' }
    }

    if (by === 'byte') {
      // Reverse UTF-16 code units that fit in a byte (pipeline latin1); for
      // higher code units reverse code-unit order (same as CyberChef "Byte"
      // on ArrayBuffer views when input is already byte-oriented).
      const codes = []
      for (let i = 0; i < input.data.length; i++) {
        codes.push(input.data.charCodeAt(i) & 0xff)
      }
      codes.reverse()
      return { data: stringFromCharCodes(codes), type: 'string' }
    }

    // character (default) — Unicode code points
    const chars = [...input.data]
    chars.reverse()
    return { data: chars.join(''), type: 'string' }
  },
}

export const toUppercase: Operation = {
  id: 'to-uppercase',
  name: 'Uppercase',
  category: 'Encoding',
  description: 'Convert text to uppercase.',
  params: [],
  run: (input) => ({ data: input.data.toUpperCase(), type: 'string' }),
}

export const toLowercase: Operation = {
  id: 'to-lowercase',
  name: 'Lowercase',
  category: 'Encoding',
  description: 'Convert text to lowercase.',
  params: [],
  run: (input) => ({ data: input.data.toLowerCase(), type: 'string' }),
}

export const normalizeWhitespace: Operation = {
  id: 'normalize-whitespace',
  name: 'Normalize Whitespace',
  category: 'Encoding',
  description: 'Trim edges and collapse internal runs of whitespace to a single space.',
  params: [],
  run: (input) => ({
    data: input.data.trim().replace(/\s+/g, ' '),
    type: 'string',
  }),
}

export const trimWhitespace: Operation = {
  id: 'trim-whitespace',
  name: 'Trim Whitespace',
  category: 'Encoding',
  description: 'Remove leading and trailing whitespace only.',
  params: [],
  run: (input) => ({ data: input.data.trim(), type: 'string' }),
}
