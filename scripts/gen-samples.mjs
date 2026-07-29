import { Base64 } from 'js-base64'
import CryptoJS from 'crypto-js'
import { encodePowerShellEncodedCommand } from '../src/operations/soc-tools/powershell-decode.ts'
import { xorCipher } from '../src/operations/encryption/xor.ts'
import { textToBinary } from '../src/operations/encoding/binary-text.ts'

function b64urlJson(obj) {
  return Base64.encodeURI(JSON.stringify(obj))
}

function signHs256(header, payload, secret) {
  const headerSeg = b64urlJson(header)
  const payloadSeg = b64urlJson(payload)
  const signingInput = `${headerSeg}.${payloadSeg}`
  const sig = CryptoJS.HmacSHA256(signingInput, secret)
  const b64 = CryptoJS.enc.Base64.stringify(sig)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${signingInput}.${b64}`
}

const jwt = signHs256({ alg: 'HS256', typ: 'JWT' }, { sub: 'user1', role: 'analyst' }, 'secret')
const ps = encodePowerShellEncodedCommand('Write-Host "hi"')
const xorHello = xorCipher.run(
  { data: 'hello', type: 'string' },
  { mode: 'single-byte', key: '0x05', bruteForceSingleByte: false },
).data
const xorFlag = xorCipher.run(
  { data: 'FLAG{easy_xor_test}', type: 'string' },
  { mode: 'single-byte', key: '0x42', bruteForceSingleByte: false },
).data
const binHi = textToBinary.run({ data: 'Hi', type: 'string' }, { separator: 'space' }).data

console.log(
  JSON.stringify(
    {
      jwt,
      ps,
      xorHello,
      xorFlag,
      binHi,
      b64Flag: Base64.encode('FLAG{from_base64}'),
      b64Hello: Base64.encode('Hello CipherBench'),
      mimeB64: `=?UTF-8?B?${Base64.encode('Hello 世界')}?=`,
    },
    null,
    2,
  ),
)
