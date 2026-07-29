/** Default CTF-style flag pattern (FLAG{...}, CTF{...}, etc.). */
export const DEFAULT_FLAG_PATTERN = String.raw`[A-Za-z0-9_]+\{[^}]+\}`

export const MAX_FLAG_PATTERN_LENGTH = 200
/** Only this prefix of input is scanned when matching flags (ReDoS / cost guard). */
export const MAX_REGEX_SCAN_CHARS = 256_000
export const MAX_REGEX_MATCHES = 500
export const REGEX_WORKER_TIMEOUT_MS = 250

export interface FlagMatch {
  text: string
  index: number
  end: number
}

/**
 * Reject patterns that are likely to cause catastrophic backtracking.
 * Heuristic, not complete — paired with scan limits and optional worker timeout.
 */
export function validateFlagPattern(pattern: string): string | undefined {
  if (pattern.length === 0) {
    return 'Pattern cannot be empty'
  }
  if (pattern.length > MAX_FLAG_PATTERN_LENGTH) {
    return `Pattern is too long (max ${MAX_FLAG_PATTERN_LENGTH} characters)`
  }
  // Nested quantifiers on groups, e.g. (a+)+ or (.+)+
  if (/\([^)]*[+*?][^)]*\)[+*?]/.test(pattern)) {
    return 'Pattern uses nested quantifiers that may be unsafe'
  }
  // Quantified alternation, e.g. (a|a)+ or (.*|x)+
  if (/\([^)]*\|[^)]*\)[+*?]/.test(pattern)) {
    return 'Pattern uses quantified alternation that may be unsafe'
  }
  // Adjacent quantifiers on wildcards, e.g. .*+, .++ 
  if (/(?:\.\*|\.\+)[+*?]/.test(pattern) || /[+*?]{2,}/.test(pattern)) {
    return 'Pattern uses repeated quantifiers that may be unsafe'
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

function scanTextForRegex(text: string): string {
  return text.length > MAX_REGEX_SCAN_CHARS ? text.slice(0, MAX_REGEX_SCAN_CHARS) : text
}

function collectFlagMatchesFromRegex(
  regex: RegExp,
  text: string,
  wallMs: number,
): FlagMatch[] {
  const matches: FlagMatch[] = []
  const seen = new Set<string>()
  const started = typeof performance !== 'undefined' ? performance.now() : Date.now()
  let count = 0

  for (const match of text.matchAll(regex)) {
    if (++count > MAX_REGEX_MATCHES) break
    if (
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - started >
      wallMs
    ) {
      break
    }
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

let regexWorker: Worker | null = null

function getRegexWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null
  if (!regexWorker) {
    regexWorker = new Worker(new URL('./regex-match.worker.ts', import.meta.url), {
      type: 'module',
    })
  }
  return regexWorker
}

/** Run user flag regex in a worker; terminates on timeout (browser only). */
export function findFlagMatchesAsync(
  text: string,
  pattern: string,
): Promise<{ matches: FlagMatch[]; error?: string }> {
  const validation = validateFlagPattern(pattern)
  if (validation) {
    return Promise.resolve({ matches: [], error: validation })
  }
  const compiled = compileFlagRegex(pattern)
  if (compiled.error || !compiled.regex) {
    return Promise.resolve({ matches: [], error: compiled.error ?? 'Invalid regular expression' })
  }

  const worker = getRegexWorker()
  if (!worker) {
    return Promise.resolve({ matches: findFlagMatches(text, pattern) })
  }

  const scanText = scanTextForRegex(text)

  return new Promise((resolve) => {
    let settled = false
    const finish = (result: { matches: FlagMatch[]; error?: string }) => {
      if (settled) return
      settled = true
      worker.removeEventListener('message', onMessage)
      clearTimeout(timer)
      resolve(result)
    }

    const onMessage = (event: MessageEvent<{ ok: boolean; matches?: FlagMatch[]; error?: string }>) => {
      const data = event.data
      if (!data.ok) {
        finish({ matches: [], error: data.error ?? 'Regex match failed' })
        return
      }
      finish({ matches: data.matches ?? [] })
    }

    worker.addEventListener('message', onMessage)
    const timer = setTimeout(() => {
      regexWorker?.terminate()
      regexWorker = null
      finish({
        matches: [],
        error: `Flag pattern matching timed out after ${REGEX_WORKER_TIMEOUT_MS}ms`,
      })
    }, REGEX_WORKER_TIMEOUT_MS)

    worker.postMessage({
      pattern,
      text: scanText,
      maxMatches: MAX_REGEX_MATCHES,
    })
  })
}

export function findFlagMatches(text: string, pattern: string): FlagMatch[] {
  const { regex, error } = compileFlagRegex(pattern)
  if (!regex || error) {
    return []
  }

  const scanText = scanTextForRegex(text)
  return collectFlagMatchesFromRegex(regex, scanText, REGEX_WORKER_TIMEOUT_MS)
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
