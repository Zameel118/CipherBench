import type { Operation } from '../../core/types'

function shiftChar(ch: string, shift: number): string {
  const code = ch.charCodeAt(0)
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65)
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97)
  }
  return ch
}

function caesarShift(text: string, shift: number): string {
  return [...text].map((ch) => shiftChar(ch, shift)).join('')
}

export const rot13Caesar: Operation = {
  id: 'rot13-caesar',
  name: 'ROT13 / Caesar',
  category: 'Encryption',
  description:
    'Caesar cipher on A–Z and a–z. Use shift 13 for ROT13, or brute-force all non-zero shifts.',
  params: [
    {
      name: 'shift',
      type: 'number',
      default: 13,
    },
    {
      name: 'bruteForceAllShifts',
      type: 'boolean',
      default: false,
    },
  ],
  run: (input, params) => {
    const raw = input.data
    if (raw.length === 0) {
      return { data: '', type: 'string' }
    }

    if (params.bruteForceAllShifts === true) {
      const lines: string[] = []
      for (let s = 1; s <= 25; s++) {
        lines.push(`shift ${String(s).padStart(2, ' ')}: ${caesarShift(raw, s)}`)
      }
      return { data: lines.join('\n'), type: 'string' }
    }

    const shiftNum = Number(params.shift)
    if (!Number.isFinite(shiftNum)) {
      return {
        data: raw,
        type: 'string',
        error: 'Invalid shift: must be a number',
      }
    }

    const normalized = ((Math.trunc(shiftNum) % 26) + 26) % 26
    return { data: caesarShift(raw, normalized), type: 'string' }
  },
}
