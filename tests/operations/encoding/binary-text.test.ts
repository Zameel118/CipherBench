import { describe, expect, it } from 'vitest'
import { binaryToText, textToBinary } from '../../../src/operations/encoding/binary-text'

describe('binary ↔ text', () => {
  it('round-trips with spaces', () => {
    const bin = textToBinary.run({ data: 'A', type: 'string' }, { separator: 'space' })
    const text = binaryToText.run({ data: bin.data, type: 'string' }, {})
    expect(text.data).toBe('A')
  })

  it('handles empty input', () => {
    expect(textToBinary.run({ data: '', type: 'string' }, {}).data).toBe('')
    expect(binaryToText.run({ data: '', type: 'string' }, {}).data).toBe('')
  })

  it('rejects invalid binary groups', () => {
    const result = binaryToText.run({ data: '101', type: 'string' }, {})
    expect(result.error).toBeDefined()
  })

  it('supports unicode code units', () => {
    const bin = textToBinary.run({ data: 'ñ', type: 'string' }, { separator: 'space' })
    const text = binaryToText.run({ data: bin.data, type: 'string' }, {})
    expect(text.data).toBe('ñ')
  })
})
