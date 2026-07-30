import type { Operation } from '../../core/types'

function vigenere(text: string, key: string, decrypt: boolean): string {
  const letters = key.toUpperCase().replace(/[^A-Z]/g, '')
  if (!letters) return text
  let ki = 0
  return [...text]
    .map((ch) => {
      const code = ch.charCodeAt(0)
      let base: number | null = null
      if (code >= 65 && code <= 90) base = 65
      else if (code >= 97 && code <= 122) base = 97
      if (base === null) return ch
      const shift = letters.charCodeAt(ki % letters.length)! - 65
      ki++
      const offset = code - base
      const next = decrypt
        ? (offset - shift + 26) % 26
        : (offset + shift) % 26
      return String.fromCharCode(base + next)
    })
    .join('')
}

export const vigenereCipher: Operation = {
  id: 'vigenere',
  name: 'Vigenère Cipher',
  category: 'Encryption',
  description: 'Classic Vigenère encode/decode on A–Z / a–z with an alphabetic key.',
  params: [
    {
      name: 'direction',
      type: 'select',
      default: 'decrypt',
      options: ['encrypt', 'decrypt'],
    },
    {
      name: 'key',
      type: 'string',
      default: 'KEY',
    },
  ],
  run: (input, params) => {
    if (!input.data) return { data: '', type: 'string' }
    const key = String(params.key ?? '')
    if (!/[A-Za-z]/.test(key)) {
      return { data: input.data, type: 'string', error: 'Vigenère key must contain letters' }
    }
    const decrypt = String(params.direction ?? 'decrypt') !== 'encrypt'
    return { data: vigenere(input.data, key, decrypt), type: 'string' }
  },
}
