import { inflate, deflate, ungzip, gzip, inflateRaw, deflateRaw } from 'pako'
import type { Operation } from '../../core/types'
import { stringFromCharCodes } from '../../core/char-codes'

function textToBytes(text: string): Uint8Array {
  return Uint8Array.from(text, (c) => c.charCodeAt(0) & 0xff)
}

function bytesToText(bytes: Uint8Array): string {
  return stringFromCharCodes(bytes)
}

function tryUtf8(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  } catch {
    return bytesToText(bytes)
  }
}

function lookslikeGzip(input: string): number {
  const bytes = textToBytes(input.trim().slice(0, 4))
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) return 0.9
  // Often pasted as Base64 of gzip - leave to magic chains
  return 0
}

export const gzipDecompress: Operation = {
  id: 'gzip-decompress',
  name: 'Gunzip',
  category: 'Data Format',
  description: 'Decompress a gzip (RFC 1952) byte stream to text.',
  params: [],
  detectable: true,
  detectConfidence: lookslikeGzip,
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      const out = ungzip(textToBytes(input.data))
      return { data: tryUtf8(out), type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Gunzip failed: not a valid gzip stream' }
    }
  },
}

export const gzipCompress: Operation = {
  id: 'gzip-compress',
  name: 'Gzip',
  category: 'Data Format',
  description: 'Compress text to a gzip byte stream (binary string).',
  params: [],
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      const out = gzip(new TextEncoder().encode(input.data))
      return { data: bytesToText(out), type: 'bytes' }
    } catch {
      return { data: input.data, type: 'string', error: 'Gzip compress failed' }
    }
  },
}

export const zlibDecompress: Operation = {
  id: 'zlib-decompress',
  name: 'Zlib Inflate',
  category: 'Data Format',
  description: 'Decompress a zlib (RFC 1950) stream.',
  params: [],
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      const out = inflate(textToBytes(input.data))
      return { data: tryUtf8(out), type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Zlib inflate failed' }
    }
  },
}

export const zlibCompress: Operation = {
  id: 'zlib-compress',
  name: 'Zlib Deflate',
  category: 'Data Format',
  description: 'Compress text to a zlib stream (binary string).',
  params: [],
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      const out = deflate(new TextEncoder().encode(input.data))
      return { data: bytesToText(out), type: 'bytes' }
    } catch {
      return { data: input.data, type: 'string', error: 'Zlib deflate failed' }
    }
  },
}

export const rawDeflateDecompress: Operation = {
  id: 'raw-inflate',
  name: 'Raw Inflate',
  category: 'Data Format',
  description: 'Decompress raw deflate (RFC 1951) without zlib/gzip headers.',
  params: [],
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      const out = inflateRaw(textToBytes(input.data))
      return { data: tryUtf8(out), type: 'string' }
    } catch {
      return { data: input.data, type: 'string', error: 'Raw inflate failed' }
    }
  },
}

export const rawDeflateCompress: Operation = {
  id: 'raw-deflate',
  name: 'Raw Deflate',
  category: 'Data Format',
  description: 'Compress to raw deflate (no zlib wrapper).',
  params: [],
  run: (input) => {
    if (!input.data) return { data: '', type: 'string' }
    try {
      const out = deflateRaw(new TextEncoder().encode(input.data))
      return { data: bytesToText(out), type: 'bytes' }
    } catch {
      return { data: input.data, type: 'string', error: 'Raw deflate failed' }
    }
  },
}
