import { describe, expect, it } from 'vitest'
import {
  normalizeWhitespace,
  reverseString,
  toLowercase,
  toUppercase,
  trimWhitespace,
} from '../../../src/operations/encoding/text-transform'

describe('text transforms', () => {
  it('reverses unicode-aware', () => {
    const result = reverseString.run({ data: 'ab🔥cd', type: 'string' }, {})
    expect(result.data).toBe('dc🔥ba')
  })

  it('uppercase and lowercase', () => {
    expect(toUppercase.run({ data: 'AbC', type: 'string' }, {}).data).toBe('ABC')
    expect(toLowercase.run({ data: 'AbC', type: 'string' }, {}).data).toBe('abc')
  })

  it('trim and normalize whitespace', () => {
    expect(trimWhitespace.run({ data: '  hi  ', type: 'string' }, {}).data).toBe('hi')
    expect(
      normalizeWhitespace.run({ data: '  a   b \n c  ', type: 'string' }, {}).data,
    ).toBe('a b c')
  })

  it('handles empty input', () => {
    expect(reverseString.run({ data: '', type: 'string' }, {}).data).toBe('')
  })
})
