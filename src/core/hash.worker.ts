/// <reference lib="webworker" />
import CryptoJS from 'crypto-js'

interface HashRequest {
  type: 'hash'
  algo: 'MD5' | 'SHA1' | 'SHA256'
  text: string
}

interface HashResponse {
  type: 'hash'
  digest: string
  error?: string
}

self.onmessage = (event: MessageEvent<HashRequest>) => {
  if (event.data.type !== 'hash') return
  try {
    const { algo, text } = event.data
    let digest: string
    if (algo === 'MD5') digest = CryptoJS.MD5(text).toString(CryptoJS.enc.Hex)
    else if (algo === 'SHA1') digest = CryptoJS.SHA1(text).toString(CryptoJS.enc.Hex)
    else digest = CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex)
    const response: HashResponse = { type: 'hash', digest }
    self.postMessage(response)
  } catch (err) {
    self.postMessage({
      type: 'hash',
      digest: '',
      error: err instanceof Error ? err.message : String(err),
    } satisfies HashResponse)
  }
}
