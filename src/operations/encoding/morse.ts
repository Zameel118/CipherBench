import type { Operation } from '../../core/types'

const MORSE: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  _: '..--.-',
  '"': '.-..-.',
  $: '...-..-',
  '@': '.--.-.',
}

const MORSE_REV: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k]),
)

export const toMorse: Operation = {
  id: 'to-morse',
  name: 'To Morse Code',
  category: 'Encoding',
  description: 'Encode text to Morse (letters/digits/punctuation). Spaces become "/".',
  params: [
    {
      name: 'dotDash',
      type: 'select',
      default: '.-',
      options: ['.-', '01', '•—'],
    },
  ],
  run: (input, params) => {
    if (!input.data) return { data: '', type: 'string' }
    const style = String(params.dotDash ?? '.-')
    const mapDotDash = (code: string) => {
      if (style === '01') return code.replace(/\./g, '0').replace(/-/g, '1')
      if (style === '•—') return code.replace(/\./g, '•').replace(/-/g, '—')
      return code
    }
    const words = input.data.toUpperCase().split(/\s+/)
    const encoded = words
      .map((word) =>
        [...word]
          .map((ch) => {
            const code = MORSE[ch]
            return code ? mapDotDash(code) : ch
          })
          .join(' '),
      )
      .join(' / ')
    return { data: encoded, type: 'string' }
  },
}

export const fromMorse: Operation = {
  id: 'from-morse',
  name: 'From Morse Code',
  category: 'Encoding',
  description: 'Decode Morse (. - or 0/1). Word gaps: / or | or 3+ spaces.',
  params: [],
  detectable: true,
  detectConfidence: (input) => {
    const t = input.trim()
    if (t.length < 3) return 0
    if (/^[.\-\s|/]+$/.test(t) && /[.-]/.test(t)) return 0.7
    if (/^[01\s|/]+$/.test(t) && /[01]/.test(t) && t.length >= 8) return 0.45
    return 0
  },
  run: (input) => {
    if (!input.data.trim()) return { data: '', type: 'string' }
    let s = input.data.trim()
    // Normalize 01 / bullet styles
    s = s.replace(/•/g, '.').replace(/[—–]/g, '-')
    if (/^[01\s|/]+$/.test(s)) {
      s = s.replace(/0/g, '.').replace(/1/g, '-')
    }
    const words = s.split(/\s*\/\s*|\s*\|\s*|\s{3,}/)
    const decoded = words
      .map((word) =>
        word
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((token) => MORSE_REV[token] ?? '?')
          .join(''),
      )
      .join(' ')
    return { data: decoded, type: 'string' }
  },
}
