import { Base64 } from 'js-base64'
import type { Operation } from '../../core/types'

/**
 * PowerShell -EncodedCommand uses UTF-16LE code units, then Base64.
 * Attackers abuse this in LOLBin chains because the payload is opaque in
 * process command lines and many EDR rules focus on script contents, not the
 * encoded blob - decoding is a routine IR triage step.
 */
function utf16LeBytesToString(bytes: Uint8Array): string {
  if (bytes.length % 2 !== 0) {
    throw new Error('UTF-16LE byte length must be even')
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const codes: number[] = []
  for (let i = 0; i < bytes.length; i += 2) {
    codes.push(view.getUint16(i, true))
  }
  return String.fromCharCode(...codes)
}

function stringToUtf16LeBytes(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length * 2)
  const view = new DataView(bytes.buffer)
  for (let i = 0; i < text.length; i++) {
    view.setUint16(i * 2, text.charCodeAt(i), true)
  }
  return bytes
}

function bytesToBinaryString(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes)
}

function binaryStringToBytes(binary: string): Uint8Array {
  return Uint8Array.from(binary, (c) => c.charCodeAt(0) & 0xff)
}

export function decodePowerShellEncodedCommand(encoded: string): {
  text?: string
  error?: string
} {
  const cleaned = encoded.trim().replace(/\s+/g, '')
  if (cleaned.length === 0) {
    return { text: '' }
  }
  if (!/^[A-Za-z0-9+/]+=*$/.test(cleaned)) {
    return { error: 'Invalid PowerShell -EncodedCommand: expected UTF-16LE Base64' }
  }
  const pad = cleaned.length % 4
  if (pad === 1) {
    return { error: 'Invalid PowerShell -EncodedCommand: expected UTF-16LE Base64' }
  }
  try {
    const binary = Base64.decode(cleaned)
    const bytes = binaryStringToBytes(binary)
    if (bytes.length % 2 !== 0) {
      return { error: 'Invalid PowerShell -EncodedCommand: UTF-16LE length must be even' }
    }
    const text = utf16LeBytesToString(bytes)
    return { text }
  } catch {
    return { error: 'Invalid PowerShell -EncodedCommand: expected UTF-16LE Base64' }
  }
}

export function encodePowerShellEncodedCommand(text: string): string {
  if (text.length === 0) return ''
  const bytes = stringToUtf16LeBytes(text)
  return Base64.encode(bytesToBinaryString(bytes))
}

export const powershellDecode: Operation = {
  id: 'powershell-encoded-command',
  name: 'PowerShell -EncodedCommand',
  category: 'SOC Tools',
  description:
    'Decode or encode PowerShell -EncodedCommand blobs (UTF-16LE + Base64).',
  params: [
    {
      name: 'direction',
      type: 'select',
      default: 'decode',
      options: ['decode', 'encode'],
    },
  ],
  run: (input, params) => {
    const direction = String(params.direction ?? 'decode')
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }

    if (direction === 'encode') {
      try {
        return {
          data: encodePowerShellEncodedCommand(input.data),
          type: 'string',
        }
      } catch {
        return {
          data: input.data,
          type: 'string',
          error: 'Failed to encode PowerShell -EncodedCommand',
        }
      }
    }

    const { text, error } = decodePowerShellEncodedCommand(input.data)
    if (error) {
      return { data: input.data, type: 'string', error }
    }
    return { data: text ?? '', type: 'string' }
  },
}
