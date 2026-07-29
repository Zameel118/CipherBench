/** Default CTF-style flag pattern (FLAG{...}, CTF{...}, etc.). */
export const DEFAULT_FLAG_PATTERN = String.raw`[A-Za-z0-9_]+\{[^}]+\}`

export interface FlagMatch {
  text: string
  index: number
  end: number
}

/**
 * Reject patterns that are likely to cause catastrophic backtracking.
 * This is heuristic, not complete — keeps user regex reasonably safe.
 */
export function validateFlagPattern(pattern: string): string | undefined {
  if (pattern.length === 0) {
    return 'Pattern cannot be empty'
  }
  if (pattern.length > 200) {
    return 'Pattern is too long (max 200 characters)'
  }
  // Nested quantifiers on groups, e.g. (a+)+ or (.+)+
  if (/\([^)]*[+*][^)]*\)[+*]/.test(pattern)) {
    return 'Pattern uses nested quantifiers that may be unsafe'
  }
  return undefined
}

export function compileFlagRegex(
  pattern: string,
): { regex: RegExp | null; error?: string } {
  const validation = validateFlagPattern(pattern)
  if (validation) {
    return { regex: null, error: validation }
  }
  try {
    return { regex: new RegExp(pattern, 'g') }
  } catch {
    return { regex: null, error: 'Invalid regular expression' }
  }
}

export function findFlagMatches(text: string, pattern: string): FlagMatch[] {
  const { regex, error } = compileFlagRegex(pattern)
  if (!regex || error) {
    return []
  }

  const matches: FlagMatch[] = []
  const seen = new Set<string>()
  for (const match of text.matchAll(regex)) {
    const textMatch = match[0]
    if (!textMatch || match.index === undefined) continue
    if (seen.has(textMatch)) continue
    seen.add(textMatch)
    matches.push({
      text: textMatch,
      index: match.index,
      end: match.index + textMatch.length,
    })
  }
  return matches
}

/** Higher score = stronger / more flag-like match for ranking brute-force hits. */
export function flagMatchConfidence(match: string): number {
  let score = 0.5
  if (match.length >= 8) score += 0.1
  if (match.length >= 16) score += 0.1
  if (/^(FLAG|CTF|flag|ctf)\{/i.test(match)) score += 0.2
  if (/^[A-Za-z0-9_]+\{[A-Za-z0-9_-]+\}$/.test(match)) score += 0.1
  return Math.min(1, score)
}
