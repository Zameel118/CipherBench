import { describe, expect, it } from 'vitest'
import { defangRefang, defangText, refangText } from '../../../src/operations/soc-tools/defang'

describe('defang-refang', () => {
  it('defangs http and https URLs', () => {
    const input = 'see http://evil.com and https://secure.evil.com/path'
    const result = defangRefang.run({ data: input, type: 'string' }, { mode: 'defang' })
    expect(result.data).toContain('hxxp://')
    expect(result.data).toContain('hxxps://')
    expect(result.data).toContain('evil[.]com')
  })

  it('refangs hxxp and bracketed dots', () => {
    const input = 'hxxps://evil[.]com/path'
    expect(refangText(input)).toBe('https://evil.com/path')
  })

  it('handles empty input', () => {
    expect(defangText('')).toBe('')
    expect(defangRefang.run({ data: '', type: 'string' }, {}).data).toBe('')
  })

  it('round-trips a defanged URL', () => {
    const original = 'http://10.0.0.1/test'
    const defanged = defangText(original)
    expect(refangText(defanged)).toBe(original)
  })

  it('preserves unicode in surrounding text', () => {
    const result = defangRefang.run(
      { data: 'メール http://例え.jp', type: 'string' },
      { mode: 'defang' },
    )
    expect(result.error).toBeUndefined()
    expect(result.data).toContain('メール')
  })
})
