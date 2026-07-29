import type { Operation } from '../core/types'
import { base64Decode, base64Encode } from './encoding/base64'
import { binaryToText, textToBinary } from './encoding/binary-text'
import { hexDecode, hexEncode } from './encoding/hex'
import {
  normalizeWhitespace,
  reverseString,
  toLowercase,
  toUppercase,
  trimWhitespace,
} from './encoding/text-transform'
import { urlDecode, urlEncode } from './encoding/url'
import { rot13Caesar } from './encryption/rot13-caesar'
import { xorCipher } from './encryption/xor'
import { md5Hash } from './hashing/md5'
import { sha1Hash, sha256Hash } from './hashing/sha'

/**
 * Central operation registry.
 * Adding a new operation: (1) write its file, (2) import + register here, (3) add a test.
 * The recipe engine and UI never need to change for a new op.
 */
const allOperations: Operation[] = [
  base64Decode,
  base64Encode,
  hexDecode,
  hexEncode,
  urlDecode,
  urlEncode,
  textToBinary,
  binaryToText,
  reverseString,
  toUppercase,
  toLowercase,
  trimWhitespace,
  normalizeWhitespace,
  rot13Caesar,
  xorCipher,
  md5Hash,
  sha1Hash,
  sha256Hash,
]

export const operationsMap: Map<string, Operation> = new Map(
  allOperations.map((op) => [op.id, op]),
)

export function getOperation(id: string): Operation | undefined {
  return operationsMap.get(id)
}

export function getAllOperations(): Operation[] {
  return [...allOperations]
}

export function getOperationsByCategory(
  category: Operation['category'],
): Operation[] {
  return allOperations.filter((op) => op.category === category)
}

export const OPERATION_CATEGORIES: Operation['category'][] = [
  'Encoding',
  'Encryption',
  'Hashing',
  'CTF Tools',
  'SOC Tools',
  'Data Format',
  'Extractors',
]
