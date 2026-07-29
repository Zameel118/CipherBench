import type { Operation } from '../../core/types'

export const textToBinary: Operation = {
  id: 'text-to-binary',
  name: 'Text to Binary',
  category: 'Encoding',
  description: 'Convert each character to 8-bit binary, space-separated.',
  params: [
    {
      name: 'separator',
      type: 'select',
      default: 'space',
      options: ['space', 'none'],
    },
  ],
  run: (input, params) => {
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }
    const parts = [...input.data].map((ch) =>
      ch.charCodeAt(0).toString(2).padStart(8, '0'),
    )
    const sep = params.separator === 'none' ? '' : ' '
    return { data: parts.join(sep), type: 'string' }
  },
}

export const binaryToText: Operation = {
  id: 'binary-to-text',
  name: 'Binary to Text',
  category: 'Encoding',
  description: 'Decode space-separated (or continuous) 8-bit binary into text.',
  params: [],
  run: (input) => {
    const raw = input.data
    if (raw.length === 0) {
      return { data: '', type: 'string' }
    }

    const cleaned = raw.trim().replace(/\s+/g, ' ')
    const chunks = cleaned.includes(' ')
      ? cleaned.split(' ')
      : cleaned.match(/.{8}/g) ?? []

    if (chunks.length === 0) {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid binary: no 8-bit groups found',
      }
    }

    const chars: string[] = []
    for (const chunk of chunks) {
      if (!/^[01]{8}$/.test(chunk)) {
        return {
          data: raw,
          type: 'string',
          error: `Invalid binary group: "${chunk}" (expected 8 bits)`,
        }
      }
      chars.push(String.fromCharCode(parseInt(chunk, 2)))
    }

    return { data: chars.join(''), type: 'string' }
  },
}
