import type { Operation } from '../../core/types'

function toBytes(text: string): Uint8Array {
  // File drops and binary pipes use latin1 code units (0–255). Unicode text uses UTF-8.
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 0xff) {
      return new TextEncoder().encode(text)
    }
  }
  return Uint8Array.from(text, (c) => c.charCodeAt(0) & 0xff)
}

export function formatHexDump(text: string, width = 16): string {
  const bytes = toBytes(text)
  if (bytes.length === 0) return ''
  const lines: string[] = []
  for (let i = 0; i < bytes.length; i += width) {
    const slice = bytes.subarray(i, i + width)
    const hex = [...slice]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ')
      .padEnd(width * 3 - 1, ' ')
    const ascii = [...slice]
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
      .join('')
    lines.push(`${i.toString(16).padStart(8, '0')}  ${hex}  |${ascii}|`)
  }
  return lines.join('\n')
}

export const hexDump: Operation = {
  id: 'hex-dump',
  name: 'Hex Dump',
  category: 'Data Format',
  description: 'Classic hex+ASCII dump of the input bytes (UTF-8).',
  params: [
    {
      name: 'width',
      type: 'select',
      default: '16',
      options: ['8', '16', '32'],
    },
  ],
  run: (input, params) => {
    if (!input.data) return { data: '', type: 'string' }
    const width = Number(params.width ?? 16) || 16
    return { data: formatHexDump(input.data, width), type: 'string' }
  },
}

/** Detect common magic bytes and return a short label. */
export function detectMagic(bytes: Uint8Array): string | null {
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) return 'gzip'
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b) return 'zip/office'
  if (bytes.length >= 4 && bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46)
    return 'ELF'
  if (bytes.length >= 2 && bytes[0] === 0x4d && bytes[1] === 0x5a) return 'PE/MZ'
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
    return 'PNG'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'JPEG'
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)
    return 'PDF'
  return null
}

export const magicBytes: Operation = {
  id: 'magic-bytes',
  name: 'Magic Bytes',
  category: 'Data Format',
  description: 'Identify common file magic bytes (gzip, ZIP, ELF, PE, PNG, JPEG, PDF).',
  params: [],
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    const bytes = toBytes(input.data)
    const label = detectMagic(bytes)
    if (!label) {
      return {
        data: `unknown (${bytes.length} bytes, head ${[...bytes.slice(0, 8)].map((b) => b.toString(16).padStart(2, '0')).join(' ')})`,
        type: 'string',
      }
    }
    return { data: `${label} (${bytes.length} bytes)`, type: 'string' }
  },
}
