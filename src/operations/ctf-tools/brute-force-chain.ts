import { Base64 } from 'js-base64'
import { inflate } from 'pako'
import {
  DEFAULT_FLAG_PATTERN,
  findFlagMatches,
  flagMatchConfidence,
  validateFlagPattern,
} from '../../core/flag-pattern'
import { runRecipe } from '../../core/recipe-engine'
import type { Operation, Recipe } from '../../core/types'
import { base64Decode } from '../encoding/base64'
import { hexDecode } from '../encoding/hex'
import { urlDecode } from '../encoding/url'
import { xorCipher, printableRatio } from '../encryption/xor'

/** Ops needed for preset chains - avoids circular import via operations/index. */
const chainOperations = new Map<string, Operation>([
  [base64Decode.id, base64Decode],
  [hexDecode.id, hexDecode],
  [urlDecode.id, urlDecode],
  [xorCipher.id, xorCipher],
])

export interface ChainHit {
  chainName: string
  output: string
  flags: string[]
  confidence: number
}

/** Fixed decode chains common in CTF forensics (explainable, not exhaustive). */
const PRESET_CHAINS: { name: string; recipe: Recipe }[] = [
  { name: 'base64', recipe: [{ operationId: 'base64-decode', params: { alphabet: 'standard' } }] },
  { name: 'base64 (url-safe)', recipe: [{ operationId: 'base64-decode', params: { alphabet: 'url-safe' } }] },
  { name: 'hex', recipe: [{ operationId: 'hex-decode', params: {} }] },
  { name: 'url', recipe: [{ operationId: 'url-decode', params: {} }] },
  {
    name: 'base64 → hex',
    recipe: [
      { operationId: 'base64-decode', params: { alphabet: 'standard' } },
      { operationId: 'hex-decode', params: {} },
    ],
  },
  {
    name: 'hex → base64',
    recipe: [
      { operationId: 'hex-decode', params: {} },
      { operationId: 'base64-decode', params: { alphabet: 'standard' } },
    ],
  },
]

function tryBase64ThenGzip(input: string): string | null {
  const trimmed = input.trim().replace(/\s+/g, '')
  if (trimmed.length === 0) return null
  let binary: string
  try {
    binary = Base64.decode(trimmed)
  } catch {
    return null
  }
  const bytes = new Uint8Array([...binary].map((c) => c.charCodeAt(0) & 0xff))
  try {
    const inflated = inflate(bytes)
    return new TextDecoder('utf-8', { fatal: false }).decode(inflated)
  } catch {
    return null
  }
}

function collectXorBruteforceLines(baseInput: string, pattern: string): ChainHit[] {
  const hits: ChainHit[] = []
  const b64 = runRecipe(
    baseInput,
    [{ operationId: 'base64-decode', params: { alphabet: 'standard' } }],
    chainOperations,
  )
  if (b64.output.error) return hits

  const xor = xorCipher
  const brute = xor.run(
    { data: b64.output.data, type: 'string' },
    { mode: 'single-byte', key: '0x00', bruteForceSingleByte: true },
  )
  if (brute.error) return hits

  for (const line of brute.data.split('\n')) {
    const m = line.match(/^key .+ score [\d.]+: (.*)$/)
    if (!m) continue
    const candidate = m[1]!
    const flags = findFlagMatches(candidate, pattern).map((m) => m.text)
    if (flags.length === 0) continue
    const flagScore = Math.max(...flags.map(flagMatchConfidence))
    const printable = printableRatio(candidate)
    hits.push({
      chainName: 'base64 → XOR single-byte brute force',
      output: candidate,
      flags,
      confidence: flagScore * 0.7 + printable * 0.3,
    })
  }
  return hits
}

export function runBruteForceChains(
  input: string,
  pattern: string = DEFAULT_FLAG_PATTERN,
): { hits: ChainHit[]; error?: string } {
  const validation = validateFlagPattern(pattern)
  if (validation) {
    return { hits: [], error: validation }
  }
  if (input.length === 0) {
    return { hits: [] }
  }

  const hits: ChainHit[] = []

  for (const chain of PRESET_CHAINS) {
    const result = runRecipe(input, chain.recipe, chainOperations)
    if (result.output.error) continue
    const flags = findFlagMatches(result.output.data, pattern).map((m) => m.text)
    if (flags.length === 0) continue
    hits.push({
      chainName: chain.name,
      output: result.output.data,
      flags,
      confidence: Math.max(...flags.map(flagMatchConfidence)),
    })
  }

  const gzipText = tryBase64ThenGzip(input)
  if (gzipText) {
    const flags = findFlagMatches(gzipText, pattern).map((m) => m.text)
    if (flags.length > 0) {
      hits.push({
        chainName: 'base64 → gzip inflate',
        output: gzipText,
        flags,
        confidence: Math.max(...flags.map(flagMatchConfidence)),
      })
    }
  }

  hits.push(...collectXorBruteforceLines(input, pattern))

  hits.sort((a, b) => b.confidence - a.confidence || b.flags[0]!.localeCompare(a.flags[0]!))

  const deduped: ChainHit[] = []
  const seenOutputs = new Set<string>()
  for (const hit of hits) {
    const key = `${hit.chainName}::${hit.output}`
    if (seenOutputs.has(key)) continue
    seenOutputs.add(key)
    deduped.push(hit)
  }

  return { hits: deduped }
}

export const bruteForceChain: Operation = {
  id: 'brute-force-chain',
  name: 'Brute-Force Decode Chains',
  category: 'CTF Tools',
  description:
    'Try common decode chains (Base64, hex, gzip, XOR brute force) and list outputs that match the flag pattern.',
  params: [
    {
      name: 'pattern',
      type: 'string',
      default: DEFAULT_FLAG_PATTERN,
    },
  ],
  run: (input, params) => {
    const pattern = String(params.pattern ?? DEFAULT_FLAG_PATTERN)
    const { hits, error } = runBruteForceChains(input.data, pattern)
    if (error) {
      return { data: input.data, type: 'string', error }
    }
    if (hits.length === 0) {
      return { data: '(no flag matches from preset chains)', type: 'string' }
    }

    const lines = hits.map((h, i) => {
      const flagList = h.flags.join(', ')
      return [
        `${i + 1}. [${h.chainName}] confidence ${h.confidence.toFixed(3)}`,
        `   flags: ${flagList}`,
        `   output: ${h.output.length > 200 ? `${h.output.slice(0, 200)}…` : h.output}`,
      ].join('\n')
    })

    return { data: lines.join('\n\n'), type: 'string' }
  },
}
