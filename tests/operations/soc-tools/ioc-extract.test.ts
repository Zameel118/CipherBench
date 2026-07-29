import { describe, expect, it } from 'vitest'
import { extractFromText, iocExtract } from '../../../src/operations/soc-tools/ioc-extract'

describe('ioc-extract', () => {
  it('extracts and deduplicates IOCs from a blob', () => {
    const blob = `
      Contact evil@corp.com and visit https://evil.com/path
      IP 192.168.0.10 and again 192.168.0.10
      MD5 deadbeefdeadbeefdeadbeefdeadbeef
      SHA256 ${'a'.repeat(64)}
    `
    const iocs = extractFromText(blob)
    expect(iocs.emails).toEqual(['evil@corp.com'])
    expect(iocs.ipv4).toEqual(['192.168.0.10'])
    expect(iocs.urls.some((u) => u.includes('evil.com'))).toBe(true)
    expect(iocs.md5).toHaveLength(1)
    expect(iocs.sha256).toHaveLength(1)
  })

  it('handles empty input', () => {
    expect(iocExtract.run({ data: '', type: 'string' }, {}).data).toBe('')
  })

  it('formats sections for operation output', () => {
    const result = iocExtract.run(
      { data: 'user@example.com 10.0.0.1', type: 'string' },
      {},
    )
    expect(result.data).toContain('## Emails')
    expect(result.data).toContain('user@example.com')
    expect(result.data).toContain('## IPv4')
  })

  it('handles unicode surrounding text', () => {
    const result = iocExtract.run(
      { data: '通知 203.0.113.5 終了', type: 'string' },
      {},
    )
    expect(result.data).toContain('203.0.113.5')
  })
})
