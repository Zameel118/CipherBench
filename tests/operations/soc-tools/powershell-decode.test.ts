import { describe, expect, it } from 'vitest'
import {
  decodePowerShellEncodedCommand,
  encodePowerShellEncodedCommand,
  powershellDecode,
} from '../../../src/operations/soc-tools/powershell-decode'

describe('powershell-encoded-command', () => {
  it('decodes a known UTF-16LE Base64 command', () => {
    const script = 'Write-Host "hi"'
    const encoded = encodePowerShellEncodedCommand(script)
    const { text, error } = decodePowerShellEncodedCommand(encoded)
    expect(error).toBeUndefined()
    expect(text).toBe(script)
  })

  it('handles empty input', () => {
    expect(powershellDecode.run({ data: '', type: 'string' }, { direction: 'decode' }).data).toBe(
      '',
    )
  })

  it('returns error for malformed Base64', () => {
    const result = powershellDecode.run(
      { data: '!!!', type: 'string' },
      { direction: 'decode' },
    )
    expect(result.error).toBeDefined()
  })

  it('encodes plain text to -EncodedCommand form', () => {
    const result = powershellDecode.run(
      { data: 'Get-Process', type: 'string' },
      { direction: 'encode' },
    )
    expect(result.error).toBeUndefined()
    expect(result.data.length).toBeGreaterThan(0)
    const decoded = decodePowerShellEncodedCommand(result.data)
    expect(decoded.text).toBe('Get-Process')
  })

  it('round-trips unicode', () => {
    const script = 'echo こんにちは'
    const enc = encodePowerShellEncodedCommand(script)
    expect(decodePowerShellEncodedCommand(enc).text).toBe(script)
  })
})
