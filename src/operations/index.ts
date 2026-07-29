import type { Operation } from '../core/types'
import { bruteForceChain } from './ctf-tools/brute-force-chain'
import { flagDetector } from './ctf-tools/flag-detector'
import {
  base32Decode,
  base32Encode,
  base58Decode,
  base58Encode,
  base85Decode,
  base85Encode,
} from './encoding/base-n'
import { base64Decode, base64Encode } from './encoding/base64'
import { binaryToText, textToBinary } from './encoding/binary-text'
import {
  gzipCompress,
  gzipDecompress,
  rawDeflateCompress,
  rawDeflateDecompress,
  zlibCompress,
  zlibDecompress,
} from './encoding/compression'
import { hexDecode, hexEncode } from './encoding/hex'
import {
  htmlEntityDecode,
  htmlEntityEncode,
  punycodeDecode,
  punycodeEncode,
} from './encoding/html-entities'
import {
  normalizeWhitespace,
  reverseString,
  toLowercase,
  toUppercase,
  trimWhitespace,
} from './encoding/text-transform'
import { urlDecode, urlEncode } from './encoding/url'
import { hexDump, magicBytes } from './data-format/hex-dump'
import { aesCrypt, hmacSign, rc4Crypt } from './encryption/aes-rc4-hmac'
import { rot13Caesar } from './encryption/rot13-caesar'
import { xorCipher } from './encryption/xor'
import {
  findReplace,
  jsonPathQuery,
  regexExtract,
} from './extractors/text-tools'
import { md5Hash, sha1Hash, sha256Hash } from './hashing/hashes'
import { defangRefang } from './soc-tools/defang'
import { iocExtract } from './soc-tools/ioc-extract'
import { jwtDecode } from './soc-tools/jwt-decode'
import { mimeHeaderDecode } from './soc-tools/mime-header-decode'
import { powershellDecode } from './soc-tools/powershell-decode'

/**
 * Central operation registry.
 * Adding a new operation: (1) write its file, (2) import + register here, (3) add a test.
 */
const allOperations: Operation[] = [
  base64Decode,
  base64Encode,
  base32Decode,
  base32Encode,
  base58Decode,
  base58Encode,
  base85Decode,
  base85Encode,
  hexDecode,
  hexEncode,
  urlDecode,
  urlEncode,
  htmlEntityDecode,
  htmlEntityEncode,
  punycodeDecode,
  punycodeEncode,
  textToBinary,
  binaryToText,
  reverseString,
  toUppercase,
  toLowercase,
  trimWhitespace,
  normalizeWhitespace,
  gzipDecompress,
  gzipCompress,
  zlibDecompress,
  zlibCompress,
  rawDeflateDecompress,
  rawDeflateCompress,
  hexDump,
  magicBytes,
  jsonPathQuery,
  rot13Caesar,
  xorCipher,
  aesCrypt,
  rc4Crypt,
  md5Hash,
  sha1Hash,
  sha256Hash,
  hmacSign,
  flagDetector,
  bruteForceChain,
  regexExtract,
  findReplace,
  defangRefang,
  powershellDecode,
  jwtDecode,
  iocExtract,
  mimeHeaderDecode,
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
