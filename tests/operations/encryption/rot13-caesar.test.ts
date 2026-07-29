import { describe, expect, it } from 'vitest'
import { rot13Caesar } from '../../../src/operations/encryption/rot13-caesar'

describe('rot13-caesar', () => {
  it('applies ROT13', () => {
    const result = rot13Caesar.run(
      { data: 'ABCxyz', type: 'string' },
      { shift: 13, bruteForceAllShifts: false },
    )
    expect(result.data).toBe('NOPklm')
  })

  it('handles empty input', () => {
    expect(
      rot13Caesar.run({ data: '', type: 'string' }, { shift: 1, bruteForceAllShifts: false })
        .data,
    ).toBe('')
  })

  it('brute-forces 25 shifts', () => {
    const result = rot13Caesar.run(
      { data: 'A', type: 'string' },
      { shift: 0, bruteForceAllShifts: true },
    )
    const lines = result.data.split('\n')
    expect(lines).toHaveLength(25)
    expect(lines[0]).toMatch(/^shift  1:/)
    expect(lines[24]).toMatch(/^shift 25:/)
  })

  it('preserves non-letters', () => {
    const result = rot13Caesar.run(
      { data: 'Flag{test_123}', type: 'string' },
      { shift: 1, bruteForceAllShifts: false },
    )
    expect(result.data).toBe('Gmbh{uftu_123}')
  })
})
