import { describe, expect, it } from 'vitest'
import { Base64 } from 'js-base64'
import {
  decodeMimeEncodedWords,
  mimeHeaderDecode,
} from '../../../src/operations/soc-tools/mime-header-decode'

describe('mime-header-decode', () => {
  it('decodes Base64 encoded-word', () => {
    const b64 = Base64.encode('Hello 世界')
    const word = `=?UTF-8?B?${b64}?=`
    expect(decodeMimeEncodedWords(word)).toBe('Hello 世界')
  })

  it('decodes Q encoded-word', () => {
    const word = '=?UTF-8?Q?Hello_World?='
    expect(decodeMimeEncodedWords(word)).toBe('Hello World')
  })

  it('handles empty input', () => {
    expect(mimeHeaderDecode.run({ data: '', type: 'string' }, {}).data).toBe('')
  })

  it('decodes embedded encoded-word in header line', () => {
    const header = 'Subject: =?UTF-8?B?VGVzdA==?= alert'
    const result = mimeHeaderDecode.run({ data: header, type: 'string' }, {})
    expect(result.data).toContain('Test alert')
  })

  it('leaves plain text unchanged', () => {
    const plain = 'Subject: No encoding here'
    expect(decodeMimeEncodedWords(plain)).toBe(plain)
  })
})
