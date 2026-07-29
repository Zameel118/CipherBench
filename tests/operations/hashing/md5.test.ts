import { describe, expect, it } from 'vitest'
import { md5Hash } from '../../../src/operations/hashing/md5'

describe('md5-hash', () => {
  it('hashes known vector', () => {
    const result = md5Hash.run({ data: 'hello', type: 'string' }, {})
    expect(result.error).toBeUndefined()
    expect(result.data).toBe('5d41402abc4b2a76b9719d911017c592')
  })

  it('empty input yields empty output', () => {
    expect(md5Hash.run({ data: '', type: 'string' }, {}).data).toBe('')
  })

  it('unicode input', () => {
    const result = md5Hash.run({ data: '🔥', type: 'string' }, {})
    expect(result.data).toMatch(/^[0-9a-f]{32}$/)
  })
})
