import type { Operation } from '../../core/types'

function shannonBits(text: string): number {
  if (text.length === 0) return 0
  const freq = new Map<number, number>()
  for (let i = 0; i < text.length; i++) {
    const b = text.charCodeAt(i) & 0xff
    freq.set(b, (freq.get(b) ?? 0) + 1)
  }
  let entropy = 0
  for (const count of freq.values()) {
    const p = count / text.length
    entropy -= p * Math.log2(p)
  }
  return entropy
}

function guessKind(bits: number): string {
  if (bits < 1) return 'very low (repetitive / empty-ish)'
  if (bits < 3) return 'low (plain text / encoding likely)'
  if (bits < 5) return 'medium (mixed / lightly obfuscated)'
  if (bits < 6.5) return 'high (compressed or encrypted-looking)'
  return 'very high (random / strong crypto)'
}

export const entropyAnalysis: Operation = {
  id: 'entropy',
  name: 'Entropy',
  category: 'Data Format',
  description:
    'Shannon entropy of input bytes (0–8 bits). High values suggest compression or encryption.',
  params: [],
  detectable: true,
  detectConfidence: (input) => {
    if (input.length < 32) return 0
    const bits = shannonBits(input)
    return bits / 8 > 0.85 ? 0.4 : 0
  },
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    const bits = shannonBits(input.data)
    const normalized = bits / 8
    const unique = new Set([...input.data].map((c) => c.charCodeAt(0) & 0xff)).size
    const lines = [
      `Shannon entropy: ${bits.toFixed(4)} bits / byte`,
      `Normalized (0–1): ${normalized.toFixed(4)}`,
      `Length: ${input.data.length} chars`,
      `Unique byte values: ${unique}`,
      `Assessment: ${guessKind(bits)}`,
    ]
    return { data: lines.join('\n'), type: 'string' }
  },
}
