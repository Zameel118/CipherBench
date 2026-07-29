import { describe, expect, it } from 'vitest'
import { BRUTE_FORCE_MAX_INPUT_CHARS } from '../../src/core/input-limits'
import { xorCipher } from '../../src/operations/encryption/xor'
import { runBruteForceChains } from '../../src/operations/ctf-tools/brute-force-chain'

describe('brute-force input limits', () => {
  it('rejects XOR single-byte brute force over size cap', () => {
    const big = 'x'.repeat(BRUTE_FORCE_MAX_INPUT_CHARS + 1)
    const result = xorCipher.run(
      { data: big, type: 'string' },
      { bruteForceSingleByte: true },
    )
    expect(result.error).toMatch(/too large/i)
  })

  it('rejects brute-force decode chains over size cap', () => {
    const big = 'A'.repeat(BRUTE_FORCE_MAX_INPUT_CHARS + 1)
    const { hits, error } = runBruteForceChains(big)
    expect(hits).toEqual([])
    expect(error).toMatch(/too large/i)
  })
})
