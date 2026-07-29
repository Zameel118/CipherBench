import { describe, expect, it } from 'vitest'
import { stringFromCharCodes } from '../../src/core/char-codes'

describe('stringFromCharCodes', () => {
  it('builds strings from many code units without throwing', () => {
    const codes = Array.from({ length: 50_000 }, (_, i) => 65 + (i % 26))
    const text = stringFromCharCodes(codes)
    expect(text.length).toBe(50_000)
    expect(text.startsWith('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(true)
  })
})
