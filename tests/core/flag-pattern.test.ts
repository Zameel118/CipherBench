import { describe, expect, it } from 'vitest'
import { Base64 } from 'js-base64'
import {
  DEFAULT_FLAG_PATTERN,
  compileFlagRegex,
  findFlagMatches,
  validateFlagPattern,
} from '../../src/core/flag-pattern'

describe('flag-pattern', () => {
  it('finds default CTF-style flags', () => {
    const text = 'noise FLAG{abc_123} end CTF{x}'
    const matches = findFlagMatches(text, DEFAULT_FLAG_PATTERN)
    expect(matches.map((m) => m.text)).toEqual(['FLAG{abc_123}', 'CTF{x}'])
  })

  it('returns empty for empty input', () => {
    expect(findFlagMatches('', DEFAULT_FLAG_PATTERN)).toEqual([])
  })

  it('rejects unsafe nested quantifiers', () => {
    expect(validateFlagPattern('(a+)+')).toMatch(/unsafe/i)
  })

  it('rejects invalid regex at compile time', () => {
    expect(compileFlagRegex('[').error).toBeDefined()
  })
})
