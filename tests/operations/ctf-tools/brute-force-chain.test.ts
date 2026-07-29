import { describe, expect, it } from 'vitest'
import { Base64 } from 'js-base64'
import {
  bruteForceChain,
  runBruteForceChains,
} from '../../../src/operations/ctf-tools/brute-force-chain'

describe('brute-force-chain', () => {
  it('finds flag after base64 decode chain', () => {
    const plain = 'FLAG{from_base64}'
    const input = Base64.encode(plain)
    const { hits } = runBruteForceChains(input)
    expect(hits.some((h) => h.flags.includes(plain))).toBe(true)
  })

  it('handles empty input', () => {
    expect(runBruteForceChains('').hits).toEqual([])
  })

  it('operation formats ranked output', () => {
    const input = Base64.encode('CTF{chain_op}')
    const result = bruteForceChain.run({ data: input, type: 'string' }, {})
    expect(result.error).toBeUndefined()
    expect(result.data).toMatch(/confidence/)
    expect(result.data).toContain('CTF{chain_op}')
  })

  it('returns message when no hits', () => {
    const result = bruteForceChain.run({ data: 'plain text', type: 'string' }, {})
    expect(result.data).toMatch(/no flag matches/i)
  })
})
