import type { Operation } from '../../core/types'

export const reverseString: Operation = {
  id: 'reverse-string',
  name: 'Reverse',
  category: 'Encoding',
  description: 'Reverse character order (Unicode-aware).',
  params: [],
  run: (input) => {
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
