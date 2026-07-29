/// <reference lib="webworker" />

interface FlagMatchPayload {
  text: string
  index: number
  end: number
}

interface WorkerRequest {
  pattern: string
  text: string
  maxMatches: number
}

interface WorkerResponse {
  ok: boolean
  matches?: FlagMatchPayload[]
  error?: string
}

/** Internal wall-clock budget (ms) to prevent runaway regex matching. */
const WALL_CLOCK_BUDGET_MS = 200

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { pattern, text, maxMatches } = event.data
  const response: WorkerResponse = { ok: false }
  try {
    const regex = new RegExp(pattern, 'g')
    const matches: FlagMatchPayload[] = []
    const seen = new Set<string>()
    let count = 0
    const started = performance.now()
    for (const match of text.matchAll(regex)) {
      if (++count > maxMatches) break
      if (performance.now() - started > WALL_CLOCK_BUDGET_MS) break
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
    response.ok = true
    response.matches = matches
  } catch (err) {
    response.error = err instanceof Error ? err.message : String(err)
  }
  self.postMessage(response)
}
