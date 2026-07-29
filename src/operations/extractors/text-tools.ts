import type { Operation } from '../../core/types'
import { MAX_REGEX_MATCHES, REGEX_WORKER_TIMEOUT_MS, validateFlagPattern } from '../../core/flag-pattern'

export const regexExtract: Operation = {
  id: 'regex-extract',
  name: 'Regex Extract',
  category: 'Extractors',
  description: 'Extract all matches of a regex (global). Supports capture groups.',
  params: [
    { name: 'pattern', type: 'string', default: String.raw`\w+` },
    { name: 'flags', type: 'string', default: 'g' },
    {
      name: 'output',
      type: 'select',
      default: 'full',
      options: ['full', 'groups'],
    },
  ],
  run: (input, params) => {
    if (!input.data) return { data: '', type: 'string' }
    const pattern = String(params.pattern ?? '')
    const flags = String(params.flags ?? 'g')
    const mode = String(params.output ?? 'full')
    const shapeErr = validateFlagPattern(pattern)
    // Allow slightly more patterns than flags, but still reject nested quantifiers
    if (shapeErr && /unsafe|nested|alternation|repeated/i.test(shapeErr)) {
      return { data: input.data, type: 'string', error: shapeErr }
    }
    if (!pattern) {
      return { data: input.data, type: 'string', error: 'Pattern cannot be empty' }
    }
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`)
      const lines: string[] = []
      const started = performance.now()
      let count = 0
      for (const m of input.data.matchAll(re)) {
        if (++count > MAX_REGEX_MATCHES) break
        if (performance.now() - started > REGEX_WORKER_TIMEOUT_MS) break
        if (mode === 'groups' && m.length > 1) {
          lines.push(m.slice(1).join('\t'))
        } else {
          lines.push(m[0] ?? '')
        }
      }
      return {
        data: lines.length ? lines.join('\n') : '(no matches)',
        type: 'string',
      }
    } catch {
      return { data: input.data, type: 'string', error: 'Invalid regular expression' }
    }
  },
}

export const findReplace: Operation = {
  id: 'find-replace',
  name: 'Find / Replace',
  category: 'Extractors',
  description: 'Replace matches of a regex or literal string.',
  params: [
    { name: 'find', type: 'string', default: '' },
    { name: 'replace', type: 'string', default: '' },
    {
      name: 'mode',
      type: 'select',
      default: 'regex',
      options: ['regex', 'literal'],
    },
    { name: 'flags', type: 'string', default: 'g' },
  ],
  run: (input, params) => {
    const find = String(params.find ?? '')
    const replace = String(params.replace ?? '')
    const mode = String(params.mode ?? 'regex')
    const flags = String(params.flags ?? 'g')
    if (!find) return { data: input.data, type: 'string' }
    try {
      if (mode === 'literal') {
        const esc = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return {
          data: input.data.replace(new RegExp(esc, flags.includes('g') ? flags : `${flags}g`), replace),
          type: 'string',
        }
      }
      const shapeErr = validateFlagPattern(find)
      if (shapeErr && /unsafe|nested|alternation|repeated/i.test(shapeErr)) {
        return { data: input.data, type: 'string', error: shapeErr }
      }
      return {
        data: input.data.replace(new RegExp(find, flags), replace),
        type: 'string',
      }
    } catch {
      return { data: input.data, type: 'string', error: 'Find/Replace failed: invalid pattern' }
    }
  },
}

function getByPath(root: unknown, path: string): unknown {
  const cleaned = path.replace(/^\$\.?/, '').trim()
  if (!cleaned) return root
  const parts = cleaned.match(/[^.[\]]+|\[(?:\d+|"(?:\\.|[^"])*"|'(?:\\.|[^'])*')\]/g) ?? []
  let cur: unknown = root
  for (let raw of parts) {
    if (cur == null) return undefined
    if (raw.startsWith('[') && raw.endsWith(']')) {
      raw = raw.slice(1, -1)
      if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
        raw = raw.slice(1, -1)
      }
      const idx = Number(raw)
      if (Array.isArray(cur) && Number.isInteger(idx)) cur = cur[idx]
      else if (typeof cur === 'object') cur = (cur as Record<string, unknown>)[raw]
      else return undefined
    } else if (typeof cur === 'object') {
      cur = (cur as Record<string, unknown>)[raw]
    } else return undefined
  }
  return cur
}

export const jsonPathQuery: Operation = {
  id: 'json-path',
  name: 'JSON Path',
  category: 'Data Format',
  description: 'Parse JSON and extract a simple path (e.g. $.user.name or items[0].id).',
  params: [{ name: 'path', type: 'string', default: '$' }],
  detectable: true,
  detectConfidence: (input) => {
    const t = input.trim()
    if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
      try {
        JSON.parse(t)
        return 0.6
      } catch {
        return 0
      }
    }
    return 0
  },
  run: (input, params) => {
    if (!input.data.trim()) return { data: '', type: 'string' }
    try {
      const json = JSON.parse(input.data)
      const path = String(params.path ?? '$')
      const value = getByPath(json, path)
      if (value === undefined) {
        return { data: input.data, type: 'string', error: `Path not found: ${path}` }
      }
      return {
        data: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
        type: 'string',
      }
    } catch {
      return { data: input.data, type: 'string', error: 'Invalid JSON' }
    }
  },
}
