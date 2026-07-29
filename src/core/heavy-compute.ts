/** Run XOR single-byte brute force off the main thread when Worker is available. */
export function xorBruteForceAsync(text: string): Promise<string> {
  if (typeof Worker === 'undefined') {
    return Promise.resolve(xorBruteForceSync(text))
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./xor-brute.worker.ts', import.meta.url), {
      type: 'module',
    })
    const timer = window.setTimeout(() => {
      worker.terminate()
      reject(new Error('XOR brute force timed out'))
    }, 15_000)
    worker.onmessage = (event: MessageEvent<{ type: string; lines: string[] }>) => {
      window.clearTimeout(timer)
      worker.terminate()
      resolve(event.data.lines.join('\n'))
    }
    worker.onerror = () => {
      window.clearTimeout(timer)
      worker.terminate()
      resolve(xorBruteForceSync(text))
    }
    worker.postMessage({ type: 'xor-brute', text })
  })
}

function printableRatio(text: string): number {
  if (text.length === 0) return 0
  let printable = 0
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if ((code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13) printable++
  }
  return printable / text.length
}

function xorBruteForceSync(text: string): string {
  const candidates: { key: number; text: string; score: number }[] = []
  for (let k = 0; k < 256; k++) {
    let decoded = ''
    for (let i = 0; i < text.length; i++) {
      decoded += String.fromCharCode(text.charCodeAt(i) ^ k)
    }
    candidates.push({ key: k, text: decoded, score: printableRatio(decoded) })
  }
  candidates.sort((a, b) => b.score - a.score || a.key - b.key)
  return candidates
    .map(
      (c) =>
        `key 0x${c.key.toString(16).padStart(2, '0')} (${c.key}) score ${c.score.toFixed(3)}: ${c.text}`,
    )
    .join('\n')
}

export function hashAsync(
  algo: 'MD5' | 'SHA1' | 'SHA256',
  text: string,
): Promise<string> {
  if (typeof Worker === 'undefined' || text.length < 50_000) {
    return Promise.resolve(hashSync(algo, text))
  }
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./hash.worker.ts', import.meta.url), { type: 'module' })
    const timer = window.setTimeout(() => {
      worker.terminate()
      resolve(hashSync(algo, text))
    }, 20_000)
    worker.onmessage = (event: MessageEvent<{ digest: string; error?: string }>) => {
      window.clearTimeout(timer)
      worker.terminate()
      resolve(event.data.error ? hashSync(algo, text) : event.data.digest)
    }
    worker.onerror = () => {
      window.clearTimeout(timer)
      worker.terminate()
      resolve(hashSync(algo, text))
    }
    worker.postMessage({ type: 'hash', algo, text })
  })
}

import CryptoJS from 'crypto-js'

function hashSync(algo: 'MD5' | 'SHA1' | 'SHA256', text: string): string {
  if (algo === 'MD5') return CryptoJS.MD5(text).toString(CryptoJS.enc.Hex)
  if (algo === 'SHA1') return CryptoJS.SHA1(text).toString(CryptoJS.enc.Hex)
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex)
}
