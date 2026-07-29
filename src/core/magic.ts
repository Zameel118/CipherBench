import type { Operation } from './types'
import { getAllOperations } from '../operations'

export interface MagicSuggestion {
  operationId: string
  name: string
  score: number
  reason: string
}

/**
 * Shannon entropy of raw byte values, normalized to ~0–1 for printable ASCII-ish inputs.
 * High entropy can indicate encryption or compression rather than plain encoding.
 */
export function shannonEntropyNormalized(text: string): number {
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
  // Max entropy for byte stream is 8 bits.
  return entropy / 8
}

function supplementalScore(op: Operation, input: string): number {
  const trimmed = input.trim()
  if (trimmed.length === 0) return 0

  if (op.id === 'xor-cipher') {
    const entropy = shannonEntropyNormalized(trimmed)
    if (entropy > 0.85) return 0.55
    if (entropy > 0.7) return 0.35
  }

  if (op.id === 'rot13-caesar') {
    const letters = trimmed.replace(/[^a-zA-Z]/g, '')
    if (letters.length >= 4 && letters.length / trimmed.length > 0.6) {
      return 0.25
    }
  }

  return 0
}

/**
 * Heuristic auto-detect: scores input against each operation's detectConfidence
 * plus a few explainable supplemental rules (entropy, letter ratio).
 */
export function suggestOperations(
  input: string,
  limit = 3,
  operations: Operation[] = getAllOperations(),
): MagicSuggestion[] {
  const suggestions: MagicSuggestion[] = []

  for (const op of operations) {
    let score = 0
    let reason = ''

    if (op.detectable && op.detectConfidence) {
      score = op.detectConfidence(input)
      if (score > 0) {
        reason = 'Input shape matches this decoder'
      }
    }

    const extra = supplementalScore(op, input)
    if (extra > score) {
      score = extra
      reason =
        op.id === 'xor-cipher'
          ? 'High byte entropy - try XOR'
          : 'Mostly letters - try Caesar shifts'
    }

    if (score > 0) {
      suggestions.push({
        operationId: op.id,
        name: op.name,
        score,
        reason: reason || 'Possible match',
      })
    }
  }

  suggestions.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

  const seen = new Set<string>()
  const unique: MagicSuggestion[] = []
  for (const s of suggestions) {
    if (seen.has(s.operationId)) continue
    seen.add(s.operationId)
    unique.push(s)
    if (unique.length >= limit) break
  }

  return unique
}
