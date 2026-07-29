import { describe, expect, it } from 'vitest'
import { sha1Hash, sha256Hash } from '../../../src/operations/hashing/sha'

describe('sha hashes', () => {
  it('SHA-1 known vector', () => {
    const result = sha1Hash.run({ data: 'hello', type: 'string' }, {})
    expect(result.data).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
  })

  it('SHA-256 known vector', () => {
    const result = sha256Hash.run({ data: 'hello', type: 'string' }, {})
    expect(result.data).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    )
  })

  it('empty input', () => {
    expect(sha1Hash.run({ data: '', type: 'string' }, {}).data).toBe('')
    expect(sha256Hash.run({ data: '', type: 'string' }, {}).data).toBe('')
  })

  it('unicode input produces hex digest', () => {
    const result = sha256Hash.run({ data: '日本語', type: 'string' }, {})
    expect(result.data).toMatch(/^[0-9a-f]{64}$/)
  })
})
