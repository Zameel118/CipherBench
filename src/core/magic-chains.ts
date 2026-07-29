import type { Recipe } from './types'
import { suggestOperations, type MagicSuggestion } from './magic'
import { runRecipe } from './recipe-engine'
import { operationsMap, getAllOperations } from '../operations'
import { findFlagMatches, DEFAULT_FLAG_PATTERN } from './flag-pattern'

export interface MagicChainSuggestion {
  id: string
  name: string
  score: number
  reason: string
  recipe: Recipe
  preview?: string
}

const PRESET_CHAINS: { id: string; name: string; reason: string; recipe: Recipe; gate?: (input: string) => number }[] = [
  {
    id: 'b64',
    name: 'From Base64',
    reason: 'Looks like Base64',
    recipe: [{ operationId: 'base64-decode', params: { alphabet: 'standard' } }],
    gate: (i) => (/^[A-Za-z0-9+/=\s]+$/.test(i.trim()) && i.trim().length >= 8 ? 0.7 : 0),
  },
  {
    id: 'b64-url',
    name: 'From Base64 (URL-safe)',
    reason: 'URL-safe Base64 alphabet',
    recipe: [{ operationId: 'base64-decode', params: { alphabet: 'url-safe' } }],
    gate: (i) => (/^[A-Za-z0-9_=\-]+$/.test(i.trim()) && /[-_]/.test(i) ? 0.65 : 0),
  },
  {
    id: 'hex',
    name: 'From Hex',
    reason: 'Hex digits',
    recipe: [{ operationId: 'hex-decode', params: {} }],
    gate: (i) => (/^(?:[0-9a-fA-F]{2}[\s:]*)+$/.test(i.trim()) && i.replace(/\s/g, '').length >= 8 ? 0.7 : 0),
  },
  {
    id: 'url',
    name: 'URL Decode',
    reason: 'Percent-encoding present',
    recipe: [{ operationId: 'url-decode', params: {} }],
    gate: (i) => (/%[0-9a-fA-F]{2}/.test(i) ? 0.75 : 0),
  },
  {
    id: 'b64-gunzip',
    name: 'Base64 → Gunzip',
    reason: 'Base64 may wrap gzip',
    recipe: [
      { operationId: 'base64-decode', params: { alphabet: 'standard' } },
      { operationId: 'gzip-decompress', params: {} },
    ],
    gate: (i) => (/^[A-Za-z0-9+/=\s]+$/.test(i.trim()) && i.trim().length >= 16 ? 0.4 : 0),
  },
  {
    id: 'html-entities',
    name: 'From HTML Entities',
    reason: 'HTML entities detected',
    recipe: [{ operationId: 'html-entity-decode', params: {} }],
    gate: (i) => (/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/.test(i) ? 0.8 : 0),
  },
  {
    id: 'jwt-decode',
    name: 'JWT Decode',
    reason: 'Three-part JWT shape',
    recipe: [{ operationId: 'jwt-decode', params: { secret: '' } }],
    gate: (i) => (i.trim().split('.').length === 3 ? 0.85 : 0),
  },
  {
    id: 'ps-encoded',
    name: 'PowerShell -EncodedCommand',
    reason: 'Long Base64 typical of PS',
    recipe: [{ operationId: 'powershell-encoded-command', params: { direction: 'decode' } }],
    gate: (i) => {
      const t = i.trim().replace(/\s+/g, '')
      return t.length > 40 && /^[A-Za-z0-9+/=]+$/.test(t) ? 0.35 : 0
    },
  },
  {
    id: 'json-path-root',
    name: 'JSON Path $',
    reason: 'Valid JSON document',
    recipe: [{ operationId: 'json-path', params: { path: '$' } }],
    gate: (i) => {
      try {
        JSON.parse(i.trim())
        return 0.5
      } catch {
        return 0
      }
    },
  },
]

/**
 * Propose full multi-step recipes (CyberChef-style Magic), scored by gate heuristics
 * and optionally by whether the baked output looks more printable / contains flags.
 */
export function suggestMagicChains(input: string, limit = 4): MagicChainSuggestion[] {
  if (!input.trim()) return []

  const scored: MagicChainSuggestion[] = []

  for (const chain of PRESET_CHAINS) {
    const gateScore = chain.gate?.(input) ?? 0.3
    if (gateScore <= 0) continue

    const baked = runRecipe(input, chain.recipe, operationsMap)
    let score = gateScore
    let preview = baked.output.data.slice(0, 80)
    if (baked.output.error) {
      score *= 0.25
      preview = baked.output.error
    } else {
      const flags = findFlagMatches(baked.output.data, DEFAULT_FLAG_PATTERN)
      if (flags.length) score = Math.min(1, score + 0.25)
      const printable = [...baked.output.data.slice(0, 200)].filter((c) => {
        const n = c.charCodeAt(0)
        return (n >= 32 && n < 127) || n === 10 || n === 13 || n === 9
      }).length
      const ratio = baked.output.data.length ? printable / Math.min(200, baked.output.data.length) : 0
      if (ratio > 0.85) score = Math.min(1, score + 0.1)
    }

    scored.push({
      id: chain.id,
      name: chain.name,
      score,
      reason: chain.reason,
      recipe: chain.recipe,
      preview,
    })
  }

  // Also lift top single-op suggestions into one-step chains
  const singles: MagicSuggestion[] = suggestOperations(input, 3, getAllOperations())
  for (const s of singles) {
    if (scored.some((c) => c.recipe.length === 1 && c.recipe[0]?.operationId === s.operationId)) {
      continue
    }
    scored.push({
      id: `op-${s.operationId}`,
      name: s.name,
      score: s.score * 0.9,
      reason: s.reason,
      recipe: [{ operationId: s.operationId, params: {} }],
    })
  }

  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  return scored.slice(0, limit)
}
