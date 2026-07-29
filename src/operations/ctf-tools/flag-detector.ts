import {
  DEFAULT_FLAG_PATTERN,
  compileFlagRegex,
  findFlagMatches,
  validateFlagPattern,
} from '../../core/flag-pattern'
import type { Operation } from '../../core/types'

export { DEFAULT_FLAG_PATTERN, findFlagMatches, validateFlagPattern }

/**
 * Lists flag-shaped substrings in the input (same pattern used for output highlighting).
 */
export const flagDetector: Operation = {
  id: 'flag-detector',
  name: 'Find Flags',
  category: 'CTF Tools',
  description:
    'Extract substrings matching the configured flag pattern (default CTF-style FLAG{...}).',
  params: [
    {
      name: 'pattern',
      type: 'string',
      default: DEFAULT_FLAG_PATTERN,
    },
  ],
  run: (input, params) => {
    const pattern = String(params.pattern ?? DEFAULT_FLAG_PATTERN)
    const validation = validateFlagPattern(pattern)
    if (validation) {
      return {
        data: input.data,
        type: 'string',
        error: validation,
      }
    }
    const { error: compileError } = compileFlagRegex(pattern)
    if (compileError) {
      return {
        data: input.data,
        type: 'string',
        error: compileError,
      }
    }

    const matches = findFlagMatches(input.data, pattern)
    if (matches.length === 0) {
      return { data: '(no flags found)', type: 'string' }
    }

    const lines = matches.map((m, i) => `${i + 1}. ${m.text}`)
    return { data: lines.join('\n'), type: 'string' }
  },
}
