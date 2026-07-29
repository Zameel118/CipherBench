import { describe, expect, it } from 'vitest'
import {
  findReplace,
  jsonPathQuery,
  regexExtract,
} from '../../../src/operations/extractors/text-tools'
import { formatHexDump, detectMagic } from '../../../src/operations/data-format/hex-dump'
import { hexDump } from '../../../src/operations/data-format/hex-dump'

describe('text tools', () => {
  it('regex extract finds matches', () => {
    const result = regexExtract.run(
      { data: 'a1 b2 c3', type: 'string' },
      { pattern: String.raw`\d+`, flags: 'g', output: 'full' },
    )
    expect(result.data).toBe('1\n2\n3')
  })

  it('find/replace literal', () => {
    const result = findReplace.run(
      { data: 'foo.bar.foo', type: 'string' },
      { find: '.', replace: '_', mode: 'literal', flags: 'g' },
    )
    expect(result.data).toBe('foo_bar_foo')
  })

  it('json path extracts nested value', () => {
    const result = jsonPathQuery.run(
      { data: '{"user":{"name":"ctf"}}', type: 'string' },
      { path: '$.user.name' },
    )
    expect(result.data).toBe('ctf')
  })
})

describe('hex dump + magic', () => {
  it('formats a dump line', () => {
    const dump = formatHexDump('AB', 16)
    expect(dump).toContain('00000000')
    expect(dump).toContain('|AB|')
  })

  it('detects gzip magic', () => {
    const bytes = new Uint8Array([0x1f, 0x8b, 0x08, 0x00])
    expect(detectMagic(bytes)).toBe('gzip')
  })

  it('hex-dump op runs', () => {
    const result = hexDump.run({ data: 'Hi', type: 'string' }, { width: '16' })
    expect(result.data).toContain('|Hi|')
  })
})
